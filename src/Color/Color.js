/**
 * Class that abstracts colors.
 * 
 * Here colors are represented as [0,1]^3 vector.
 */

import { clamp } from "../Utils/Math";

const MAX_8BIT = 255;
export default class Color {
  constructor(rbg) {
    this.rgb = rbg;
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
    const clampColor = clamp(0, 1);
    return new Color([clampColor(r * this.red), clampColor(r * this.green), clampColor(r * this.blue)]);
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
