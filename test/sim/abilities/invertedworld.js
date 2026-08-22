'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Inverted World', () => {
	afterEach(() => {
		battle.destroy();
	});

	it('should reverse Speed order while its holder is active', () => {
		battle = common.createBattle([[
			{ species: 'Shuckle', ability: 'invertedworld', moves: ['spore'] },
		], [
			{ species: 'Ninjask', ability: 'swarm', moves: ['spore'] },
		]]);
		battle.makeChoices('move spore', 'move spore');
		assert.equal(battle.p1.active[0].status, '');
		assert.equal(battle.p2.active[0].status, 'slp');
	});

	it('should restore normal Speed order while Trick Room is active', () => {
		battle = common.createBattle([[
			{ species: 'Shuckle', ability: 'invertedworld', moves: ['spore', 'trickroom'] },
		], [
			{ species: 'Ninjask', ability: 'swarm', moves: ['spore', 'sleeptalk'] },
		]]);
		battle.makeChoices('move trickroom', 'move sleeptalk');
		battle.makeChoices('move spore', 'move spore');
		assert.equal(battle.p1.active[0].status, 'slp');
		assert.equal(battle.p2.active[0].status, '');
	});

	it('should stop reversing Speed order when its holder leaves the field', () => {
		battle = common.createBattle([[
			{ species: 'Shuckle', ability: 'invertedworld', moves: ['spore'] },
			{ species: 'Magikarp', ability: 'swiftswim', moves: ['splash'] },
		], [
			{ species: 'Ninjask', ability: 'swarm', moves: ['spore'] },
		]]);
		battle.makeChoices('switch 2', 'move spore');
		assert.equal(battle.p1.active[0].species.id, 'magikarp');
		battle.makeChoices('move splash', 'move spore');
		assert.equal(battle.p1.active[0].status, 'slp');
	});
});
