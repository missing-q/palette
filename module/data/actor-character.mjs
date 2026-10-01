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

    }
  }
}
