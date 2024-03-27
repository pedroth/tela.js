import { MAX_8BIT } from "../Utils/Constants";
import { clamp } from "../Utils/Math";

/**
 * Class that abstracts colors.
 * 
 * Here colors are represented as [0,1]^3 vector.
 */
export default class Color {
  constructor(rbg) {
    const rgbClamp = clamp();
    this.rgb = rbg.map(c => rgbClamp(c));
  }

  toArray() {
    return this.rgb;
  }

  get red() {
    return this.rgb[0];
  }

  get green() {
    return this.rgb[1];
  }

  get blue() {
    return this.rgb[2];
  }

  add(color) {
    return Color.ofRGB(this.rgb[0] + color.red, this.rgb[1] + color.green, this.rgb[2] + color.blue);
  }

  scale(r) {
    return Color.ofRGB(r * this.red, r * this.green, r * this.blue);
  }

  mul(color) {
    return Color.ofRGB(
      this.rgb[0] * color.red,
      this.rgb[1] * color.green,
      this.rgb[2] * color.blue
    )
  }

  /**
   *
   * @param {Color} color
   * @returns {Boolean}
   */
  equals(color) {
    return (
      this.rgb[0] === color.rgb[0] &&
      this.rgb[1] === color.rgb[1] &&
      this.rgb[2] === color.rgb[2]
    );
  }

  toString() {
    return `red: ${this.red}, green: ${this.green}, blue: ${this.blue}`;
  }

  toGamma(alpha = 0.5) {
    const r = this.rgb[0] > 0 ? this.rgb[0] ** alpha : this.rgb[0];
    const g = this.rgb[1] > 0 ? this.rgb[1] ** alpha : this.rgb[1];
    const b = this.rgb[2] > 0 ? this.rgb[2] ** alpha : this.rgb[2];
    return Color.ofRGB(r, g, b);
  }

  static ofRGB(red = 0, green = 0, blue = 0) {
    const rgb = [];
    rgb[0] = red;
    rgb[1] = green;
    rgb[2] = blue;
    return new Color(rgb);
  }

  static ofRGBRaw(red = 0, green = 0, blue = 0) {
    const rgb = [];
    rgb[0] = red / MAX_8BIT;
    rgb[1] = green / MAX_8BIT;
    rgb[2] = blue / MAX_8BIT;
    return new Color(rgb);
  }

  static random() {
    const r = () => Math.random();
    return Color.ofRGB(r(), r(), r());
  }

  static RED = Color.ofRGB(1, 0, 0);
  static GREEN = Color.ofRGB(0, 1, 0);
  static BLUE = Color.ofRGB(0, 0, 1);
  static BLACK = Color.ofRGB(0, 0, 0);
  static WHITE = Color.ofRGB(1, 1, 1);
  static GRAY = Color.ofRGB(0.5, 0.5, 0.5);
  static GREY = Color.ofRGB(0.5, 0.5, 0.5);
}
