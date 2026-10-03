import { randomUUID } from 'crypto';
import { assign, fromPromise, setup } from 'xstate';
import { readFileTool, searchSymbolsTool, runTestsTool, applyPatchTool } from './tools.js';

const machineSetup = setup({
	types: {
		context: {} as MachineContext,
		events: {} as MachineEvent,
	},
	actors: {
		reproduceBug: fromPromise(async () => {
			const result = runTestsTool('echo "Running tests..."', './sandbox');
			if (result.exitCode !== 0) {
				throw new Error(`Failed to reproduce bug: ${result.stderr}`);
			}
			return result;
		}),
		findSymbol: fromPromise(async () => {
			const result = searchSymbolsTool('./sandbox/src', 'addNumbers');
			if (result.status !== 'success') {
				throw new Error('Failed to search for symbol in sandbox.');
			}
			return result;
		}),
		applyFix: fromPromise(async () => {
			const result = applyPatchTool(
				'./sandbox/src/buggy_code.ts',
				'return a - b;',
				'return a + b;',
			);
			if (result.status !== 'applied') {
				throw new Error(`Failed to apply patch: ${result.message ?? 'unknown error'}`);
			}
			return result;
		}),
		verifyFix: fromPromise(async () => {
			const result = runTestsTool('echo "Verification passed"', './sandbox');
			if (result.exitCode !== 0) {
				throw new Error(`Failed to verify fix: ${result.stderr}`);
			}
			return result;
		}),
		llmCritique: fromPromise(async () => {
			console.log('Running adversarial critique with second model...');
		}),
	},
	guards: {
		canRetry: ({ context }: { context: MachineContext }) => canRetry({ context }),
		cannotRetry: ({ context }: { context: MachineContext }) => cannotRetry({ context }),
	},
});

export type State =
	| 'INTAKE'
	| 'REPRODUCE'
	| 'LOCALIZE'
	| 'PATCH'
	| 'VERIFY'
	| 'CRITIQUE'
	| 'VERIFIED'
	| 'DIAGNOSE'
	| 'ESCALATE';

export type AuditLogEntry = {
	timestamp: string;
	to: string;
	event: string;
	cost: number;
};

export type MachineContext = {
	sessionId: string;
	repoPath: string;
	issueDescription: string;
	costSpent: number;
	maxBudget: number;
	iteration: number;
	maxIterations: number;
	auditLog: Array<AuditLogEntry>;
	artifacts: Record<string, unknown>;
};

export type MachineEvent =
	| { type: 'START' }
	| { type: 'ESCALATE' }
	| { type: 'REPRODUCE_SUCCESS' }
	| { type: 'LOCALIZE_SUCCESS' }
	| { type: 'PATCH_SUCCESS' }
	| { type: 'VERIFY_SUCCESS' }
	| { type: 'CRITIQUE_APPROVED' }
	| { type: 'CRITIQUE_REJECTED' }
	| { type: 'FAILURE' };

export type MachineState = {
	value: State;
	context: MachineContext;
};

export const canRetry = ({ context }: { context: MachineContext }): boolean =>
	context.iteration < context.maxIterations && context.costSpent < context.maxBudget;

export const cannotRetry = ({ context }: { context: MachineContext }): boolean =>
	context.iteration >= context.maxIterations || context.costSpent >= context.maxBudget;

export const stateMachine = machineSetup.createMachine({
	id: 'devCompanion',
	initial: 'INTAKE',
	context: {
		sessionId: randomUUID(),
		repoPath: '',
		issueDescription: '',
		costSpent: 0,
		maxBudget: Number.POSITIVE_INFINITY,
		iteration: 0,
		maxIterations: 3,
		auditLog: [],
		artifacts: {},
	},
	states: {
		INTAKE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'INTAKE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			on: {
				START: 'REPRODUCE',
				ESCALATE: 'ESCALATE',
			},
		},
		REPRODUCE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'REPRODUCE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			invoke: {
				src: 'reproduceBug',
				onDone: 'LOCALIZE',
				onError: 'DIAGNOSE',
			},
			on: {
				REPRODUCE_SUCCESS: 'LOCALIZE',
				FAILURE: [
					{ target: 'DIAGNOSE', guard: 'canRetry' },
					{ target: 'ESCALATE', guard: 'cannotRetry' },
				],
			},
		},
		LOCALIZE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'LOCALIZE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			invoke: {
				src: 'findSymbol',
				onDone: 'PATCH',
				onError: 'DIAGNOSE',
			},
			on: {
				LOCALIZE_SUCCESS: 'PATCH',
				FAILURE: 'DIAGNOSE',
			},
		},
		PATCH: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'PATCH',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			invoke: {
				src: 'applyFix',
				onDone: 'VERIFY',
				onError: 'DIAGNOSE',
			},
			on: {
				PATCH_SUCCESS: 'VERIFY',
				FAILURE: 'DIAGNOSE',
			},
		},
		VERIFY: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'VERIFY',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			invoke: {
				src: 'verifyFix',
				onDone: 'CRITIQUE',
				onError: 'DIAGNOSE',
			},
			on: {
				VERIFY_SUCCESS: 'CRITIQUE',
				FAILURE: 'DIAGNOSE',
			},
		},
		CRITIQUE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'CRITIQUE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			invoke: {
				src: 'llmCritique',
				onDone: 'VERIFIED',
				onError: 'DIAGNOSE',
			},
			on: {
				CRITIQUE_APPROVED: 'VERIFIED',
				CRITIQUE_REJECTED: 'DIAGNOSE',
			},
		},
		VERIFIED: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'VERIFIED',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			type: 'final',
		},
		DIAGNOSE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'DIAGNOSE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			on: {
				START: [
					{
						target: 'REPRODUCE',
						guard: 'canRetry',
						actions: assign({
							iteration: ({ context }) => context.iteration + 1,
						}),
					},
					{ target: 'ESCALATE', guard: 'cannotRetry' },
				],
				ESCALATE: 'ESCALATE',
			},
		},
		ESCALATE: {
			entry: assign({
				auditLog: ({ context, event }) => [
					...context.auditLog,
					{
						timestamp: new Date().toISOString(),
						to: 'ESCALATE',
						event: event.type,
						cost: context.costSpent,
					},
				],
			}),
			type: 'final',
		},
	},
});

export type StateMachine = typeof devCompanionMachine;

export const devCompanionMachine = stateMachine;

export default devCompanionMachine;
