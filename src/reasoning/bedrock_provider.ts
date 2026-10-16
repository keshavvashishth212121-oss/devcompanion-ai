import {
	BedrockRuntimeClient,
	InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

export interface CritiqueInput {
	diff: string;
	bugDescription: string;
	testOutput: string;
}

export interface CritiqueResult {
	approved: boolean;
	issues: string[];
	confidence: number;
	model: string;
	latencyMs: number;
}

interface BedrockResponse {
	output?: {
		message?: {
			content?: Array<{ text?: string }>;
		};
	};
}

const TIMEOUT_MS = 30_000;
const RETRY_BACKOFFS_MS = [500, 1_000];

function extractJson(text: string): string {
	const withoutFence = text
		.trim()
		.replace(/^```(?:json)?\s*/i, '')
		.replace(/\s*```$/i, '')
		.trim();

	const objectStart = withoutFence.indexOf('{');
	const objectEnd = withoutFence.lastIndexOf('}');
	if (objectStart === -1 || objectEnd < objectStart) {
		throw new Error('Bedrock response did not contain a JSON object');
	}

	return withoutFence.slice(objectStart, objectEnd + 1);
}

function parseCritiqueResponse(text: string): {
	approved: boolean;
	issues: string[];
	confidence: number;
} {
	const parsed: unknown = JSON.parse(extractJson(text));

	if (typeof parsed !== 'object' || parsed === null) {
		throw new Error('Bedrock critique response must be an object');
	}

	const response = parsed as Record<string, unknown>;
	if (
		typeof response.approved !== 'boolean' ||
		!Array.isArray(response.issues) ||
		!response.issues.every((issue) => typeof issue === 'string') ||
		typeof response.confidence !== 'number'
	) {
		throw new Error(
			'Bedrock critique response must contain approved, issues, and confidence with valid types',
		);
	}

	return {
		approved: response.approved,
		issues: response.issues,
		confidence: response.confidence,
	};
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	let timeout: ReturnType<typeof setTimeout>;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeout = setTimeout(
			() => reject(new Error(`Bedrock request timed out after ${timeoutMs}ms`)),
			timeoutMs,
		);
	});

	return Promise.race([promise, timeoutPromise]).finally(() =>
		clearTimeout(timeout),
	);
}

export class BedrockNovaProvider {
	private readonly region: string;
	private readonly modelId: string;
	private readonly client: BedrockRuntimeClient;

	public constructor() {
		this.region = process.env.AWS_REGION || 'us-east-1';
		this.modelId =
			process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
		this.client = new BedrockRuntimeClient({ region: this.region });
	}

	public async critique(input: CritiqueInput): Promise<CritiqueResult> {
		const prompt = `You are a strict code reviewer. Given:
Bug: ${input.bugDescription}
Diff: ${input.diff}
Test output: ${input.testOutput}

Decide if the fix is correct. Respond ONLY with valid JSON matching this schema:
{"approved": boolean, "issues": [strings], "confidence": number between 0 and 1}
No markdown, no preamble.`;
		const body = JSON.stringify({
			messages: [{ role: 'user', content: [{ text: prompt }] }],
			inferenceConfig: { maxTokens: 500, temperature: 0.2 },
		});
		const startedAt = Date.now();
		let lastError: unknown;

		for (let attempt = 0; attempt <= RETRY_BACKOFFS_MS.length; attempt += 1) {
			try {
				const response = await withTimeout(
					this.client.send(
						new InvokeModelCommand({
							modelId: this.modelId,
							body,
							contentType: 'application/json',
							accept: 'application/json',
						}),
					),
					TIMEOUT_MS,
				);
				if (!response.body) {
					throw new Error('Bedrock response body was empty');
				}

				const responseBody = JSON.parse(
					new TextDecoder().decode(response.body),
				) as BedrockResponse;
				const text = responseBody.output?.message?.content?.[0]?.text;
				if (typeof text !== 'string') {
					throw new Error('Bedrock response did not contain critique text');
				}

				const critique = parseCritiqueResponse(text);
				return {
					...critique,
					model: this.modelId,
					latencyMs: Date.now() - startedAt,
				};
			} catch (error: unknown) {
				lastError = error;
				const backoff = RETRY_BACKOFFS_MS[attempt];
				if (backoff === undefined) {
					break;
				}
				await new Promise<void>((resolve) => setTimeout(resolve, backoff));
			}
		}

		throw lastError instanceof Error
			? lastError
			: new Error('Bedrock critique failed');
	}
}

export class MockFallbackProvider {
	public async critique(_input: CritiqueInput): Promise<CritiqueResult> {
		console.log('[bedrock] No credentials — using mock');
		return {
			approved: true,
			issues: [],
			confidence: 0.5,
			model: 'mock',
			latencyMs: 0,
		};
	}
}

export function getCritiqueProvider(): BedrockNovaProvider | MockFallbackProvider {
	if (
		!process.env.AWS_ACCESS_KEY_ID ||
		!process.env.AWS_SECRET_ACCESS_KEY
	) {
		return new MockFallbackProvider();
	}
	return new BedrockNovaProvider();
}
