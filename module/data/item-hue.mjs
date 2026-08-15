import PaletteItemBase from './base-item.mjs';

export default class PaletteHue extends PaletteItemBase {
  static LOCALIZATION_PREFIXES = [
    'PALETTE.Item.Hue'
  ];

    static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellLevel = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 0,
      max: 9,
    });

    return schema;
  }
  
}
