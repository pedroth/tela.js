export default class Color {
  /**
   *
   * @param {*} rgba: Uint8Array
   */
  constructor(rgba) {
    this.rgba = rgba;
  }

  getRGBA() {
    return this.rgba;
  }

  static ofRGBA(red = 0, green = 0, blue = 0, alpha = 255) {
    const rgba = new Uint8Array(4);
    rgba[0] = red;
    rgba[1] = green;
    rgba[2] = blue;
    rgba[3] = alpha;
    return new Color(rgba);
  }
}
