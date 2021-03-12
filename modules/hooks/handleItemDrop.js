import { buildCommandForMove } from "../macros/macros.js";

export async function handleItemDrop(item, position) {
  if (item.type === 'move') createMoveAtHotbarPosition(item, position);
}

export function createMoveAtHotbarPosition(pokemonId, item, position) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      let macro = game.macros.find(macro => (
        macro.data.flags.ptu?.moveID == item.data.flags.ptu?.dbId && macro.data.flags.ptu?.pokemonID === pokemonId
      ));
      
      if (macro) {
        console.log(`[PTU] Existing macro found for ${item.name} on Pokemon ${pokemonId}.`);
      } else  {
        console.log(`[PTU] Creating new macro for ${item.name} on Pokemon ${pokemonId}...`);
        
        macro = await Macro.create({
          name: item.name,
          type: 'script',
          img: item.img,
          command: buildCommandForMove(item.data),
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