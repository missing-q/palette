export default class PaletteActorBase extends foundry.abstract
  .TypeDataModel {
  static LOCALIZATION_PREFIXES = ["PALETTE.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.attributes = new fields.SchemaField({
      tier: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      dn: new fields.NumberField({ ...requiredInteger, initial: 1 }), //any modifiers to dn should be done through active effects
      stress: new fields.SchemaField({
        base: new fields.NumberField({ ...requiredInteger, initial: 40 }),  //we don't need a max stress value as we can just calculate it in data prep
        value: new fields.NumberField({ ...requiredInteger, initial: 40 }),
      }),
      move: new fields.SchemaField({
        speed: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        jump: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    schema.palette =  new fields.SchemaField({
      locked: new fields.BooleanField({ initial: true }), // this attribute determines if the palette size is restricted to 3 hues; locked for PCs and unlocked for NPCs
    });

    // add hand
    schema.hand = new fields.SchemaField({
      locked: new fields.BooleanField({ initial: false }), // determines if character shouuld have access to hand abilities; locked for minion npcs and unlocked for everyone else
      value: new fields.ArrayField( new fields.StringField()),
    });

    return schema;
  }
}
