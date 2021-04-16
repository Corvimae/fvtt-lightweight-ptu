import { syncPokemonStatValues } from '../processes/syncPokemonStatValues.js';
import { calculateCombatStageMultiplier } from '../utils/pokemonUtils.js';
import { getSkillType, calculateStatModifier } from '../utils/trainerUtils.js';
import { SKILL_NAMES, STAT_FULL_NAMES } from '../utils/constants.js';
import { DAMAGE_BASE } from '../utils/damageUtils.js';

export async function rollMetronome() {
  const speaker = ChatMessage.getSpeaker();

  const allMoves = game.items.filter(item => item.data.type === 'move');

  const {_id: id} = allMoves[Math.floor(Math.random() * allMoves.length)];

  const selectedMove = await game.items.get(id);

  if (!game.actors.get(speaker.actor)) {
    ui.notifications.warn('No actor selected.');

    return;
  }

  await ChatMessage.create({
    content: `<div class="pokemon-move"><div class="pokemon-move-name">${ChatMessage.getSpeaker().alias} uses Metronome!</div></div>`,
    flags: {
      'ptu.messageType': 'move',
      'ptu.moveOptions': {
        type: 'normal',
      },
    },
    speaker,
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  });

  game.ptu.macros.rollMove({ 
    ...selectedMove.data.data,
    name: selectedMove.data.name,
    effects: selectedMove.data.data.effects.replace(/'/g, '\\\''),
  });
}

export async function rollMove({ name, type, frequency, range, damageBase, ac, damageType, effect, addedDamage = 0 }) {
  const speaker = ChatMessage.getSpeaker();

  let actor = game.actors.get(speaker.actor);

  if (!actor) {
    ui.notifications.warn('No actor selected.');

    return;
  }

  try {
    await syncPokemonStatValues(actor.data.data.sheetID);
  } catch (error) {
    ui.notifications.warn('Unable to sync Pokemon data. Move damage may not be correct.');
    console.warn('[PTU] Unable to sync Pokemon data for move macro', error);
  }

  // Get updated actor data.
  actor = game.actors.get(speaker.actor);

  const accuracyCheck = new Die({ faces: 20, number: 1 }).evaluate();
  
  const isDamaging = typeof damageBase === 'number' && damageBase >= 0;
  const isStab =  actor.data.data.type1 === type || actor.data.data.type2 === type;
  const { dieCount, dieSides, bonus } = isDamaging ? DAMAGE_BASE[damageBase + (isStab ? 2 : 0)] : {};

  const moveOptions = {
    name,
    type,
    frequency,
    range,
    damageBase,
    damage: `${dieCount}d${dieSides} + ${bonus}`,
    critDamage: `${2 * dieCount}d${dieSides} + ${2 * bonus}`,
    isStab,
    ac,
    effect,
    addedDamage,
    attackTypeName: damageType[0].toUpperCase() + damageType.substr(1),
    moveTypeName: type[0].toUpperCase() + type.substr(1),
    hasEffects: effect !== '-' && effect?.trim().length > 0,
    hasValidAttackRoll: isDamaging,
    shouldRollDamage: game.settings.get('fvtt-lightweight-ptu', 'rollDamageDice'),
    hasAccuracyCheck: range.indexOf('No Target') === -1 || damageType !== 'status',
    accuracyCheck: accuracyCheck.results[0].result,
    relevantStatValue: damageType === 'physical' ? '@stats.atk.value' : '@stats.spatk.value',
    combatStageMultiplier: calculateCombatStageMultiplier(damageType === 'physical' ? actor.data.data.stats.atk.combatStages.value : actor.data.data.stats.spatk.combatStages.value),
    relevantStatBonus: damageType === 'physical' ? '@stats.atk.bonus' : '@stats.spatk.bonus',
    isCrit: accuracyCheck.results[0].result === 20,
  };

  const content = await renderTemplate('/systems/fvtt-lightweight-ptu/templates/macros/move.html', {
    ...moveOptions,
    speaker,
  });

  
  await ChatMessage.create({
    content,
    flags: {
      'ptu.messageType': 'move',
      'ptu.moveOptions': moveOptions,
    },
    speaker: ChatMessage.getSpeaker(),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  });
}

export function buildCommandForMove(move, moveTypeOverride) {
  switch(move.name) {
    case 'Metronome':
      return 'game.ptu.macros.rollMetronome()';
      
    default:
      return `game.ptu.macros.rollMove({ name: '${move.name}', type: '${moveTypeOverride ?? move.data.type}', frequency: '${move.data.frequency}', range: '${move.data.range}', damageBase: ${move.data.damageBase}, ac: ${move.data.ac}, damageType: '${move.data.damageType}', effect: '${move.data.effect.replace(/'/g, '\\\'')}' })`;
  }
}

export async function rollSkill(actorId, skillName) {
  const actor = game.actors.get(actorId);

  const associatedStat = getSkillType(actor, skillName);
  const skillData = actor.data.data.skills[associatedStat].items[skillName];

  await ChatMessage.create({
    content: `<div class="larger-chat-message">${actor.name} attempts ${SKILL_NAMES[skillName]}... [[${skillData.rank}d6 + ${skillData.bonus}]]!</div>`,
    speaker: ChatMessage.getSpeaker({ actor }),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  });
}

export async function rollStat(actorId, statName) {
  const actor = game.actors.get(actorId);

  const modifierValue = calculateStatModifier(actor, statName);

  await ChatMessage.create({
    content: `<div class="larger-chat-message">${actor.name} rolls ${STAT_FULL_NAMES[statName]}... [[1d20 + ${modifierValue}]]!</div>`,
    speaker: ChatMessage.getSpeaker({ actor }),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  });
}