import { MAX_8BIT, RAD2DEG } from "../Utils/Constants.js";

/**
 * Class that abstracts colors.
 * 
 * Here colors are represented as [0,1]^3 vector.
 */
export default class Color {
  constructor(rgb, alpha = 1.0) {
    this.rgb = rgb.map(x => Number.isNaN(x) ? 0 : x);
    this.alpha = alpha;
  }

  toArray() {
    return [this.rgb[0], this.rgb[1], this.rgb[2], this.alpha];
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
    return Color.ofRGB(this.rgb[0] + color.red, this.rgb[1] + color.green, this.rgb[2] + color.blue, this.alpha + color.alpha);
  }

  scale(r) {
    return Color.ofRGB(r * this.red, r * this.green, r * this.blue, r * this.alpha);
  }

  mul(color) {
    return Color.ofRGB(
      this.rgb[0] * color.red,
      this.rgb[1] * color.green,
      this.rgb[2] * color.blue,
      this.alpha * color.alpha
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
      this.rgb[2] === color.rgb[2] &&
      this.alpha === color.alpha
    );
  }

  toString() {
    return `red: ${this.red}, green: ${this.green}, blue: ${this.blue}`;
  }

  toGamma(alpha = 0.5) {
    const r = this.red ** alpha;
    const g = this.green ** alpha;
    const b = this.blue ** alpha;
    return Color.ofRGB(r, g, b);
  }

  invert() {
    return Color.ofRGB(1 - this.red, 1 - this.green, 1 - this.blue);
  }

  static ofRGB(red = 0, green = 0, blue = 0, alpha = 1) {
    const rgb = [];
    rgb[0] = red;
    rgb[1] = green;
    rgb[2] = blue;
    return new Color(rgb, alpha);
  }

  static ofRGBRaw(red = 0, green = 0, blue = 0, alpha = MAX_8BIT) {
    const rgb = [];
    rgb[0] = red / MAX_8BIT;
    rgb[1] = green / MAX_8BIT;
    rgb[2] = blue / MAX_8BIT;
    return new Color(rgb, alpha / MAX_8BIT);
  }

  static ofHSV(hue, s, v) {
    const h = hue * RAD2DEG;
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return new Color([f(5), f(3), f(1)]);
  }

  static random() {
    const r = () => Math.random();
    return Color.ofRGB(r(), r(), r());
  }

  static BLACK = Color.ofRGB(0, 0, 0);
  static BLUE = Color.ofRGB(0, 0, 1);
  static GREEN = Color.ofRGB(0, 1, 0);
  static CYAN = Color.ofRGB(0, 1, 1);
  static RED = Color.ofRGB(1, 0, 0);
  static PURPLE = Color.ofRGB(0.9, 0, 0.9);
  static MAGENTA = Color.ofRGB(1, 0, 1);
  static YELLOW = Color.ofRGB(1, 1, 0);
  static ORANGE = Color.ofRGB(1, 0.8, 0);
  static WHITE = Color.ofRGB(1, 1, 1);
  static GRAY = Color.ofRGB(0.5, 0.5, 0.5);
  static GREY = Color.ofRGB(0.5, 0.5, 0.5);
  static BROWN = Color.ofRGB(0.345,0.2235,0.1529);
}
