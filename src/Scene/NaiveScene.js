
import { none, some } from "../Monads/Monads.js";
import Vec from "../Vector/Vector.js";
import { smin } from "../Utils/Math.js";
import { argmin } from "../Utils/Utils.js";

export default class NaiveScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
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

  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }

  getElements() {
    return this.sceneElements;
  }

  distanceToPoint(p) {
    const elements = this.sceneElements;
    let distance = Number.MAX_VALUE;
    for (let i = 0; i < elements.length; i++) {
      distance = Math.min(distance, elements[i].distanceToPoint(p));
    }
    return distance;
  }

  estimateNormal(p) {
    const epsilon = 1e-3;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0; i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }

  interceptWith(ray) {
    const points = this.sceneElements;
    let closestDistance = Number.MAX_VALUE;
    let closest = none();
    for (let i = 0; i < points.length; i++) {
      points[i].interceptWith(ray)
        .map(([pos, normal]) => {
          const distance = ray
            .init
            .sub(pos)
            .length();
          if (distance < closestDistance) {
            closest = some([pos, normal]);
            closestDistance = distance;
          }
        })
    }
    return closest;
  }

  getElementNear(p) {
    return this.sceneElements[argmin(this.sceneElements, x => x.distanceToPoint(p))];
  }

  debug(params) {
    return params.canvas;
  }
}
