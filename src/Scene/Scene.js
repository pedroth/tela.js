export default class Scene {
    constructor() {
      this.scene = {};
    }
  
    addElement(elem) {
      const classes = [Line, Point, Path];
      if (!classes.some((c) => elem instanceof c)) return this;
      const { name } = elem;
      this.scene[name] = elem;
      return this;
    }
  
    clear() {
      this.scene = {};
    }
  
    getElements() {
      return Object.values(this.scene);
    }
  }
  
  class Line {
    /**
     *
     * @param {String} name
     * @param {Vec3} start
     * @param {Vec3} end
     * @param {Array4} color
     */
    constructor(name, start, end, color) {
      this.name = name;
      this.start = start;
      this.end = end;
      this.color = color;
    }
  
    static builder() {
      return new LineBuilder();
    }
  }
  
  class LineBuilder {
    constructor() {
      this._name;
      this._start;
      this._end;
      this._color;
    }
  
    name(name) {
      this._name = name;
      return this;
    }
  
    start(start) {
      this._start = start;
      return this;
    }
  
    end(end) {
      this._end = end;
      return this;
    }
  
    color(r = 0, g = 0, b = 0, alpha = 255) {
      this._color = [r, g, b, alpha];
      return this;
    }
  
    build() {
      const attrs = [this._name, this._start, this._end, this._color];
      if (attrs.some((x) => x === undefined)) {
        throw new Error("Line is incomplete");
      }
      return new Line(...attrs);
    }
  }
  
  Scene.Line = Line;
  
  class Path {
    /**
     *
     * @param {String} name
     * @param {Array<Vec3>} path
     * @param {Array4} color
     */
    constructor(name, path, color) {
      this.name = name;
      this.path = path;
      this.color = color;
    }
  
    static builder() {
      return new PathBuilder();
    }
  }
  
  class PathBuilder {
    constructor() {
      this._name;
      this._path;
      this._color;
    }
  
    name(name) {
      this._name = name;
      return this;
    }
  
    path(path) {
      this._path = path;
      return this;
    }
  
    color(r = 0, g = 0, b = 0, alpha = 255) {
      this._color = [r, g, b, alpha];
      return this;
    }
  
    build() {
      const attrs = [this._name, this._path, this._color];
      if (attrs.some((x) => x === undefined)) {
        throw new Error("Path is incomplete");
      }
      return new Path(...attrs);
    }
  }
  
  Scene.Path = Path;
  
  class Point {
    /**
     *
     * @param {String} name
     * @param {Number} radius
     * @param {Array4} color
     */
    constructor(name, radius, color, position, shader, disableDepthBuffer) {
      this.name = name;
      this.radius = radius;
      this.color = color;
      this.position = position;
      this.shader = shader;
      this.disableDepthBuffer = disableDepthBuffer;
    }
  
    static builder() {
      return new PointBuilder();
    }
  }
  
  class PointBuilder {
    constructor() {
      this._name;
      this._radius;
      this._color;
      this._shader = ({ rgb }) => rgb;
      this._disableDepthBuffer = false;
    }
  
    name(name) {
      this._name = name;
      return this;
    }
  
    radius(radius) {
      this._radius = radius;
      return this;
    }
  
    color(r = 0, g = 0, b = 0, alpha = 255) {
      this._color = [r, g, b, alpha];
      return this;
    }
  
    position(posVec3) {
      this._position = posVec3;
      return this;
    }
  
    shader(shader) {
      this._shader = shader;
      return this;
    }
  
    disableDepthBuffer(disableDepthBuffer) {
      this._disableDepthBuffer = disableDepthBuffer;
      return this;
    }
  
    build() {
      const attrs = [
        this._name,
        this._radius,
        this._color,
        this._position,
        this._shader,
        this._disableDepthBuffer,
      ];
      if (attrs.some((x) => x === undefined)) {
        throw new Error("Point is incomplete");
      }
      return new Point(...attrs);
    }
  }
  
  Scene.Point = Point;
  