
import Box from "../Box/Box.js";
import Vec, { Vec3 } from "../Vector/Vector.js";
import { argmin } from "../Utils/Utils.js";
import { none, some } from "../Monads/Monads.js";
import Line from "./Line.js";
import PQueue from "../PQueue/PQueue.js";

export default class KScene {
    constructor(k = 10) {
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.boundingBoxScene = new Node(k);
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

    getElementInBox(box) {
        return this.boundingBoxScene.getElemIn(box);
    }

    getElementNear(p) {
        return this.boundingBoxScene.getElemNear(p);
    }

    interceptWith(ray, level) {
        return this.boundingBoxScene.interceptWith(ray, level);
    }

    distanceToPoint(p) {
        return this.getElemNear(p).distanceToPoint(p);
    }

    getElemNear(p) {
        if (this.boundingBoxScene.numberOfLeafs < 2) {
            return this.boundingBoxScene.getElemNear(p);
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

    estimateNormal(p) {
        const epsilon = 1e-9;
        const n = p.dim;
        const grad = [];
        const d = this.distanceToPoint(p);
        for (let i = 0; i < n; i++) {
            grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
        }
        return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
    }

    debug(props) {
        return props.canvas;
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
}

class Node {
    isLeaf = false;
    numberOfLeafs = 0;
    constructor(k) {
        this.k = k;
        this.box = Box.EMPTY;
        this.children = [];
    }

    add(element) {
        this.numberOfLeafs += 1;
        const elemBox = element.getBoundingBox();
        this.box = this.box.add(elemBox);
        if (this.children.length < this.k)
            this.children.push(new Leaf(element));
        else {
            
        }
        return this;
    }

    interceptWith(ray, depth = 1) {
        return this.box.interceptWith(ray).flatMap(() => {
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

    distanceToPoint(p) {
        const children = [this.left, this.right].filter(x => x);
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].distanceToPoint(p);
    }

    getElemNear(p) {
        const children = [this.left, this.right].filter(x => x);
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].getElemNear(p);
    }

    getElemIn(box) {
        const children = [this.left, this.right].filter(x => x);
        for (let i = 0; i < children.length; i++) {
            if (!children[i].box.sub(box).isEmpty) {
                return children[i].getElemIn(box);
            }
        }
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
        if (!box.sub(this.box).isEmpty) return some(this.element);
        return none();
    }

    getElemNear() {
        return this.element;
    }

    interceptWith(ray) {
        return this.element.interceptWith(ray);
    }

    join(nodeOrLeaf) {
        if (nodeOrLeaf.isLeaf) return new Node().add(this.element).add(nodeOrLeaf.element);
        return nodeOrLeaf.join(this);
    }
}
