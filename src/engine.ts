import { createActor } from 'xstate';
import devCompanionMachine from './state_machine.js';

const wait = (milliseconds: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

async function runAutonomousLoop(): Promise<void> {
	const actor = createActor(devCompanionMachine);

	actor.subscribe((snapshot) => {
		console.log(`[FSM] State: ${snapshot.value}`);

		const auditLog = snapshot.context.auditLog;
		const latestAuditLogEntry = auditLog[auditLog.length - 1];
		if (latestAuditLogEntry) {
			console.log('[FSM] Audit log:', latestAuditLogEntry);
		}
	});

	actor.start();
	actor.send({ type: 'START' });

	await wait(15_000);

	console.log('Final state: ' + actor.getSnapshot().value);
	actor.stop();
}

runAutonomousLoop().catch((error: unknown) => {
	console.error('Autonomous loop failed:', error);
});