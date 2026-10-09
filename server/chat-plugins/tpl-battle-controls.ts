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

export const commands: Chat.ChatCommands = {
	blockbattleinput(target, room, user) {
		this.checkCan('forcewin');
		const battle = requireBattleRoom(this, room);
		const targetID = toID(target);
		if (!targetID) return this.parse('/help blockbattleinput');

		const player = battle.playerTable[targetID];
		if (!player) {
			throw new Chat.ErrorMessage(`User '${target}' is not a player in this battle.`);
		}

		battle.tplBlockedInputUsers ||= new Set();
		if (battle.tplBlockedInputUsers.has(targetID)) {
			throw new Chat.ErrorMessage(`${player.name}'s battle inputs are already blocked.`);
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

		this.addModAction(`${player.name}'s battle inputs were blocked by ${user.name}; their timer will continue.`);
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

		const player = battle.playerTable[targetID];
		if (!player || !battle.tplBlockedInputUsers?.delete(targetID)) {
			throw new Chat.ErrorMessage(`User '${target}' does not have blocked battle inputs.`);
		}

		if (!battle.tplBlockedInputUsers.size && battle.tplOriginalChoose) {
			battle.choose = battle.tplOriginalChoose;
			delete battle.tplOriginalChoose;
			delete battle.tplBlockedInputUsers;
		}

		this.addModAction(`${player.name}'s battle inputs were unblocked by ${user.name}.`);
		this.modlog('BATTLEINPUTUNBLOCK', targetID);
	},
	unblockbattleinputhelp: [
		`/unblockbattleinput [username] - Restores one player's inputs in the current battle. Requires: ~`,
	],
};
