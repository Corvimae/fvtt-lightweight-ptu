import { calculateLevel } from '../utils/pokemonUtils.js';

export class PTUActor extends Actor {
  prepareData() {
    super.prepareData();

    if (this.data.type === 'trainer') this.prepareTrainerData();
    if (this.data.type === 'pokemon') this.preparePokemonData();
  }

  prepareTrainerData() {
    const trainerData = this.data.data;
    
    trainerData.resources.health.max = 10 + trainerData.stats.hp.value * 3 + trainerData.level * 2 + (trainerData.stats.hp.hpMaxBonus || 0);
    trainerData.resources.actionPoints.max = 5 + Math.floor(trainerData.level / 5)  + (trainerData.resources.actionPoints.apMaxBonus || 0);

    trainerData.stab = Math.floor(trainerData.level / 5);
  }

  preparePokemonData() {
    const pokemonData = this.data.data;

    pokemonData.level = calculateLevel(pokemonData.experience);
    pokemonData.stab = Math.floor(pokemonData.level / 5);
    pokemonData.resources.health.max = pokemonData.level + 10 + pokemonData.stats.hp.value * 3
  }
}