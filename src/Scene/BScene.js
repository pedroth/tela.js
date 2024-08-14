
import Box from "../Geometry/Box.js";
import { argmin } from "../Utils/Utils.js";
import Color from "../Color/Color.js";
import NaiveScene from "./NaiveScene.js";
import PQueue from "../Utils/PQueue.js";
import { drawBox } from "../Utils/Utils3D.js";

export default class BScene extends NaiveScene {
  constructor() {
    super();
    this.boundingBoxScene = new Node();
  }

  addList(elements) {
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }

  clear() {
    super.clear()
    this.boundingBoxScene = new Node();
  }

  distanceToPoint(p) {
    return this.getElementNear(p).distanceToPoint(p);
  }

  interceptWithRay(ray, level) {
    if (!this.boundingBoxScene) return;
    return this.boundingBoxScene.interceptWithRay(ray, level);
  }

  distanceOnRay(ray) {
    return this.boundingBoxScene.distanceOnRay(ray);
  }

  getElementNear(p) {
    if (this.boundingBoxScene.numberOfLeafs < 2) {
      return this.boundingBoxScene.getElementNear(p);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right]
      .map(x => ({ node: x, distance: x.box.distanceToPoint(p) }));
    let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
    while (stack.length) {
      const { node } = stack.pop();
      if (node.isLeaf) return node.getElemNear(p);
      const children = [node.left, node.right]
        .filter(x => x)
        .map(x => ({ node: x, distance: x.box.distanceToPoint(p) }));
      children.forEach(c => stack.push(c));
    }
  }

  getElementInBox(box) {
    return this.boundingBoxScene.getElemInBox(box);
  }

  rebuild() {
    let nodeOrLeafStack = this.sceneElements.map(x => new Leaf(x));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, x => nodeOrLeaf.box.distanceToBox(x.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1); // mutates array
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }

  debug(props) {
    const { camera, canvas } = props;
    let { node, level, level2colors, debugScene } = props;
    node = node || this.boundingBoxScene;
    level = level || 0;
    level2colors = level2colors || [];
    debugScene = debugScene || new NaiveScene();
    if (level === 0) {
      let maxLevels = Math.round(Math.log2(node.numberOfLeafs));
      maxLevels = maxLevels === 0 ? 1 : maxLevels;
      for (let i = 0; i <= maxLevels; i++)
        level2colors.push(
          Color.RED.scale(1 - i / maxLevels).add(Color.BLUE.scale(i / maxLevels))
        );
    }
    debugScene = drawBox({ box: node.box, color: level2colors[level], debugScene });
    if (!node.isLeaf && node.left) {
      this.debug({ canvas, camera, node: node.left, level: level + 1, level2colors, debugScene })
    }
    if (!node.isLeaf && node.right) {
      this.debug({ canvas, camera, node: node.right, level: level + 1, level2colors, debugScene })
    }
    if (level === 0) return camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }

  serialize() {
    const json = this.super.serialize();
    json.type = BScene.name;
    return json;
  }
}

class Node {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor() {
    this.box = Box.EMPTY;
  }

  add(element) {
    this.numberOfLeafs += 1;
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

  addList(elements) {
    for (let i = 0; i < elements.length; i++) {
      this.add(elements[i]);
    }
    return this;
  }

  interceptWithRay(ray) {
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE) return;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.interceptWithRay(ray);
    if (firstHit && firstHit[0] < secondT) return firstHit;
    const secondHit = second.interceptWithRay(ray);
    return secondHit && secondHit[0] < (firstHit?.[0] ?? Number.MAX_VALUE) ? secondHit : firstHit;
  }

  distanceToPoint(p) {
    const children = [this.left, this.right].filter(x => x);
    const index = argmin(children, n => n.box.center.sub(p).length());
    return children[index].distanceToPoint(p);
  }

  distanceOnRay(ray) {
    if (this.left.isLeaf && this.right.isLeaf) {
      return Math.min(
        this.left.distanceToPoint(ray.init),
        this.right.distanceToPoint(ray.init)
      );
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE) return Number.MAX_VALUE;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const firstT = Math.min(leftT, rightT);
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.distanceOnRay(ray, firstT);
    if (firstHit < secondT) return firstHit;
    const secondHit = second.distanceOnRay(ray, secondT);
    return secondHit <= firstHit ? secondHit : firstHit;
  }

  getElementNear(p) {
    const children = [this.left, this.right].filter(x => x);
    const index = argmin(children, n => n.box.center.sub(p).length());
    return children[index].getElemNear(p);
  }

  getElemInBox(box) {
    let elements = [];
    const children = [this.left, this.right].filter(x => x);
    for (let i = 0; i < children.length; i++) {
      if (!children[i].box.sub(box).isEmpty) {
        elements = elements.concat(children[i].getElemIn(box));
      }
    }
    return elements;
  }

  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }

  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf) return this.add(nodeOrLeaf.element);
    const newNode = new Node();
    newNode.left = this;
    newNode.right = nodeOrLeaf;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
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
    this.numberOfLeafs = 1;
  }

  distanceToPoint(x) {
    return this.element.distanceToPoint(x);
  }

  getLeafs() {
    return [this];
  }

  getRandomLeaf() {
    return this;
  }

  getElemIn(box) {
    if (!box.sub(this.box).isEmpty) return [this.element];
    return [];
  }

  getElemNear() {
    return this.element;
  }

  interceptWithRay(ray) {
    return this.element.interceptWithRay(ray);
  }

  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf) return new Node().add(this.element).add(nodeOrLeaf.element);
    return nodeOrLeaf.join(this);
  }
}