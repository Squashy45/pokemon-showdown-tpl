/**
 * TPL private admin tools
 */

import { Utils } from "../../lib";
import { Teams } from "../../sim/teams";
import type { RoomBattle, RoomBattlePlayer } from "../room-battle";

function findBattlePlayer(battle: RoomBattle, target: string): RoomBattlePlayer | null {
	const targetID = toID(target);
	if (!targetID) return null;

	return battle.players.find(player => (
		player.slot === targetID ||
		player.id === targetID ||
		toID(player.name) === targetID
	)) || null;
}

function listBattlePlayers(battle: RoomBattle) {
	return battle.players
		.map(player => `${player.slot}: ${player.name || player.id || "(empty)"}`)
		.join(", ");
}

export const commands: Chat.ChatCommands = {
	teamdump: "teampaste",
	tplteampaste: "teampaste",
	async teampaste(target, room, user) {
		this.checkCan("bypassall");

		if (!room?.battle) {
			throw new Chat.ErrorMessage(`This command can only be used in a battle room.`);
		}

		const battle = room.battle;
		target = target.trim();
		if (!target) {
			throw new Chat.ErrorMessage(
				`Usage: /teampaste [player]. Players: ${listBattlePlayers(battle)}`
			);
		}

		const player = findBattlePlayer(battle, target);
		if (!player) {
			throw new Chat.ErrorMessage(
				`Player not found. Use p1/p2/p3/p4 or a username. Players: ${listBattlePlayers(battle)}`
			);
		}
		if (!player.hasTeam) {
			throw new Chat.ErrorMessage(`${player.name || player.slot} does not have a team loaded yet.`);
		}

		const team = await battle.getPlayerTeam(player);
		if (!team) {
			throw new Chat.ErrorMessage(`Could not read ${player.name || player.slot}'s team.`);
		}

		const title = Utils.escapeHTML(`${player.name || player.slot}'s team`);
		const exported = Utils.escapeHTML(Teams.export(team).trim());
		this.popupReply(`|html|<h2>${title}</h2><pre style="white-space:pre-wrap">${exported}</pre>`);
		this.privateGlobalModAction(`${user.name} viewed ${player.name || player.slot}'s team in ${room.roomid}.`);
	},
	teampastehelp: [
		`/teampaste [player] - Shows an admin-only Pokepaste-format export of a battle player's submitted team. Requires: ~`,
		`Player can be p1, p2, p3, p4, or a username.`,
	],
};
