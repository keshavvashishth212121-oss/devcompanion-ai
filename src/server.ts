import { createActor } from 'xstate';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { devCompanionMachine } from './state_machine.js';
import { readFileTool, searchSymbolsTool, runTestsTool, applyPatchTool } from './tools.js';

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
		const result = readFileTool(filePath);
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
		const result = searchSymbolsTool(directory, symbolName);
		return { content: [{ type: 'text', text: JSON.stringify(result) }] };
	},
});

server.addTool({
	name: 'run_tests',
	description: 'Run a test command.',
	parameters: z.object({
		command: z.string(),
		workingDir: z.string().optional(),
	}),
	execute: async ({ command, workingDir }) => {
		const result = runTestsTool(command, workingDir);
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
		const result = applyPatchTool(filePath, originalContent, newContent);
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

await server.start({
	transportType: 'httpStream',
	httpStream: {
		host: '0.0.0.0',
		port: 8000,
	},
});

console.log('DevCompanion MCP Server running on http://0.0.0.0:8000/mcp');
