import { buildCommandForMove } from "../macros/macros.js";

export async function handleItemDrop(item, position) {
  if (item.type === 'move') createMoveAtHotbarPosition(item, position);
}

export function createMoveAtHotbarPosition(pokemonId, item, position, moveTypeOverride) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      let macro = game.macros.find(macro => (
        macro.data.flags.ptu?.moveID == item.data.flags.ptu?.dbId && macro.data.flags.ptu?.pokemonID === pokemonId
      ));
      
      if (macro && !moveTypeOverride) {
        console.log(`[PTU] Existing macro found for ${item.name} on Pokemon ${pokemonId}.`);
      } else  {
        console.log(`[PTU] Creating new macro for ${item.name} on Pokemon ${pokemonId}...`);
        
        macro = await Macro.create({
          name: item.name + (moveTypeOverride ? ` (${moveTypeOverride[0].toUpperCase()}${moveTypeOverride.slice(1)})` : ''),
          type: 'script',
          img: moveTypeOverride ? `modules/pokemon-manager-data/assets/types/${moveTypeOverride}.png` : item.img,
          command: buildCommandForMove(item.data, moveTypeOverride),
          flags: {
            'ptu.moveID': item.data.flags.ptu?.dbId,
            'ptu.pokemonID': pokemonId,
          },
        });
      }

      await game.user.assignHotbarMacro(macro, position)

      resolve();
    }, 0);
  });
}