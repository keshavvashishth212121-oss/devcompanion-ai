import { NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

export async function POST() {
	try {
		const sandboxPath = path.join(
			process.cwd(),
			'..',
			'sandbox',
			'src',
			'buggy_code.ts',
		);
		const buggyContent = `export function addNumbers(a: number, b: number): number {
  // BUG: Should be a + b, not a - b
  return a - b;
}`;

		try {
			writeFileSync(sandboxPath, buggyContent, 'utf-8');
		} catch (error) {
			console.warn('Unable to reset sandbox file:', error);
		}

		const client = new Client({
			name: 'devcompanion-dashboard',
			version: '1.0.0',
		});
		const transport = new StreamableHTTPClientTransport(
			new URL('http://localhost:8000/mcp'),
		);

		await client.connect(transport);
		const result = await client.callTool({
			name: 'run_autonomous_fix',
			arguments: {
				repoPath: './sandbox',
				issueDescription: 'addNumbers returns wrong result instead of sum',
			},
		});
		await client.close();

		const content = result.content;
		if (!Array.isArray(content) || content.length === 0 || !('text' in content[0])) {
			throw new Error('MCP tool returned no JSON text content');
		}

		const parsedResult = JSON.parse(content[0].text);
		let fixedContent = '';
		try {
			fixedContent = readFileSync(sandboxPath, 'utf-8');
		} catch (error) {
			console.warn('Unable to read fixed sandbox file:', error);
			fixedContent =
				'// File not accessible in cloud deployment. Fix is applied on the MCP server.';
		}

		return NextResponse.json({
			success: true,
			data: parsedResult,
			before: buggyContent,
			after:
				fixedContent ||
				'// File not accessible in cloud deployment. Fix is applied on the MCP server.',
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: String(error) },
			{ status: 500 },
		);
	}
}