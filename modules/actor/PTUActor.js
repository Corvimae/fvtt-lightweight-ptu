import { calculateLevel } from '../utils/pokemonUtils.js';

function applyInjuries(actorData, maxHP) {
  return Math.floor(maxHP * (1 - 0.1 * Math.min(actorData.resources.injuries?.value ?? 0, 9)));
}
export class PTUActor extends Actor {
  prepareData() {
    super.prepareData();

    if (this.data.type === 'trainer') this.prepareTrainerData();
    if (this.data.type === 'pokemon') this.preparePokemonData();
  }

  prepareTrainerData() {
    const trainerData = this.data.data;
    
    trainerData.resources.health.max = applyInjuries(trainerData, 10 + trainerData.stats.hp.value * 3 + trainerData.level * 2 + (trainerData.stats.hp.hpMaxBonus || 0));
    trainerData.resources.actionPoints.max = 5 + Math.floor(trainerData.level / 5)  + (trainerData.resources.actionPoints.apMaxBonus || 0);

    trainerData.stab = Math.floor(trainerData.level / 5);
  }

  preparePokemonData() {
    const pokemonData = this.data.data;

    pokemonData.level = calculateLevel(pokemonData.experience);
    pokemonData.stab = Math.floor(pokemonData.level / 5); 
    pokemonData.resources.health.max = applyInjuries(pokemonData, pokemonData.level + 10 + pokemonData.stats.hp.value * 3);
  } 
}