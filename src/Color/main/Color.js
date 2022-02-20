const MAX_8BIT = 255;

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

  static ofRGBA(red = 0, green = 0, blue = 0, alpha = 1) {
    const rgba = new Uint8Array(4);
    rgba[0] = red * MAX_8BIT;
    rgba[1] = green * MAX_8BIT;
    rgba[2] = blue * MAX_8BIT;
    rgba[3] = alpha * MAX_8BIT;
    return new Color(rgba);
  }

  static ofRGBARaw(red = 0, green = 0, blue = 0, alpha = 255) {
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

  static RED = Color.ofRGBA(1, 0, 0);
  static GREEN = Color.ofRGBA(0, 1, 0);
  static BLUE = Color.ofRGBA(0, 0, 1);
  static BLACK = Color.ofRGBA(0, 0, 0);
  static WHITE = Color.ofRGBA(1, 1, 1);
}
