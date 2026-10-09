'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Battle } = require('./../../../dist/sim');
const { TeamValidator } = require('./../../../dist/sim/team-validator');

describe('Six-player Triples Multi Battle', () => {
	let battle;

	afterEach(() => battle?.destroy());

	function team(species) {
		return [{ species, ability: 'Pressure', moves: ['psychic'] }];
	}

	it('should allow Z-A Mega Evolutions', () => {
		const megaSets = [
			{ species: 'Raichu', item: 'Raichunite X', ability: 'Static', moves: ['Thunderbolt'], evs: { spe: 1 } },
			{ species: 'Froslass', item: 'Froslassite', ability: 'Cursed Body', moves: ['Shadow Ball'], evs: { spe: 1 } },
			{ species: 'Baxcalibur', item: 'Baxcalibrite', ability: 'Thermal Exchange', moves: ['Glaive Rush'], evs: { spe: 1 } },
			{ species: 'Magearna', item: 'Magearnite', ability: 'Soul-Heart', moves: ['Fleur Cannon'], evs: { spe: 1 } },
			{ species: 'Floette-Eternal', item: 'Floettite', ability: 'Flower Veil', moves: ['Light of Ruin'], evs: { spe: 1 } },
		];
		for (const set of megaSets) assert.legalTeam([set], 'gen9natdexagtriple');
	});

	it('should ban Durant and Revival Blessing', () => {
		const validator = TeamValidator.get('gen9natdexagtriple');
		const durantProblems = validator.validateTeam([
			{ species: 'Durant', ability: 'Hustle', moves: ['Iron Head'] },
		]);
		const revivalProblems = validator.validateTeam([
			{ species: 'Pawmot', ability: 'Volt Absorb', moves: ['Revival Blessing'] },
		]);

		assert.match(durantProblems.join('\n'), /Durant is banned/);
		assert.match(revivalProblems.join('\n'), /Revival Blessing is banned/);
	});

	it('should arrange and resolve choices from two teams of three trainers', () => {
		battle = common.createBattle({ formatid: 'gen9natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);

		assert.equal(battle.sides.length, 6);
		assert.equal(battle.activePerHalf, 3);
		assert(battle.log.includes('|gametype|multi6'));
		assert.equal(battle.p1.foe, battle.p6);
		assert.equal(battle.p3.foe, battle.p4);
		assert.equal(battle.p5.foe, battle.p2);
		battle.makeChoices();
		assert.equal(battle.p1.activeTeam().length, 3);
		assert.equal(battle.p1.foes().length, 3);

		battle.makeChoices('move 1 +3', 'move 1 +3', 'move 1 +2', 'move 1 +2', 'move 1 +1', 'move 1 +1');
		assert.equal(battle.turn, 2);
	});

	it('should require an explicit target for single-target moves', () => {
		battle = common.createBattle({ formatid: 'gen9natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);
		battle.makeChoices();

		assert.throws(() => battle.p1.choose('move 1'), /Psychic needs a target/);
		assert.doesNotThrow(() => battle.p1.choose('move 1 +3'));
	});

	it('should preserve the room ID used by private input records', () => {
		battle = new Battle({
			formatid: 'gen9natdexagtriple',
			roomid: 'battle-gen9natdexagtriple-test',
			p1: { team: team('Mew') },
			p2: { team: team('Mewtwo') },
			p3: { team: team('Celebi') },
			p4: { team: team('Jirachi') },
			p5: { team: team('Victini') },
			p6: { team: team('Deoxys') },
		});

		assert.equal(battle.id, 'battle-gen9natdexagtriple-test');
		assert.match(battle.inputLog.join('\n'), /"roomid":"battle-gen9natdexagtriple-test"/);
	});

	it('should preserve the existing four-player Multi layout', () => {
		battle = common.createBattle({ gameType: 'multi' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'), team('Jirachi'),
		]);

		assert.equal(battle.sides.length, 4);
		assert.equal(battle.activePerHalf, 2);
		assert.equal(battle.p1.foe, battle.p4);
		assert.equal(battle.p2.foe, battle.p3);
		assert.deepEqual(battle.p1.allySides, [battle.p3]);
	});

	it(`should move a team's last trainer to the center position`, () => {
		battle = common.createBattle({ formatid: 'gen9natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);
		battle.makeChoices();

		battle.p1.active[0].faint();
		battle.p3.active[0].faint();
		battle.faintMessages();

		assert.equal(battle.p1.pokemonLeft, 0);
		assert.equal(battle.p3.pokemonLeft, 0);
		assert.equal(battle.p5.multiPosition, 1);
		assert(battle.log.some(line => line.startsWith('|swap|p5c: Victini|1')));
		const recenterCount = battle.log.filter(line => line.startsWith('|swap|p5c: Victini|1')).length;
		battle.p2.active[0].faint();
		battle.faintMessages();
		assert.equal(
			battle.log.filter(line => line.startsWith('|swap|p5c: Victini|1')).length,
			recenterCount,
			'related faint processing should not emit duplicate recenter messages'
		);
		assert.equal(battle.p5.active[0].getLocOf(battle.p5.active[0]), -2);
		assert.equal(battle.p5.active[0].getLocOf(battle.p2.active[0]), 1);
		assert.equal(battle.p5.active[0].getLocOf(battle.p4.active[0]), 2);
		assert.equal(battle.p5.active[0].getLocOf(battle.p6.active[0]), 3);
	});

	it('should include both teammates in every player request', () => {
		battle = common.createBattle({ formatid: 'gen9natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);
		battle.makeChoices();

		assert.deepEqual(battle.p1.activeRequest.allies.map(ally => ally.id), ['p3', 'p5']);
		assert.deepEqual(battle.p6.activeRequest.allies.map(ally => ally.id), ['p2', 'p4']);
	});

	it('should preserve six-player state through serialization', () => {
		battle = common.createBattle({ formatid: 'gen9natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);
		battle.makeChoices();

		const restored = battle.constructor.fromJSON(battle.toJSON());
		battle.destroy();
		battle = restored;

		assert.equal(battle.sides.length, 6);
		assert.equal(battle.p1.allySides.length, 2);
		assert.equal(battle.p5.multiPosition, 2);
	});
});
