export default class BattleEffects extends Application {
  static get defaultOptions() {    
    return {
      ...super.defaultOptions,
      template: 'systems/fvtt-lightweight-ptu/templates/apps/battleEffects.html',
      title: 'Battle Effects',
      classes: ['battle-effects'],
      height: 'auto',
      left: 120,
      top: 60,
      resizable: false,
    };
  }

  getData() {
    return {
      effects: game.combat?.data.flags.ptu?.activeEffects.map(effect => ({
        ...effect,
        roundsRemaining: Math.min(effect.duration, effect.duration + effect.startTurn - game.combat?.data.round ?? 0),
      })).filter(effect => effect.roundsRemaining > 0) ?? [],
    };
  }

  setPositionalOptions() {
    const element = this.element[0];

    if (element) {
      if (this.getData().effects.length) {
        element.classList.remove('no-effects');
      } else {
        element.classList.add('no-effects');
      }
    }
  }

  showApp() {
    this.render(true);
    this.setPositionalOptions();
  }

  closeApp() {
    this.close().catch(console.error);
  }

  updateApp() {
    if (this.rendered) {
      this.render(false);
      this.setPositionalOptions();
    }
  }
}
