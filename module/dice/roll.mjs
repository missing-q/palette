import { ColorDie } from "./die.mjs";
import { ColorHelper } from "../helpers/colors.mjs";

export class ColorRoll extends Roll {
  static CHAT_TEMPLATE = "systems/palette/templates/chat/color-roll.hbs";

  /** @param {string[]} options.successColors - colors are passed as options */
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
  }

  //get success colors
  get successColors() {
    return this.options.successColors ?? [];
  }

  // reject if not pure d6 
  #assertPureColorFormula() {
    const badTerm = this.terms.find((t) => !(t instanceof ColorDie));
    if (badTerm) {
      throw new Error(
        `Color Dice rolls may not contain modifiers or other terms (found "${badTerm.constructor.name}"). ` +
          `Only ColorDie ("dc") terms are permitted.`
      );
    }
  }

  /** @override */
  async evaluate(options = {}) {
    this.#assertPureColorFormula();
    await super.evaluate(options);
    this.#flagSuccesses();
    return this;
  }

  // mark successes against successcolors
  #flagSuccesses() {
    if (this.options.success){
      const targets = new Set(this.successColors.map((c) => c.toLowerCase()));
      for (const term of this.terms) {
        if (!(term instanceof ColorDie)) continue;
        for (const result of term.results) {
          const color = ColorHelper.colorOf(result.result - 1);
          result.success = targets.has(color);
          result.failure = !result.success;
        }
      }
    }
  }

  //formatting roll results for chat template
  get faceResults() {
    const out = [];
    for (const term of this.terms) {
      if (!(term instanceof ColorDie)) continue;
      for (const result of term.results) {
        let tmp = ColorHelper.colorOf(result.result - 1);
        out.push({
          color: tmp,
          success: !!result.success,
        });
      }
    }
    return out;
  }

  // override total to return successes
  /** @override */
  get total() {
    return this.faceResults.filter((r) => r.success).length;
  }

  /**
   * Bypass chat partial and render our own instead
   * @override
   */
  async render(chatOptions = {}) {
    const data = {
      formula: this.formula,
      faces: this.faceResults,
      success: this.options.success,
      hand: this.options.hand,
      successCount: this.total,
      diceCount: this.faceResults.length,
      successColors: this.successColors,
    };
    return foundry.applications.handlebars.renderTemplate(
      this.constructor.CHAT_TEMPLATE,
      data
    );
  }

  /** @override */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    if (!this._evaluated) await this.evaluate();
    const content = await this.render();

    const msgData = foundry.utils.mergeObject(
      {
        content,
        rolls: [this], // keeps Dice So Nice and roll history working
        sound: CONFIG.sounds.dice,
      },
      messageData
    );

    const cls = getDocumentClass("ChatMessage");
    let msg = new cls(cls.applyRollMode(msgData, rollMode ?? game.settings.get("core", "rollMode")));
    return create ? cls.create(msg.toObject()) : msg;
  }
}