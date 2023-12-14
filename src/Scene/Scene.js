import Box from "../Box/Box.js";
import { none, some } from "../Monads/Monads.js";
import { argmin } from "../Utils/Utils.js";
import { Vec3 } from "../Vector/Vector.js";
import Point from "./Point.js";

export default class Scene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElems = [];
    this.boundingBoxScene = new Node();
    this.gridScene = {};
  }

  add(elem) {
    const classes = [Point];
    if (!classes.some((c) => elem instanceof c)) return this;
    const { name } = elem;
    this.id2ElemMap[name] = elem;
    this.sceneElems.push(elem);
    this.boundingBoxScene.add(elem);
    return this;
  }

  addObj(objStr, name) {
    objStr.split("\n")
      .forEach((lines, lineno) => {
        const spaces = lines.split(" ")
        if (spaces[0] === "v") {
          const v = spaces.slice(1, 4)
            .map(x => Number.parseFloat(x));
          this.add(
            Point
              .builder()
              .name(`${name}_${lineno}`)
              .position(
                Vec3(...v)
              )
              .radius(0.001)
              .build()
          )
        }
      })
    return this;
  }

  clear() {
    this.id2ElemMap = {};
  }

  getElements() {
    return Object.values(this.id2ElemMap);
  }

  interceptWith(ray) {
    return this.boundingBoxScene.interceptWith(ray);
  }

  _naiveIntercept(ray) {
    const points = this.sceneElems;
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

  interceptWith(ray, depth = 1) {
    if (depth === 4) {
      return this.box.interceptWith(ray).map(p => [p, this.box.estimateNormal(p)]);
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

  interceptWith(ray) {
    return this.element.interceptWith(ray);
    // return this.box.interceptWith(ray).map(pos => [pos, this.box.estimateNormal(pos)]);
  }
}
