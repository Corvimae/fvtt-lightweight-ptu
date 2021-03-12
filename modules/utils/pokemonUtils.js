export const LEVEL_THRESHOLDS = [
  0,     10,    20,    30,    40,    50,    60,    70,    80,    90,
  110,   135,   160,   190,   220,   250,   285,   320,   360,   400,
  460,   530,   600,   670,   745,   820,   900,   990,   1075,  1165,
  1260,  1355,  1455,  1555,  1660,  1770,  1880,  1995,  2110,  2230,
  2355,  2480,  2610,  2740,  2875,  3015,  3155,  3300,  3445,  3645,
  3850,  4060,  4270,  4485,  4705,  4930,  5160,  5390,  5625,  5865,
  6110,  6360,  6610,  6865,  7125,  7390,  7660,  7925,  8205,  8485,
  8770,  9060,  9350,  9645,  9945,  10250, 10560, 10870, 11185, 11505,
  11910, 12320, 12735, 13155, 13580, 14010, 14445, 14885, 15330, 15780,
  16235, 16695, 17160, 17630, 18105, 18585, 19070, 19560, 20055, 20555,
];

export function normalizePokemonName(name, id) {
  switch (id) {
    case 29: // Nidoran F
      return 'nidoranf';
    case 32: // Nidoran M
      return 'nidoranm';
    default:
      return name.toLowerCase().replace(/[.':\- ]/g, '');
  }
}

export async function fetchPokemonData(id) {
  const pokemonDataResponse = await fetch(`https://pokemon.maybreak.com/api/v1/pokemon/${id}`);
  
  return (await pokemonDataResponse.json())?.pokemon;
}

export function calculateLevel(experience) {
  const index = LEVEL_THRESHOLDS.findIndex(threshold => threshold > experience);

  return index === -1 ? 100 : index;
}

export function calculateCombatStageMultiplier(stages) {
  return stages === 0 ? 1 : (stages < 0 ? 1 - (Math.abs(stages) * 0.1) : 1 + (stages * 0.2));
}

export function calculateMaxHP(actor) {
  const data = actor.data.data;

  return calculateLevel(data.experience) + (data.stats.hp.value) * 3 + 10 + pokemon.stats.hp.bonus;
}

export function calculateEffectiveMaxHP(actor) {
  return Math.floor(calculateMaxHP(actor) * (1 - 0.1 * Math.min(actor.resources.injuries.value, 9)));
}

export function calculateStat(actor, stat) {
  const statData = actor.data.data.stats[stat];

  return Math.floor(statData.value * calculateCombatStageMultiplier(statData.combatStages.value)) + statData.bonus;
}
