import { preloadTemplates } from './preload/templates.js';
import TrainerSheet from './actor/TrainerSheet.js';
import FeatureSheet from './item/FeatureSheet.js';
import CarriableSheet from './item/CarriableSheet.js';
import CapabilitySheet from './item/CapabilitySheet.js';
import EdgeSheet from './item/EdgeSheet.js';
import MoveSheet from './item/MoveSheet.js';
import { rollMove, rollMetronome, rollSkill, rollStat } from './macros/macros.js';
import { handleItemDrop } from './hooks/handleItemDrop.js';
import PokemonManagerSheet from './actor/PokemonManagerSheet.js';
import TokenSheet from './actor/TokenSheet.js';
import { renderEntitySheetConfig } from './hooks/handleRenderEntitySheetConfig.js';
import { handleRenderPokemonManagerSheet } from './hooks/handleRenderPokemonManagerSheet.js';
import { POKEMON_STRING, SKILL_NAMES } from './utils/constants.js';
import { restartPokemonStatSyncInterval } from './processes/syncPokemonStatValues.js';
import { getInitiativeFormula } from './utils/getInitiativeFormula.js';
import { migrateActorData, migrateItemData } from './migrations/migrate.js';
import { PTUActor } from './actor/PTUActor.js';
import BattleEffects from './apps/BattleEffects.js';

BattleEffects.instance = new BattleEffects();

Hooks.once('init', function() {
  console.info('[PTU] Initializing Lightweight PTU...');

  CONFIG.debug.ptu = {
    logSync: false,
  }

  CONFIG.Actor.entityClass = PTUActor;

  game.settings.register('fvtt-lightweight-ptu', 'statSyncInterval', {
    name: 'Stat Sync Interval',
    hint: `The number of seconds to wait before updating ${POKEMON_STRING} health values with their values in Pokemon Manager.`,
    scope: 'world',
    config: true,
    type: Number,
    range: {
      min: 5,
      max: 120,
      step: 1,
    },
    default: 20,
    onChange: restartPokemonStatSyncInterval,
  });

  game.settings.register('fvtt-lightweight-ptu', 'rollDamageDice', {
    name: 'Roll Damage',
    hint: `If enabled, ${POKEMON_STRING} move macros will roll damage as well.`,
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
  });

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('fvtt-lightweight-ptu', TrainerSheet, { types: ['trainer'], makeDefault: false });
  Actors.registerSheet('fvtt-lightweight-ptu', PokemonManagerSheet, { types: ['pokemon'], makeDefault: true });
  Actors.registerSheet('fvtt-lightweight-ptu', TokenSheet, { types: ['token'], makeDefault: false });
  
  Items.registerSheet('fvtt-lightweight-ptu', FeatureSheet, { types: ['feature'], makeDefault: true });
  Items.registerSheet('fvtt-lightweight-ptu', CarriableSheet, { types: ['carriable'], makeDefault: true });
  Items.registerSheet('fvtt-lightweight-ptu', CapabilitySheet, { types: ['capability'], makeDefault: true });
  Items.registerSheet('fvtt-lightweight-ptu', EdgeSheet, { types: ['edge'], makeDefault: true });
  Items.registerSheet('fvtt-lightweight-ptu', MoveSheet, { types: ['move'], makeDefault: true });
  
  Combat.prototype._getInitiativeFormula = getInitiativeFormula;

  game.ptu = {
    statSyncIntervalId: undefined,
    macros: {
      rollMetronome,
      rollMove,
      rollSkill,
      rollStat,
    },
  };

  preloadTemplates();

  Handlebars.registerHelper('skillName', skill => {
    return SKILL_NAMES[skill];
  });

  console.info('[PTU] Lightweight PTU initialized.');
});

Hooks.on('hotbarDrop', (_hotbar, { type, id }, position) => {
  if (type === 'Item') {
    handleItemDrop(game.items.get(id), position);
  }
});

Hooks.on('renderEntitySheetConfig', renderEntitySheetConfig);
Hooks.on('renderPokemonManagerSheet', handleRenderPokemonManagerSheet);

Hooks.on('chatCommandsReady', chatCommands => {
  chatCommands.registerCommand(chatCommands.createCommandFromData({
    commandKey: '/effect',
    invokeOnCommand: async (_chatLog, messageText, _chatdata) => {
      const segments = messageText.split(/ /g);

      const name = segments.slice(0, segments.length - 1).join(' ');;
      const duration = Number(segments[segments.length - 1]);

      if (!name || !duration) {
        ui.notifications.warn('/effect requires two arguments: name and duration.');

        return;
      }
      
      if (Number.isNaN(duration)) {
        ui.notifications.warn(`${duration} is not a valid duration.`);

        return;
      }

      if (!game.combat) {
        ui.notifications.warn('There is no active combat.');

        return;
      }

      let activeEffects = game.combat.data.flags.ptu?.activeEffects || [];

      if (activeEffects.find(item => item.name === name)) {
        activeEffects = activeEffects.reduce((acc, item) => [
          ...acc,
          item.name === name ? {
            ...item,
            startTurn: game.combat.data.round || 1,
            duration,
          } : item,
        ], []);
      } else {
        activeEffects = [...activeEffects, {
          name,
          duration,
          startTurn: game.combat.data.round || 1,
        }];
      }

      game.combat.update({
        flags: {
          ptu: {
            activeEffects,
          },
        },
      });
    },
    shouldDisplayToChat: false,
    description: 'Add a battle effect to the effect list.',
  }));
});

Hooks.on('updateCombat', async () => {
  if (game.combat?.data.round === 1) {
    BattleEffects.instance.showApp();
  }

  BattleEffects.instance.updateApp();
});

Hooks.on('deleteCombat', async () => {
  BattleEffects.instance.updateApp();

  setTimeout(() => {
    BattleEffects.instance.closeApp();
  }, 250);
});

Hooks.on('renderSidebarTab', async (app, html) => {
  if (app.options.id === 'combat') {
    let button = $("<button class='import-pmd'>Show Battle Effects</button>");

    button.click(async () => {
      BattleEffects.instance.showApp();
    });

    html.find(".directory-footer").append(button);
  }
});


Hooks.once('ready', () => {
  restartPokemonStatSyncInterval();

  if (game.combat?.data.round === 1) {
    BattleEffects.instance.showApp();
  }

  game.actors.forEach(migrateActorData);
  game.items.forEach(migrateItemData);

  game.actors.forEach(actor => {
    actor.items.forEach(migrateItemData);
  });
});
