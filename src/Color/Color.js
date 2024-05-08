import { MAX_8BIT, RAD2DEG } from "../Utils/Constants.js";
import { clamp } from "../Utils/Math.js";

const rgbClamp = clamp();


/**
 * Class that abstracts colors.
 * 
 * Here colors are represented as [0,1]^3 vector.
 */
export default class Color {
  constructor(rgb) {
    this.rgb = rgb;
    this.isDirty = rgb[0] <= 0 || rgb[0] > 1 || rgb[1] <= 0 || rgb[1] > 1 || rgb[2] <= 0 || rgb[2] > 1;
  }

  clamp() {
    if(this.isDirty) {
      this.rgb = this.rgb.map(c => rgbClamp(c));
      this.isDirty = false;
    }
    return this;
  }

  toArray() {
    this.clamp();
    return this.rgb;
  }

  get red() {
    this.clamp();
    return this.rgb[0];
  }

  get green() {
    this.clamp();
    return this.rgb[1];
  }

  get blue() {
    this.clamp();
    return this.rgb[2];
  }

  add(color) {
    return Color.ofRGB(this.rgb[0] + color.red, this.rgb[1] + color.green, this.rgb[2] + color.blue);
  }

  scale(r) {
    return Color.ofRGB(r * this.red, r * this.green, r * this.blue);
  }

  mul(color) {
    this.clamp();
    color.clamp();
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
    this.clamp();
    const r = this.rgb[0] ** alpha;
    const g = this.rgb[1] ** alpha;
    const b = this.rgb[2] ** alpha;
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

  static ofHSV(hue, s, v) {
    const h = hue * RAD2DEG;
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return new Color([f(5), f(3), f(1)]);
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
