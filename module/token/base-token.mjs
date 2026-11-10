export class PaletteToken extends foundry.canvas.placeables.Token {

    //drawing action/reaction icons on the token
  async _drawEffects() {
    await super._drawEffects();
    this.Points ??= this.addChild(new PIXI.Container());
    this._drawPoints();
  }

  _refreshEffects() {
    super._refreshEffects();
    this._layoutPoints();
  }

  refreshPoints(){
    this._drawEffects();
    //console.log("points drawing refreshed!")
  }

  _drawPoints() {
    this.Points.removeChildren(); //clear the graphic :)
    //grab action/reaction points from actor so we can loop through the right amount, just in case
    const action = this.actor?.system.actions?.action ?? { max: 0, points: [], temp: [] }; 
    const reaction = this.actor?.system.actions?.reaction ?? { max: 0, points: [], temp: [] };

    for (let i = 0; i < action.max; i++) this._addPoint('action', i, action.points[i], false); //draw action markers
    for (let i = 0; i < action.temp.length; i++) this._addPoint('action', i, action.temp[i], true); //draw temp action markers

    for (let i = 0; i < reaction.max; i++) this._addPoint('reaction', i, reaction.points[i], false); //draw reaction markers
    for (let i = 0; i < reaction.temp.length; i++) this._addPoint('reaction', i, reaction.temp[i], true); //draw temp reaction markers

    this._layoutPoints();
  }

  _layoutPoints() {
    if (!this.Points) return;
    if (!this.inCombat) return;
    const size = Math.max(4, Math.min(this.w, this.h) * 0.12); // scale with token size
    const action = this.Points.children.filter(c => c.resourceType === 'action');
    const reaction = this.Points.children.filter(c => c.resourceType === 'reaction');

    this._drawRow(action, this.h - size, size);
    this._drawRow(reaction, this.h - size * 2.2, size); //draw a bit lower
  }
  
  _addPoint(type, index, filled, temp){ 
    let point = new PIXI.Graphics();
    point.eventMode = 'static';
    point.cursor = 'pointer';
    point.resourceType = type;
    point.isTemp = temp;
    point.resourceIndex = index;
    point.on('pointerdown', this._onClickPoint.bind(this));
    point._filled = filled;
    point._color = type == 'action' ? 0xff2222 : 0x2266ff //todo: pull these from css somehow
    this.Points.addChild(point);
  }

  _drawRow(points, y, size) {
    let spacing = 1.4
    const totalWidth = points.length * size * spacing; 
    let x = (this.w - totalWidth) / 2 + size / 2;
    for (const point of points) {
        point.clear();
        point.lineStyle(1, point._color, 0.6);
        point.beginFill(point._color, point._filled ? 1 : 0.25);
        point.drawCircle(0, 0, size / 2);
        point.endFill();
        point.position.set(x, y);
        point.hitArea = new PIXI.Circle(0, 0, size / 2 + 2); // make the hitbox just a lil bit larger so it's easier to click
        x += size * spacing;
    }  
  }

  async _onClickPoint(event) {
    event.stopPropagation();
    const point = event.currentTarget ?? event.target;
    let parent = this.actor?.system.actions?.[point.resourceType]?.[point.isTemp ? "temp" : "points"]
    parent[point.resourceIndex] = !point._filled; //toggle behavior
    await this.actor.update({ [`system.actions.${point.resourceType}.${point.isTemp ? "temp" : "points"}`]: parent }); //update actor with new array data
  }

}