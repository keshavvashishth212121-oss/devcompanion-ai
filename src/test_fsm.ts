import { createActor } from 'xstate';
import devCompanionMachine from './state_machine.js';

const logState = (state: string): void => {
	console.log(state);
};

const runSuccessPath = (): void => {
	const actor = createActor(devCompanionMachine);

	actor.subscribe((snapshot) => {
		logState(String(snapshot.value));
	});

	actor.start();
	actor.send({ type: 'START' });
	actor.send({ type: 'REPRODUCE_SUCCESS' });
	actor.send({ type: 'LOCALIZE_SUCCESS' });
	actor.send({ type: 'PATCH_SUCCESS' });
	actor.send({ type: 'VERIFY_SUCCESS' });
	actor.send({ type: 'CRITIQUE_APPROVED' });

	if (actor.getSnapshot().value !== 'VERIFIED') {
		throw new Error(`Expected VERIFIED, got ${String(actor.getSnapshot().value)}`);
	}

	console.log('Test passed: reached VERIFIED');
	actor.stop();
};

const runFailurePath = (): void => {
	const actor = createActor(devCompanionMachine);

	actor.subscribe((snapshot) => {
		logState(String(snapshot.value));
	});

	actor.start();
	actor.send({ type: 'START' });
	actor.send({ type: 'FAILURE' });

	if (actor.getSnapshot().value !== 'DIAGNOSE') {
		throw new Error(`Expected DIAGNOSE, got ${String(actor.getSnapshot().value)}`);
	}

	actor.stop();
};

runSuccessPath();
runFailurePath();
