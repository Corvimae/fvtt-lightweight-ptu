export function getSkillType(actor, skillName) {
  const match = Object.entries(actor.data.data.skills).find(([_stat, value]) => (
    value.items[skillName] !== undefined
  ));

  return match?.[0];
}

export function calculateStatModifier(actor, stat) {
  const statData = actor.data.data.stats[stat];

  const baseModifier = statData.value < 10 ? -10 + statData.value : Math.floor((statData.value - 10) / 2);

  return baseModifier + (statData.bonus || 0);
}

export function getItemDescription(actor, itemElement) {
  if (itemElement.data('item-id')) {
    let item = actor.getOwnedItem(itemElement.data('item-id'));

    return item.data.data.description;
  }

  switch (itemElement.data('special-item-key')) {
    case 'capability-overland':
      return 'Overland Movement Speed is how quickly a Trainer can move over flat land.';

    case 'capability-swim':
      return 'Swimming Speed is how quickly a Trainer can move through water.';

    case 'capability-power':
      return 'Power is a measure of raw physical strength and ability to lift heavy objects.';

    case 'capability-throwing-range':
      return 'Throwing Range is how far a Trainer can throw Poke Balls and other items.';

    case 'capability-long-jump':
      return 'Long Jump is how much horizontal distance a Trainer can jump in meters.'

    case 'capability-high-jump':
      return 'High Jump determines how high a Trainer can jump in meters. Note that a High Jump of 0 doesn\'t mean you can\'t jump; it just means you have to make a Skill Check to determine how high you can jump and whether you breach 1 meter.';

    default:
      return '';
  }
}