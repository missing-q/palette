//Color dice!

const { DiceTerm } = foundry.dice.terms;

export class ColorDie extends DiceTerm {

  // Registers this term under "c" so "3dc" resolves to ColorDie
  static DENOMINATION = "c";
  // Modifiers are always zero 
  static MODIFIERS = {};

  constructor(termData = {}) {
    // Faces are always fixed at 6
    super({ ...termData, faces: 6 });
  }



  //custom css 
  getResultCSS(result) {
    const color = CONFIG.PALETTE.colors[result.result - 1] ?? "unknown";
    const classes = super.getResultCSS(result) ?? [];
    return [...classes, `color-${color}`];
  }

}