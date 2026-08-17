export class ColorDie extends foundry.dice.terms.Die {
  constructor(termData) {
    termData.faces = 6; //this should always be a d6
    super(termData);
  }

  /** @override */
  static DENOMINATION = "c";

  /** @override */
  static MODIFIERS = {};

  /** @override */
  getResultLabel(result) {
    return CONFIG.PALETTE.colors[result.result - 1];
  }

  /** @override */
  getResultCSS(result) {
    const css = super.getResultCSS(result) ?? [];
    css.push(`color-die-${CONFIG.PALETTE.colors[result.result - 1]}`);
    return css;
  }

  // Count how many results match the roller's hues
  countSuccesses(successColors = []) {
    return this.results.filter(
      r => r.active && successColors.includes(CONFIG.PALETTE.colors[r.result - 1])
    ).length;
  }
}
