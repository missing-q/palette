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
      tracker: new fields.StringField({ ...requiredInteger, initial: "0" }), // value tracker
    });

    return schema;
  }

    /**
   * Update value tracker after wheel updates.
   * @param {object} changed      Key-value pair of color and values.
   * @protected
   * @override
   */
  async updateTracker(changed){
    //modify value tracker
    let tracker = Number(this.points.tracker) //because object keys can't be numbers we have to do this silly song and dance
    for (let i in changed){ 
      //if we're doing this on the sheet this should only be once, 
      // but add in support for multiple changes anyway
      tracker++;

    }
    if (tracker >= 10){
      this.points.chroma += Math.floor(tracker/10); //add quotient to chroma
      tracker = tracker % 10; //set tracker to remainder
    }
    this.points.tracker = String(tracker) //convert back to string lmao

    //handle any taint 
    for (const [key, obj] of Object.entries(changed)) {
      if (obj.value == '0'){
        //add taint active effect for that color
        console.log("taint condition")
        const effect = await ActiveEffect.fromStatusEffect('taint');
        //get hex color value for current color
        const style = window.getComputedStyle(document.body)
        const color = style.getPropertyValue(`--chromatic-${key}`)
        effect.updateSource({ tint: color || "#ffffff" });
        //create effect
        console.log (effect)
        console.log(this)
        await this.parent.createEmbeddedDocuments("ActiveEffect", [effect]);

      }
    }
  }

  /**
   * Actions on update of the Actor Document..
   * @param {object} changed      The differential data that was changed relative to the documents prior values
   * @param {object} options      Additional options which modify the update request
   * @param {object} userId       The id of the User requesting the document update
   * @protected
   * @override
   */
  async _onUpdate(changed, options, userId) {
    await super._onUpdate(changed,options,userId);
    //handle tracker changes
    if (changed?.system?.wheel){ 
      this.updateTracker(changed.system.wheel)
      //console.log(changed.system.wheel)
    }

  }
}
