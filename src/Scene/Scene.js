
import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import { none, some } from "../Monads/Monads.js";
import Ray from "../Ray/Ray.js";
import { argmin } from "../Utils/Utils.js";
import { Vec2, Vec3 } from "../Vector/Vector.js";
import Point from "./Point.js";

export default class Scene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node();
    this.gridScene = {};
  }

  add(...elements) {
    elements.forEach(elem => {
      const classes = [Point];
      if (!classes.some((c) => elem instanceof c)) return this;
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    })
    return this;
  }

  clear() {
    this.id2ElemMap = {};
  }

  getElements() {
    return this.sceneElements;
  }

  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }

  _naiveIntercept(ray) {
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
}

class Node {
  isLeaf = false;
  constructor() {
    this.box = Box.EMPTY;
  }

  add(element) {
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left) {
      this.left = new Leaf(element);
    } else if (!this.right) {
      this.right = new Leaf(element);
    } else {
      this._addElementWhenTreeIsFull(element, elemBox);
    }
    return this;
  }

  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf(): this.right.getRandomLeaf();
  }

  interceptWith(ray, depth = 1) {
    if (depth === 12) {
      return this.getRandomLeaf().interceptWith(ray, 15);
      // return this.box.interceptWith(ray).map(p => [p, this.box.estimateNormal(p)]);
    }
    return this.box.interceptWith(ray).flatMap((p) => {
      const children = [this.left, this.right].filter(x => x);
      const closestBoxIndex = argmin(children, child => child.box.center.sub(p).length());
      const indexes = [closestBoxIndex, (closestBoxIndex + 1) % 2];
      for (let i = 0; i < indexes.length; i++) {
        const maybeHit = children[indexes[i]].interceptWith(ray, depth + 1);
        if (maybeHit.isSome()) return maybeHit;
      }
      return none();
    })
    // const { init: p, dir } = ray;
    // const children = [this.left, this.right];
    // const childrenDistances = children.map(child => child.box.distanceToPoint(p));
    // const closestBoxIndex = argmin(childrenDistances);
    // return children[closestBoxIndex].interceptWith(Ray(ray.trace(childrenDistances[closestBoxIndex]), dir), depth + 1);
  }

  _addElementWhenTreeIsFull(element, elemBox) {
    if (this.left.isLeaf && this.right.isLeaf) {
      this._addWithLeafs(element);
    } else {
      // at least one children is not a leaf
      const minIndex = argmin([
        this.left.box.distanceToBox(elemBox),
        this.right.box.distanceToBox(elemBox)
      ]);
      this._updateChildren(minIndex, element);
    }
  }

  _updateChildren(minIndex, element) {
    let child = [this.left, this.right][minIndex];
    if (!child.isLeaf) {
      child.add(element);
    } else {
      const aux = child.element;
      if (minIndex === 0) this.left = new Node().add(aux).add(element);
      if (minIndex === 1) this.right = new Node().add(aux).add(element);
    }
  }

  _addWithLeafs(element) {
    const elemBox = element.getBoundingBox();
    const distances = [
      elemBox.distanceToBox(this.left.box),
      elemBox.distanceToBox(this.right.box),
      this.left.box.distanceToBox(this.right.box)
    ]
    const index = argmin(distances);
    const index2Action = {
      0: () => {
        const aux = this.left;
        this.left = new Node();
        this.left.add(aux.element).add(element);
      },
      1: () => {
        const aux = this.right;
        this.right = new Node();
        this.right.add(aux.element).add(element);
      },
      2: () => {
        const aux = this.left;
        this.left = new Node();
        this.left.add(aux.element).add(this.right.element);
        this.right = new Leaf(element);
      }
    }
    index2Action[index]();
  }
}

class Leaf {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }

  getRandomLeaf() {
    return this;
  }

  interceptWith(ray, depth) {
    // return this.box.interceptWith(ray).map(pos => [pos, this.box.estimateNormal(pos)]);
    return this.element.interceptWith(ray);
  }
}
