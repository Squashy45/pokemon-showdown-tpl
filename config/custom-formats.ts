export const Formats = [
	{
		section: "Draft League",
		column: 1,
	},

	{
		name: "[Gen 9] TPL Random Bullshit Ladder",
		desc: "TPL doubles AG ladder using one randomly selected preset team.",
		mod: 'gen9',
		gameType: 'doubles',
		team: 'randomTplRandomBullshit',
		bestOfDefault: true,
		ruleset: ['Standard AG', 'NatDex Mod', 'Tera Type Preview'],
	},

	{
		name: "[Gen 9] 2026 TPL Draft League",
		mod: 'gen9',
		gameType: 'multi',
		ruleset: [
			'Standard AG',
			'NatDex Mod',
			'Tera Type Preview',
		],
	},

	{
		// These name markers select the matching legality table in the official web client.
		name: "[Gen 9 Champions] NatDex October TPL Draft League",
		mod: 'gen9',
		gameType: 'doubles',
		ruleset: [
			'Standard AG',
			'NatDex Mod',
			'OM Unobtainable Moves',
			'Tera Type Preview',
			'Item Clause = 1',
		],
		checkCanLearn(move, species, setSources, set) {
			const TeamValidator: typeof import('../sim/team-validator').TeamValidator =
				require('../sim/team-validator').TeamValidator;
			const champions = TeamValidator.get('gen9championsdraft');
			const championsSpecies = champions.dex.species.get(species.id);
			const championsMove = champions.dex.moves.get(move.id);
			if (!championsSpecies.exists || !championsMove.exists) {
				return this.checkCanLearn(move, species, setSources, set);
			}
			return champions.checkCanLearn(
				championsMove,
				championsSpecies,
				champions.allSources(championsSpecies),
				set
			);
		},
		onModifyMovePriority: -1,
		onModifyMove(move, pokemon) {
			const baseMove = this.dex.moves.get(move.id);
			if (pokemon.hasAbility('unseenfist') && move.flags['contact'] && baseMove.flags['protect']) {
				move.flags['protect'] = 1;
			}
		},
		onHitProtect(source, target, move) {
			if (source.hasAbility('unseenfist') && move.flags['contact']) {
				target.getMoveHitData(move).bypassProtect = source.getAbility();
				return false;
			}
		},
		unbanlist: [
			'Raichu-Mega-X',
			'Raichunite X',
			'Raichu-Mega-Y',
			'Raichunite Y',
			'Clefable-Mega',
			'Clefablite',
			'Victreebel-Mega',
			'Victreebelite',
			'Starmie-Mega',
			'Starminite',
			'Dragonite-Mega',
			'Dragoninite',
			'Meganium-Mega',
			'Meganiumite',
			'Feraligatr-Mega',
			'Feraligite',
			'Skarmory-Mega',
			'Skarmorite',
			'Chimecho-Mega',
			'Chimechite',
			'Absol-Mega-Z',
			'Absolite Z',
			'Staraptor-Mega',
			'Staraptite',
			'Garchomp-Mega-Z',
			'Garchompite Z',
			'Lucario-Mega-Z',
			'Lucarionite Z',
			'Froslass-Mega',
			'Froslassite',
			'Heatran-Mega',
			'Heatranite',
			'Darkrai-Mega',
			'Darkranite',
			'Emboar-Mega',
			'Emboarite',
			'Excadrill-Mega',
			'Excadrite',
			'Scolipede-Mega',
			'Scolipite',
			'Scrafty-Mega',
			'Scraftinite',
			'Eelektross-Mega',
			'Eelektrossite',
			'Chandelure-Mega',
			'Chandelurite',
			'Golurk-Mega',
			'Golurkite',
			'Chesnaught-Mega',
			'Chesnaughtite',
			'Delphox-Mega',
			'Delphoxite',
			'Greninja-Mega',
			'Greninjite',
			'Pyroar-Mega',
			'Pyroarite',
			'Floette-Mega',
			'Floettite',
			'Meowstic-M-Mega',
			'Meowstic-F-Mega',
			'Meowsticite',
			'Malamar-Mega',
			'Malamarite',
			'Barbaracle-Mega',
			'Barbaracite',
			'Dragalge-Mega',
			'Dragalgite',
			'Hawlucha-Mega',
			'Hawluchanite',
			'Zygarde-Mega',
			'Zygardite',
			'Crabominable-Mega',
			'Crabominite',
			'Golisopod-Mega',
			'Golisopite',
			'Drampa-Mega',
			'Drampanite',
			'Magearna-Mega',
			'Magearnite',
			'Zeraora-Mega',
			'Zeraorite',
			'Falinks-Mega',
			'Falinksite',
			'Scovillain-Mega',
			'Scovillainite',
			'Glimmora-Mega',
			'Glimmoranite',
			'Baxcalibur-Mega',
			'Baxcalibrite',
		],
	},
];
