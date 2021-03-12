export const preloadTemplates = async function() {
  const templatePaths = [
    'systems/fvtt-lightweight-ptu/templates/macros/move.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/token.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/trainer.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/skills.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/background.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/capabilities.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/edges.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/features.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/inventory.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/actors/partials/options.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/items/carriable.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/items/capability.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/items/edge.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/items/feature.html',
    'systems/fvtt-lightweight-ptu/templates/sheets/items/move.html',
  ]

  // Load the template parts
  return loadTemplates(templatePaths);
};
