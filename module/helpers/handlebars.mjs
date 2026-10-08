export class PaletteHbsHelpers {
  static init() {

    /* Handlebars helper for generating color icon masking styles.*/
    Handlebars.registerHelper('colormask', function(color) {
      return `mask-image: url('systems/palette/assets/icon-${color}.svg'); background-color: var(--chromatic-${color});`;
    });

  }
}