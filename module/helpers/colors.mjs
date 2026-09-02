// helper class for color-related functions
export class ColorHelper {

  //helper to map result to color
  static colorOf(input) {
    return CONFIG.PALETTE.colors[input];
  }

    //Color name conversion
  static getLabel(input) {
    // Don't forget - this needs to be localized in the html!
    return CONFIG.PALETTE.colorMap[input];
  }

  //Color name conversion for arrays
  static getLabels(input){
    let tmp = []
    for (let color of input){
        console.log(color)
        tmp.push(ColorHelper.getLabel(color))
    }
    return tmp;
  }

}