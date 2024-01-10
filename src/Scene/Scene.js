
import Box from "../Box/Box.js";
import { none, some } from "../Monads/Monads.js";
import { argmin } from "../Utils/Utils.js";
import Point from "./Point.js";
import Ray from "../Ray/Ray.js";
import Vec from "../Vector/Vector.js";
import { smin } from "../Utils/Math.js";

export default class Scene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node();
  }

  add(...elements) {
    return this.addList(elements);
  }

  addList(elements) {
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const classes = [Point];
      if (!classes.some((c) => elem instanceof c)) return this;
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }

  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node();
  }

  getElements() {
    return this.sceneElements;
  }

  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }

  distanceToPoint(p) {
    return this.boundingBoxScene.distanceToPoint(p)
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
}

class Node {
  isLeaf = false;
  numberOfLeafs = 0;
  leafs = [];
  constructor() {
    this.box = Box.EMPTY;
  }

  add(element) {
    this.numberOfLeafs += 1;
    this.leafs.push(element);
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

  distanceToPoint(p) {
    if (this.numberOfLeafs <= 2) {
      return this.getElements().reduce((e, leaf) => smin(e, leaf.distanceToPoint(p)), 1000);
    }
    const children = [this.left, this.right];
    const index = argmin(children, c => c.box.distanceToPoint(p));
    return children[index].distanceToPoint(p);
  }

  getElements() {
    return this.leafs;
  }

  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }

  interceptWith(ray, depth = 1) {
    // if (this.numberOfLeafs === 5) {
    //   // return this.getRandomLeaf().interceptWith(ray, 10);
    //   return this.box.interceptWith(ray).map(p => [p, this.box.estimateNormal(p)]);
    // }
    return this.box.interceptWith(ray).flatMap((p) => {
      const children = [this.left, this.right].filter(x => x);
      const hits = [];
      for (let i = 0; i < children.length; i++) {
        const maybeHit = children[i].interceptWith(ray, depth + 1);
        if (maybeHit.isSome()) hits.push(maybeHit.orElse());
      }
      const minIndex = argmin(hits, ([point]) => point.sub(ray.init).length());
      if (minIndex === -1) return none();
      return some(hits[minIndex]);
    })
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

  distanceToPoint(x) {
    // return this.box.distanceToPoint(x);
    return this.element.distanceToPoint(x);
  }

  getLeafs() {
    return [this];
  }

  getRandomLeaf() {
    return this;
  }

  interceptWith(ray, depth) {
    // return this.box.interceptWith(ray).map(pos => [pos, this.box.estimateNormal(pos)]);
    return this.element.interceptWith(ray);
  }
}
