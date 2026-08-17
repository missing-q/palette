import PaletteActorBase from './base-actor.mjs';

export default class PaletteCharacter extends PaletteActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'PALETTE.Actor.Character',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Add trackers for color wheel
    schema.wheel = new fields.SchemaField(
      Object.keys(CONFIG.PALETTE.colorMap).reduce((obj, color) => {
        obj[color] = new fields.SchemaField({
          value: new fields.StringField({
            initial: "3"
          }),
        });
        return obj;
      }, {})
    );

    schema.points = new fields.SchemaField({
      chroma: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      trauma: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      strain: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      money: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    // add hand
    schema.hand = new fields.ArrayField(
      new fields.StringField()
    );

    return schema;
  }

  prepareDerivedData() {

    //calculate base stress based on tier
    this.attributes.stress.base = 20 + (this.attributes.tier*20)

    //Calculate tic and surge from base stress
    let stress = this.attributes.stress.base
    this.attributes.stress.tic = Math.round(stress/10)
    this.attributes.stress.surge = Math.round(stress/4)

    //calculate max stress 
    this.attributes.stress.max = this.attributes.stress.base - (this.points.strain * this.attributes.stress.tic)

  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    //if (this.abilities) {
    //  for (let [k, v] of Object.entries(this.abilities)) {
    //    data[k] = foundry.utils.deepClone(v);
    //  }
    //}

    data.tier = this.attributes.tier;

    return data;
  }
}
