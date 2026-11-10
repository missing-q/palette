export class PaletteCombatant extends Combatant {
  //right now this subclass just exists to force refreshes of the token object linked to the combatant for action point drawing
  // probably won't need it for anything else? lol
  async _onCreate(changed, options, userId) {
    await super._onCreate(changed, options, userId);
    if (!this.token?._object) return;
    this.token._object.refreshPoints()
  }

  async _onDelete(changed, options, userId) {
    await super._onDelete(changed, options, userId);
    if (!this.token?._object) return;
    this.token._object.refreshPoints()
  }
}