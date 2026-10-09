type InputBlockedBattle = RoomBattle & {
	tplBlockedInputUsers?: Set<ID>,
	tplOriginalChoose?: RoomBattle['choose'],
};

function requireBattleRoom(context: Chat.CommandContext, room: BasicRoom | null) {
	room = context.requireRoom();
	if (!room.battle || room.battle.ended) {
		throw new Chat.ErrorMessage(`This command must be used in an active battle room.`);
	}
	return room.battle as InputBlockedBattle;
}

function findPlayerBattle(targetID: ID, blockedOnly = false) {
	const matches: { battle: InputBlockedBattle, player: RoomBattlePlayer }[] = [];
	for (const room of Rooms.rooms.values()) {
		if (!room.battle || room.battle.ended) continue;
		const battle = room.battle as InputBlockedBattle;
		const player = battle.playerTable[targetID];
		if (!player || (blockedOnly && !battle.tplBlockedInputUsers?.has(targetID))) continue;
		matches.push({ battle, player });
	}
	if (!matches.length) {
		throw new Error(`${targetID} is not a player in an active battle${blockedOnly ? ' with blocked inputs' : ''}.`);
	}
	if (matches.length > 1) {
		throw new Error(`${targetID} is in multiple active battles: ${matches.map(match => match.battle.roomid).join(', ')}`);
	}
	return matches[0];
}

function blockInBattle(battle: InputBlockedBattle, targetID: ID) {
	const player = battle.playerTable[targetID];
	if (!player) throw new Error(`${targetID} is not a player in ${battle.roomid}.`);

	battle.tplBlockedInputUsers ||= new Set();
	if (battle.tplBlockedInputUsers.has(targetID)) {
		throw new Error(`${player.name}'s battle inputs are already blocked.`);
	}

	if (!battle.tplOriginalChoose) {
		const originalChoose = battle.choose;
		battle.tplOriginalChoose = originalChoose;
		battle.choose = (targetUser, data) => {
			if (battle.tplBlockedInputUsers?.has(targetUser.id)) {
				targetUser.popup(`Your battle inputs are currently blocked by a server administrator.`);
				return;
			}
			return originalChoose.call(battle, targetUser, data);
		};
	}

	battle.tplBlockedInputUsers.add(targetID);
	if (player.request.isWait === true) {
		player.request.isWait = false;
		player.request.choice = '';
		void battle.stream.write(`>${player.slot} undo`);
	}
	battle.timer.start();
	Users.get(targetID)?.disconnectAll();
	return `${player.name}'s inputs are blocked in ${battle.roomid}; their timer will continue.`;
}

function unblockInBattle(battle: InputBlockedBattle, targetID: ID) {
	const player = battle.playerTable[targetID];
	if (!player || !battle.tplBlockedInputUsers?.delete(targetID)) {
		throw new Error(`${targetID} does not have blocked inputs in ${battle.roomid}.`);
	}

	if (!battle.tplBlockedInputUsers.size && battle.tplOriginalChoose) {
		battle.choose = battle.tplOriginalChoose;
		delete battle.tplOriginalChoose;
		delete battle.tplBlockedInputUsers;
	}
	return `${player.name}'s inputs are unblocked in ${battle.roomid}.`;
}

export function blockBattleInput(target: string) {
	const targetID = toID(target);
	if (!targetID) throw new Error(`A username is required.`);
	return blockInBattle(findPlayerBattle(targetID).battle, targetID);
}

export function unblockBattleInput(target: string) {
	const targetID = toID(target);
	if (!targetID) throw new Error(`A username is required.`);
	return unblockInBattle(findPlayerBattle(targetID, true).battle, targetID);
}

export const commands: Chat.ChatCommands = {
	blockbattleinput(target, room, user) {
		this.checkCan('forcewin');
		const battle = requireBattleRoom(this, room);
		const targetID = toID(target);
		if (!targetID) return this.parse('/help blockbattleinput');

		let result: string;
		try {
			result = blockInBattle(battle, targetID);
		} catch (error) {
			throw new Chat.ErrorMessage((error as Error).message);
		}

		this.addModAction(`${result} Blocked by ${user.name}.`);
		this.modlog('BATTLEINPUTBLOCK', targetID);
	},
	blockbattleinputhelp: [
		`/blockbattleinput [username] - Blocks one player's inputs in the current battle, disconnects them, and enables the timer. Requires: ~`,
	],

	unblockbattleinput(target, room, user) {
		this.checkCan('forcewin');
		const battle = requireBattleRoom(this, room);
		const targetID = toID(target);
		if (!targetID) return this.parse('/help unblockbattleinput');

		let result: string;
		try {
			result = unblockInBattle(battle, targetID);
		} catch (error) {
			throw new Chat.ErrorMessage((error as Error).message);
		}

		this.addModAction(`${result} Unblocked by ${user.name}.`);
		this.modlog('BATTLEINPUTUNBLOCK', targetID);
	},
	unblockbattleinputhelp: [
		`/unblockbattleinput [username] - Restores one player's inputs in the current battle. Requires: ~`,
	],
};
