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

    /** @inheritdoc */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Configure prototype token settings
    const prototypeToken = {
      actorLink: true
    }
    this.parent.updateSource({prototypeToken});
  }

    prepareBaseData(){
    //calculate base stress based on tier
    this.attributes.stress.base = 20 + (this.attributes.tier*20)

    //Calculate tic and surge from base stress
    let stress = this.attributes.stress.base
    this.attributes.stress.tic = Math.round(stress/10)
    this.attributes.stress.surge = Math.round(stress/4)

    //max stress - decrease by num of strain points
    this.attributes.stress.max = this.attributes.stress.base - (this.points.strain * this.attributes.stress.tic)
    //if current greater than max, cap it
    //since this is in base data, it can be altered by things like aes
    this.attributes.stress.value = Math.min(this.attributes.stress.value, this.attributes.stress.max)
  }

  prepareDerivedData() {

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
    data.tic = this.attributes.stress.tic;
    data.surge = this.attributes.stress.surge;
    data.stress = {
      max : this.attributes.stress.max,
      current: this.attributes.stress.value
    };

    return data;
  }
}
