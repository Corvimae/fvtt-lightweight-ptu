import { fetchPokemonData } from '../utils/pokemonUtils.js';

export function restartPokemonStatSyncInterval() {
  if (!game.user.isGM) return;

  if (game.ptu.statSyncIntervalId) clearInterval(game.ptu.statSyncIntervalId);

  syncAllPokemonStatValues();

  game.ptu.statSyncIntervalId = setInterval(
    syncAllPokemonStatValues,
    game.settings.get('fvtt-lightweight-ptu', 'statSyncInterval') * 1000
  );
}

export async function syncAllPokemonStatValues() {
  if (CONFIG.debug.ptu.logSync) console.info('[PTU] Syncing Pokemon stat values...');

  const pokemonWithSheets = game.actors.entries.filter(actor => actor.data.type === 'pokemon' && actor.data.data.sheetID);

  const pokemonData = await fetch(`https://pokemon.maybreak.com/api/v1/pokemon?query=${pokemonWithSheets.map(actor => actor.data.data.sheetID).join(',')}`);
    
  const pokemonDataBySheetId = (await pokemonData.json()).reduce((acc, data) => ({
    ...acc,
    [data.id]: data,
  }), {});
  
  pokemonWithSheets.map(async actor => await updatePokemonStatValues(actor, pokemonDataBySheetId[actor.data.data.sheetID]));

  await Promise.all(pokemonWithSheets);
}

export async function syncPokemonStatValues(sheetID) {
  const actor = game.actors.entries.find(actor => actor.data.type === 'pokemon' && actor.data.data.sheetID === sheetID);
  
  if (!actor) {
    console.info(`[PTU] Unable to sync sheet data with ID ${sheetID}: sheet does not exist.`);

    return;
  }

  const pokemonData = await fetchPokemonData(actor.data.data.sheetID);

  await updatePokemonStatValues(actor, pokemonData);
}

export async function updatePokemonStatValues(actor, sheetData) {
  await actor.update({
    data: {
      resources: {
        health: {
          value: sheetData.currentHealth,
        },
      },
      stats: {
        hp: {
          value: sheetData.baseHP + sheetData.addedHP + sheetData.vitaminHP,
          bonus: sheetData.bonusHP,
        },
        atk: {
          value: sheetData.baseAttack + sheetData.addedAttack + sheetData.vitaminAttack,
          bonus: sheetData.bonusAttack,
          combatStages: {
            value: sheetData.attackCombatStages,
          },
        },
        def: {
          value: sheetData.baseDefense + sheetData.addedDefense + sheetData.vitaminDefense,
          bonus: sheetData.bonusDefense,
          combatStages: {
            value: sheetData.defenseCombatStages,
          },
        },
        spatk: {
          value: sheetData.baseSpAttack + sheetData.addedSpAttack + sheetData.vitaminSpAttack,
          bonus: sheetData.bonusSpAttack,
          combatStages: {
            value: sheetData.spAttackCombatStages,
          },
        },
        spdef: {
          value: sheetData.baseSpDefense + sheetData.addedSpDefense + sheetData.vitaminSpDefense,
          bonus: sheetData.bonusSpDefense,
          combatStages: {
            value: sheetData.spDefenseCombatStages,
          },
        },
        spd: {
          value: sheetData.baseSpeed + sheetData.addedSpeed + sheetData.vitaminSpeed,
          bonus: sheetData.bonusSpeed,
          combatStages: {
            value: sheetData.speedCombatStages,
          },
        }
      },
      type1: sheetData.type1,
      type2: sheetData.type2,
      experience: sheetData.experience,
    },
  });

  actor.getActiveTokens().forEach(token => {
    token.update({
      'bar1.attribute': 'resources.health',
    });
  }); 
}