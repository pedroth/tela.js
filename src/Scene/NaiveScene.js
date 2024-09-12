
import Vec from "../Vector/Vector.js";
import { argmin, hashStr } from "../Utils/Utils.js";
import Box from "../Geometry/Box.js";

export default class NaiveScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }

  getHash() {
    const elements = this.getElements();
    let combinedHash = 0;
    const prime = 31;  // A prime number, typically used in hash functions
    for (let i = 0; i < elements.length; i++) {
      const hash = hashStr(elements[i].name);
      combinedHash = (combinedHash * prime) ^ hash;
    }
    return combinedHash >>> 0; // unsigned shift operator, converts combinedHash to unsigned number
  }

  add(...elements) {
    return this.addList(elements);
  }

  addList(elements) {
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
    }
    return this;
  }

  getElements() {
    return this.sceneElements;
  }

  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }

  distanceToPoint(p) {
    const elements = this.sceneElements;
    let distance = Number.MAX_VALUE;
    for (let i = 0; i < elements.length; i++) {
      distance = Math.min(distance, elements[i].distanceToPoint(p));
    }
    return distance;
  }

  normalToPoint(p) {
    const epsilon = 1e-3;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0; i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }

  interceptWithRay(ray) {
    const elements = this.sceneElements;
    let closestDistance = Number.MAX_VALUE;
    let closest;
    for (let i = 0; i < elements.length; i++) {
      const hit = elements[i].interceptWithRay(ray);
      if (hit && hit[0] < closestDistance) {
        closest = hit;
        closestDistance = hit[0];
      }
    }
    return closest;
  }

  distanceOnRay(ray) {
    return this.distanceToPoint(ray.init);
  }

  getElementNear(p) {
    return this.sceneElements[argmin(this.sceneElements, x => x.distanceToPoint(p))];
  }

  getElementInBox(box) {
    return this.sceneElements.reduce((e, x) => e.add(x.getBoundingBox().collidesWith(box)), Box.EMPTY);
  }

  rebuild() {
    return this;
  }

  debug(params) {
    return params.canvas;
  }

  serialize() {
    const json = {
      params: [],
      type: NaiveScene.name,
      sceneData: this.getElements().map(x => x.serialize()),
    };

    return json;
  }
}
