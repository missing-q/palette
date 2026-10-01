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
        // reset value
        this.wheel[key].value = "3"
        console.log(this)
        //let data = {}
        //data[`system.wheel.${color}.value`] = "3"
        //this.parent.update(data) //reset to default
        // this PROBABLY shouldn't result in an infinite loop... 
      }
    }
  }

    /**
   * Actions before update of the Actor Document..
   * @param {object} changed      The differential data that was changed relative to the documents prior values
   * @param {object} options      Additional options which modify the update request
   * @param {object} userId       The id of the User requesting the document update
   * @protected
   * @override
   */
  async _preUpdate(changed, options, user) {
    const allowed = await super._preUpdate(changed, options, user);
    if (allowed === false) return false; //bail if not allowed

    const wheelChanges = foundry.utils.getProperty(changed, "system.wheel");
    if (wheelChanges){

      const resetKeys = [];
      //console.log(wheelChanges)

      //if we're doing this on the sheet this should only be once, 
      // but add in support for multiple changes anyway
      for (const [key, obj] of Object.entries(wheelChanges)) {
        if (Number(obj?.value) === 0) {
          foundry.utils.setProperty(changed, `system.wheel.${key}.value`, "3");
          resetKeys.push(key);
        }
      }

      // stash colors for taint effect later
      if (resetKeys.length) options.taintKeys = resetKeys;
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
    await super._onUpdate(changed, options, userId);

    if (game.user.id !== userId) return;

    const wheelChanges = foundry.utils.getProperty(changed, "system.wheel");
    if (wheelChanges){
      console.log(wheelChanges)
      //tracker stuff
      let tracker = Number(this.points.tracker); //because object keys can't be numbers we have to do this silly song and dance
      let chroma = this.points.chroma;
      //unfortunately we have to double loop across pre and on lmao
      for (const [key, obj] of Object.entries(wheelChanges)) {
        tracker++;
      }
      //handle tracker overflow
      if (tracker >= 10) {
        chroma += Math.floor(tracker / 10);
        tracker = tracker % 10;
      }
      //set values
      this.points.tracker = String(tracker)
      this.points.chroma = chroma

      //handle taint ae
      for (const key of options.taintKeys ?? []) {
        const effect = await ActiveEffect.fromStatusEffect('taint');
        const style = getComputedStyle(document.body);
        const color = style.getPropertyValue(`--chromatic-${key}`);
        effect.updateSource({ tint: color || "#ffffff" });
        await this.parent.createEmbeddedDocuments("ActiveEffect", [effect]);
      }

    }
  }
}
