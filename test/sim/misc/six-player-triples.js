'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Six-player Triples Multi Battle', () => {
	let battle;

	afterEach(() => battle?.destroy());

	function team(species) {
		return [{ species, ability: 'Pressure', moves: ['psychic'] }];
	}

	it('should arrange and resolve choices from two teams of three trainers', () => {
		battle = common.createBattle({ formatid: 'natdexagtriple' }, [
			team('Mew'), team('Mewtwo'), team('Celebi'),
			team('Jirachi'), team('Victini'), team('Deoxys'),
		]);

		assert.equal(battle.sides.length, 6);
		assert.equal(battle.activePerHalf, 3);
		assert.equal(battle.p1.foe, battle.p6);
		assert.equal(battle.p3.foe, battle.p4);
		assert.equal(battle.p5.foe, battle.p2);
		battle.makeChoices();
		assert.equal(battle.p1.activeTeam().length, 3);
		assert.equal(battle.p1.foes().length, 3);

		battle.makeChoices('move 1', 'move 1', 'move 1', 'move 1', 'move 1', 'move 1');
		assert.equal(battle.turn, 2);
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
		battle = common.createBattle({ formatid: 'natdexagtriple' }, [
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
		assert.equal(battle.p5.active[0].getLocOf(battle.p5.active[0]), -2);
		assert.equal(battle.p5.active[0].getLocOf(battle.p2.active[0]), 1);
		assert.equal(battle.p5.active[0].getLocOf(battle.p4.active[0]), 2);
		assert.equal(battle.p5.active[0].getLocOf(battle.p6.active[0]), 3);
	});

	it('should preserve six-player state through serialization', () => {
		battle = common.createBattle({ formatid: 'natdexagtriple' }, [
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
