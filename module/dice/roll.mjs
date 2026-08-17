export class ColorRoll extends Roll {
  /** @override*/
  static CHAT_TEMPLATE = "systems/palette/templates/chat/color-roll.hbs";

  /** @override */
  //static TOOLTIP_TEMPLATE = "systems/palette/templates/chat/color-roll-tooltip.hbs";

  get dieTerm() {
    return this.terms.find(t => t instanceof ColorDie);
  }

  get colorResults() {
    return this.dieTerm?.results.filter(r => r.active)
      .map(r => ColorDie.COLORS[r.result - 1]) ?? [];
  }

  get successes() {
    return this.dieTerm?.countSuccesses(this.options.successColors ?? []) ?? 0;
  }
}

async function rollColorPool(actor, poolSize) {
  //get hues from sheet - this should be able to support any amount of hues 

  const roll = new ColorRoll(buildColorRollFormula(poolSize), actor.getRollData(), {
    successColors
  });

  await roll.evaluate();
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });
  return roll;
}
