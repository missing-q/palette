import PaletteItemBase from './base-item.mjs';

export default class PaletteHue extends PaletteItemBase {
  static LOCALIZATION_PREFIXES = [
    'PALETTE.Item.Hue'
  ];

    static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.color = new fields.StringField({initial: "none"});
    schema.links = new fields.SchemaField({});
    schema.skills = new fields.SchemaField({
      proficiency1: new fields.StringField({initial: ""}),
      proficiency2: new fields.StringField({initial: ""}),
      incompetency: new fields.StringField({initial: ""}),
      mastery: new fields.HTMLField(),
    });


    return schema;
  }
  
}
