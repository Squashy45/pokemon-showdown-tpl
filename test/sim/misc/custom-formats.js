'use strict';

const assert = require('./../../assert');

describe('Custom formats', () => {
	it('should allow Eternal Floette in October TPL Draft League', () => {
		assert.legalTeam([
			{ species: 'Floette-Eternal', ability: 'Flower Veil', moves: ['Light of Ruin'], evs: { spe: 1 } },
			{ species: 'Pikachu', ability: 'Static', moves: ['Thunderbolt'], evs: { spe: 1 } },
		], 'gen9natdexoctobertpldraftleague');
	});
});
