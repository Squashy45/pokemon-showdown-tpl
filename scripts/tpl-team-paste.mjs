#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logPath = path.join(root, 'logs', 'private-teams.jsonl');

function toID(text) {
	return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function usage() {
	console.log([
		'Usage:',
		'  node scripts/tpl-team-paste.mjs <battle-roomid> <player>',
		'',
		'Examples:',
		'  node scripts/tpl-team-paste.mjs battle-gen9customgame-123 p1',
		'  node scripts/tpl-team-paste.mjs battle-gen9customgame-123 "King Thomas"',
		'',
		'Use --list to show recent stored battle rooms.',
	].join('\n'));
}

function readRecords() {
	if (!fs.existsSync(logPath)) {
		throw new Error(`No private team log found at ${logPath}. Start a new battle after deploying this tool first.`);
	}
	const lines = fs.readFileSync(logPath, 'utf8').split(/\r?\n/).filter(Boolean);
	return lines.flatMap(line => {
		try {
			return [JSON.parse(line)];
		} catch {
			return [];
		}
	});
}

function listRecent(records) {
	const seen = new Set();
	const rooms = [];
	for (const record of [...records].reverse()) {
		if (seen.has(record.roomid)) continue;
		seen.add(record.roomid);
		rooms.push(record);
		if (rooms.length >= 20) break;
	}
	for (const record of rooms) {
		console.log(`${record.time}\t${record.roomid}\t${record.format}`);
	}
}

const [roomid, player] = process.argv.slice(2);
if (!roomid || roomid === '--help' || roomid === '-h') {
	usage();
	process.exit(roomid ? 0 : 1);
}

const records = readRecords();
if (roomid === '--list') {
	listRecent(records);
	process.exit(0);
}

if (!player) {
	usage();
	process.exit(1);
}

const playerID = toID(player);
const match = [...records].reverse().find(record => (
	record.roomid === roomid &&
	(record.slot === playerID || toID(record.userid) === playerID || toID(record.player) === playerID)
));

if (!match) {
	console.error(`No team paste found for ${player} in ${roomid}.`);
	console.error(`Try: node scripts/tpl-team-paste.mjs --list`);
	process.exit(1);
}

console.log(`# ${match.player || match.slot} (${match.slot})`);
console.log(`# ${match.roomid}`);
console.log('');
console.log(match.paste);
