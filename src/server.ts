import { createActor } from 'xstate';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';
import { devCompanionMachine } from './state_machine.js';
import { readFileTool, searchSymbolsTool, runTestsTool, applyPatchTool } from './tools.js';

const ALLOWED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:6274',
	'https://devcompanion-ai.vercel.app',
];

// Security note: Origin validation is defense-in-depth against DNS-rebinding.
// It is NOT a substitute for authentication. Do not rely on it alone.
function validateOrigin(origin: string | undefined): boolean {
	if (!origin) return true; // allow no-origin for non-browser clients like MCP Inspector
	return ALLOWED_ORIGINS.includes(origin);
}

const SANDBOX_ROOT = path.resolve(process.cwd(), 'sandbox');

function safeResolvePath(userPath: string): string {
	// Resolve the user-supplied path against cwd
	const resolved = path.resolve(process.cwd(), userPath);

	// Canonicalize the sandbox root (must exist)
	const realRoot = fs.realpathSync(SANDBOX_ROOT);

	let realTarget: string;
	try {
		// File exists — canonicalize it (resolves symlinks)
		realTarget = fs.realpathSync(resolved);
	} catch {
		// File doesn't exist yet — canonicalize parent, then append filename
		const parent = path.dirname(resolved);
		try {
			const realParent = fs.realpathSync(parent);
			realTarget = path.resolve(realParent, path.basename(resolved));
		} catch {
			realTarget = resolved;
		}
	}

	// Final check: must be inside sandbox
	if (!realTarget.startsWith(realRoot + path.sep) && realTarget !== realRoot) {
		throw new Error(`Path outside sandbox — rejected: ${userPath}`);
	}

	return realTarget;
}

const server = new FastMCP({
	name: 'DevCompanion-AI',
	version: '1.0.0',
});

server.addTool({
	name: 'start_fix_run',
	description: 'Initialize a new DevCompanion fix run.',
	parameters: z.object({
		repoPath: z.string(),
		issueDescription: z.string(),
	}),
	execute: async ({ repoPath, issueDescription }) => {
		void repoPath;
		void issueDescription;

		const actor = createActor(devCompanionMachine);
		actor.start();
		const { sessionId } = actor.getSnapshot().context;
		actor.stop();

		return JSON.stringify({
			status: 'success',
			sessionId,
			state: 'INTAKE',
			message: 'Fix run initialized. Ready to start.',
		});
	},
});

server.addTool({
	name: 'simulate_transition',
	description: 'Return a placeholder result for a requested state transition.',
	parameters: z.object({
		sessionId: z.string(),
		targetState: z.enum([
			'INTAKE',
			'REPRODUCE',
			'LOCALIZE',
			'PATCH',
			'VERIFY',
			'CRITIQUE',
			'VERIFIED',
			'DIAGNOSE',
			'ESCALATE',
		]),
	}),
	execute: async ({ sessionId, targetState }) =>
		JSON.stringify({
			status: 'success',
			sessionId,
			targetState,
			message: `Transition to ${targetState} requested.`,
		}),
});

server.addTool({
	name: 'read_file',
	description: 'Read a file from disk.',
	parameters: z.object({
		filePath: z.string(),
	}),
	execute: async ({ filePath }) => {
		const safePath = safeResolvePath(filePath);
		const result = readFileTool(safePath);
		return { content: [{ type: 'text', text: JSON.stringify(result) }] };
	},
});

server.addTool({
	name: 'search_symbols',
	description: 'Search for a symbol in TypeScript files.',
	parameters: z.object({
		directory: z.string(),
		symbolName: z.string(),
	}),
	execute: async ({ directory, symbolName }) => {
		const safeDir = safeResolvePath(directory);
		const result = searchSymbolsTool(safeDir, symbolName);
		return { content: [{ type: 'text', text: JSON.stringify(result) }] };
	},
});

server.addTool({
	name: 'run_tests',
	description: 'Run a fixed test suite.',
	parameters: z.object({
		testType: z.enum(['sandbox', 'typescript']),
	}),
	execute: async ({ testType }) => {
		const result = runTestsTool(testType);
		return { content: [{ type: 'text', text: JSON.stringify(result) }] };
	},
});

server.addTool({
	name: 'apply_patch',
	description: 'Replace matching file content with new content.',
	parameters: z.object({
		filePath: z.string(),
		originalContent: z.string(),
		newContent: z.string(),
	}),
	execute: async ({ filePath, originalContent, newContent }) => {
		const safePath = safeResolvePath(filePath);
		const result = applyPatchTool(safePath, originalContent, newContent);
		return { content: [{ type: 'text', text: JSON.stringify(result) }] };
	},
});

server.addTool({
	name: 'run_autonomous_fix',
	description: 'Runs the full autonomous bug-to-verified-fix loop with live progress notifications.',
	parameters: z.object({
		repoPath: z.string().describe('Path to the target repository'),
		issueDescription: z.string().describe('Description of the bug to fix'),
	}),
	execute: async ({ repoPath, issueDescription }, context) => {
		const progressMap: Record<string, number> = {
			INTAKE: 1,
			REPRODUCE: 2,
			LOCALIZE: 3,
			PATCH: 4,
			VERIFY: 5,
			CRITIQUE: 6,
			VERIFIED: 7,
			DIAGNOSE: 8,
			ESCALATE: 9,
		};

		const stateHistory: string[] = [];

		await context.reportProgress({
			progress: 1,
			total: 9,
			message: 'INTAKE: Initializing fix session...',
		});

		const actor = createActor(devCompanionMachine, {
			input: { repoPath, issueDescription },
		});

		actor.subscribe((snapshot) => {
			const stateName = String(snapshot.value);
			stateHistory.push(stateName);
			const progressNum = progressMap[stateName] || 0;

			context
				.reportProgress({
					progress: progressNum,
					total: 9,
					message: `State: ${stateName}`,
				})
				.catch((error: unknown) => console.error('Progress error:', error));
		});

		actor.start();
		actor.send({ type: 'START' });

		const finalSnapshot = await new Promise<any>((resolve) => {
			let elapsed = 0;
			const check = setInterval(() => {
				elapsed += 500;
				const state = String(actor.getSnapshot().value);
				if (
					state === 'VERIFIED' ||
					state === 'ESCALATE' ||
					state === 'DIAGNOSE' ||
					elapsed >= 10000
				) {
					clearInterval(check);
					resolve(actor.getSnapshot());
				}
			}, 500);
		});

		actor.stop();

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						status: 'success',
						finalState: String(finalSnapshot.value),
						stateHistory,
						auditLog: finalSnapshot.context.auditLog,
						sessionId: finalSnapshot.context.sessionId,
					}),
				},
			],
		};
	},
});

const app = (server as any).getHttpApp?.();
if (app && typeof app.use === 'function') {
	app.use('*', async (c: any, next: any) => {
		const origin = c.req.header('Origin');
		if (!validateOrigin(origin)) {
			return c.json({ error: 'Forbidden origin' }, 403);
		}
		return next();
	});
}

await server.start({
	transportType: 'httpStream',
	httpStream: {
		host: '0.0.0.0',
		port: parseInt(process.env.PORT || '8000', 10),
		cors: {
			origin: '*',
			methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
			allowedHeaders: [
				'Content-Type',
				'Accept',
				'Mcp-Session-Id',
				'MCP-Protocol-Version',
				'Authorization',
			],
			exposedHeaders: ['Mcp-Session-Id'],
		},
	},
});

console.log('DevCompanion MCP Server running on http://0.0.0.0:8000/mcp');
