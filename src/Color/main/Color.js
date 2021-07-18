export default class Color {
  /**
   *
   * @param {Uint8Array} rgba
   */
  constructor(rgba) {
    this.rgba = rgba;
  }

  getRGBA() {
    return this.rgba;
  }

  get red() {
    return this.rgba[0];
  }

  get green() {
    return this.rgba[1];
  }

  get blue() {
    return this.rgba[2];
  }

  get alpha() {
    return this.rgba[3];
  }

  /**
   *
   * @param {Color} color
   * @returns {Boolean}
   */
  equals(color) {
    for (let i = 0; i < this.rgba.length; i++) {
      if (this.rgba[i] !== color.rgba[i]) {
        return false;
      }
    }
    return true;
  }

  static ofRGBA(red = 0, green = 0, blue = 0, alpha = 255) {
    const rgba = new Uint8Array(4);
    rgba[0] = red;
    rgba[1] = green;
    rgba[2] = blue;
    rgba[3] = alpha;
    return new Color(rgba);
  }

  static random() {
    const r = () => Math.random() * 256;
    return Color.ofRGBA(r(), r(), r(), r());
  }

  static RED = Color.ofRGBA(255, 0, 0);
  static GREEN = Color.ofRGBA(0, 255, 0);
  static BLUE = Color.ofRGBA(0, 0, 255);
  static BLACK = Color.ofRGBA(0, 0, 0);
  static WHITE = Color.ofRGBA(255, 255, 255);
}
