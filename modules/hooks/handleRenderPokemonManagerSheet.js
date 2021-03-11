import { fetchPokemonData } from "../utils/pokemonUtils.js";

const UPDATE_DELAY = 1000 * 30; // 30 seconds

export async function handleRenderPokemonManagerSheet(sheet, _element, entity) {
  const actor = game.actors.get(entity.data.id);

  if (Date.now() - actor.data.flags.ptu?.lastUpdated < UPDATE_DELAY) return;

  console.info(`[PTU] Syncing stats for ${actor.name}...`);

  const pokemonID = actor.data.data.sheetID;

  if (pokemonID === 0) return;

  const pokemonData = await fetchPokemonData(pokemonID);

  await actor.update({
    flags: {
      'ptu.lastUpdated': Date.now(),
    },
    data: {
      stats: {
        'hp.value': pokemonData.baseHP + pokemonData.addedHP + pokemonData.vitaminHP,
        'atk.value': pokemonData.baseAttack + pokemonData.addedAttack + pokemonData.vitaminAttack,
        'def.value': pokemonData.baseDefense + pokemonData.addedDefense + pokemonData.vitaminDefense,
        'spatk.value': pokemonData.baseSpAttack + pokemonData.addedSpAttack + pokemonData.vitaminSpAttack,
        'spdef.value': pokemonData.baseSpDefense + pokemonData.addedSpDefense + pokemonData.vitaminSpDefense,
        'spd.value': pokemonData.baseSpeed + pokemonData.addedSpeed + pokemonData.vitaminSpeed,
      }
    }
  })
}