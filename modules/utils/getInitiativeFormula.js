import { calculateStat } from "./pokemonUtils.js";

export function getInitiativeFormula(combatant) {
  const speed = calculateStat(combatant.actor, 'spd');

  if (combatant.actor.data.type === 'trainer') return `${speed} * 100`;

  return `${speed}`;
}