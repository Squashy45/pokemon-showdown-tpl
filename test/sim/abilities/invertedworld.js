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
		assert(battle.field.getPseudoWeather('invertedworld'));
		assert(battle.log.includes('|-fieldstart|ability: Inverted World'));
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
		assert.false(battle.field.getPseudoWeather('invertedworld'));
		assert(battle.log.includes('|-fieldend|ability: Inverted World'));
		battle.makeChoices('move splash', 'move spore');
		assert.equal(battle.p1.active[0].status, 'slp');
	});

	it('should be Mega Malamar\'s ability after Mega Evolution', () => {
		battle = common.createBattle([[
			{ species: 'Malamar', ability: 'contrary', item: 'malamarite', moves: ['protect', 'spore'] },
		], [
			{ species: 'Ninjask', ability: 'swarm', moves: ['protect', 'spore'] },
		]]);
		battle.makeChoices('move protect mega', 'move protect');
		assert.equal(battle.p1.active[0].species.id, 'malamarmega');
		assert.equal(battle.p1.active[0].ability, 'invertedworld');
		assert(battle.field.getPseudoWeather('invertedworld'));

		battle.makeChoices('move spore', 'move spore');
		assert.equal(battle.p1.active[0].status, '');
		assert.equal(battle.p2.active[0].status, 'slp');
	});

	it('should hide the field indicator while the ability is suppressed', () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Shuckle', ability: 'invertedworld', moves: ['protect'] },
			{ species: 'Magikarp', ability: 'swiftswim', moves: ['protect'] },
		], [
			{ species: 'Ninjask', ability: 'swarm', moves: ['protect'] },
			{ species: 'Koffing', ability: 'neutralizinggas', moves: ['protect'] },
		]]);
		assert.false(battle.field.getPseudoWeather('invertedworld'));

		battle.p2.active[1].setAbility('levitate');
		assert(battle.field.getPseudoWeather('invertedworld'));
	});
});
