#!/usr/bin/env node

import readline from 'readline';

const DIVIDER = '------------------------------';
const DOUBLES_ACTIONS = 2;

function actionValue(value) {
	return value ? String(value) : '';
}

function formatAction(action = {}) {
	if (action.choice === 'switch' || action.choice === 'instaswitch') {
		return [
			`Pokemon Species: ${actionValue(action.species)}`,
			`Move Pressed:`,
			`Target:`,
			`Switching: ${actionValue(action.switchSpecies)}`,
			`Tera:`,
		].join('\n');
	}

	const move = action.choice === 'pass' ? 'Pass' : actionValue(action.move);
	return [
		`Pokemon Species: ${actionValue(action.species)}`,
		`Move Pressed: ${move}`,
		`Target: ${actionValue(action.targetSpecies)}`,
		`Switching:`,
		`Tera: ${actionValue(action.terastallize)}`,
	].join('\n');
}

function formatRecord(record) {
	const actions = Array.isArray(record.actions) ? [...record.actions] : [];
	while (actions.length < DOUBLES_ACTIONS) actions.push({});

	return [
		DIVIDER,
		`Player: ${actionValue(record.player)}`,
		`Turn: ${actionValue(record.turn)}`,
		`Battle: ${actionValue(record.roomid)}`,
		'',
		actions.slice(0, DOUBLES_ACTIONS).map(formatAction).join('\n\n'),
		DIVIDER,
		'',
	].join('\n');
}

const rl = readline.createInterface({
	input: process.stdin,
	crlfDelay: Infinity,
});

rl.on('line', line => {
	if (!line.trim()) return;
	try {
		process.stdout.write(formatRecord(JSON.parse(line)));
	} catch {
		process.stdout.write(`${DIVIDER}\nCould not parse private input line:\n${line}\n${DIVIDER}\n\n`);
	}
});
