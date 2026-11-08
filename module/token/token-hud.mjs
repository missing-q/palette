class PaletteTokenHUD extends foundry.applications.hud.TokenHUD {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    { actions: { effect: { buttons: [0, 2], handler: PaletteTokenHUD.#onToggleEffect } } },
    { inplace: false }
  );
  //manual implementation of status toggle behaviors - right click should add more instances
  static async #onToggleEffect(event, target) {

  }
}