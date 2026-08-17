import PaletteActorBase from './base-actor.mjs';

export default class PaletteNPC extends PaletteActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'PALETTE.Actor.NPC',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    //schema.cr = new fields.NumberField({
    //  ...requiredInteger,
    //  initial: 1,
    //  min: 0,
    //});

    schema.palette.locked = new fields.BooleanField({ initial: false }) //npcs can have 2 to 4 hues in their palette

    return schema;
  }

  prepareDerivedData() {
    // to do later
  }
}
