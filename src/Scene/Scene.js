import Box from "../Box/Box.js";
import { none, some } from "../Monads/Monads.js";
import { argmin } from "../Utils/Utils.js";
import { Vec3 } from "../Vector/Vector.js";
import Point from "./Point.js";

export default class Scene {
  constructor() {
    this.scene = {};
    this.db = new Node();
  }

  add(elem) {
    const classes = [Point];
    if (!classes.some((c) => elem instanceof c)) return this;
    const { name } = elem;
    this.scene[name] = elem;
    // this.db.add(elem);
    return this;
  }

  addObj(objStr, name) {
    objStr.split("\n")
      .forEach((lines, lineno) => {
        const spaces = lines.split(" ")
        if (spaces[0] === "v") {
          const v = spaces.slice(1, 4)
            .map(x => Number.parseFloat(x));
          if (Math.random() < 0.01) {
            this.add(
              Point
                .builder()
                .name(`${name}_${lineno}`)
                .position(
                  Vec3(...v)
                )
                .radius(0.01)
                .build()
            )
          }
        }
      })
    return this;
  }

  clear() {
    this.scene = {};
  }

  getElements() {
    return Object.values(this.scene);
  }

  interceptWith(ray) {
    const points = Object.values(this.scene);
    let closestDistance = Number.MAX_VALUE;
    let closest = none();
    for (let i = 0; i < points.length; i++) {
      points[i].interceptWith(ray)
        .map(([pos, normal]) => {
          const distance = ray
            .start
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
      if (this.left.isLeaf && this.right.isLeaf) {
        this._addWithLeafs(element);
      }
      // at least one children is not a leaf
      const minIndex = argmin([this.left.box.distance(elemBox), this.right.box.distance(elemBox)])
      this._updateChildren(minIndex, element);
    }
    return this;
  }

  _updateChildren(minIndex, element) {
    let child = [this.left, this.right][minIndex];
    if (!child.isLeaf) {
      child.add(element);
    } else {
      const aux = child.element;
      child = new Node().add(aux).add(element);
    }
  }

  _addWithLeafs(element) {
    const elemBox = element.getBoundingBox();
    const distances = [
      elemBBox.distance(this.left.box),
      elemBBox.distance(this.right.box),
      this.left.box.distance(this.right.box)
    ]
    const index = argmin(distances);
    index2Action = {
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
}
