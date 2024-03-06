
import Box from "../Box/Box.js";
import Vec from "../Vector/Vector.js";
import { argmin } from "../Utils/Utils.js";
import { none, some } from "../Monads/Monads.js";
import PQueue from "../PQueue/PQueue.js";
import NaiveScene from "./NaiveScene.js";
import Color from "../Color/Color.js";
import { drawBox } from "../Utils/Utils3D.js";

export default class KScene {
    constructor(k = 10) {
        this.k = k;
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
        this.boundingBoxScene = new Node(this.k);
    }

    getElements() {
        return this.sceneElements;
    }

    getElementInBox(box) {
        return this.boundingBoxScene.getElemIn(box);
    }

    getElementNear(p) {
        if (this.boundingBoxScene.leafs.length > 0) {
            return this.boundingBoxScene.getElemNear(p);
        }
        const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right]
            .map(x => ({ node: x, distance: x.box.distanceToPoint(p) }));
        let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
        while (stack.length) {
            const { leaf, node } = stack.pop();
            if (leaf) return leaf.getElemNear(p);
            if (node.leafs.length > 0) {
                node
                    .leafs
                    .forEach(leaf =>
                        stack.push({ leaf, distance: leaf.box.distanceToPoint(p) })
                    );
            }
            const children = [node.left, node.right]
                .filter(x => x)
                .map(x => ({ node: x, distance: x.box.distanceToPoint(p) }));
            children.forEach(c => stack.push(c));
        }
    }

    interceptWith(ray, level) {
        return this.boundingBoxScene.interceptWith(ray, level);
    }

    distanceToPoint(p) {
        if (this.boundingBoxScene.leafs.length > 0) {
            let distance = Number.MAX_VALUE;
            const leafs = this.boundingBoxScene.leafs
            for (let i = 0; i < leafs.length; i++) {
                distance = Math.min(distance, leafs[i].element.distanceToPoint(p));
            }
            return distance;
        }
        return this.getElementNear(p).distanceToPoint(p);
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
        const { camera, canvas } = props;
        let { node, level, level2colors, debugScene } = props;
        node = node || this.boundingBoxScene;
        level = level || 0;
        level2colors = level2colors || [];
        debugScene = debugScene || new NaiveScene();
        if (level === 0) {
            let maxLevels = Math.round(Math.log2(node.numberOfLeafs / this.k)) + 1;
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

    rebuild() {
        let groupsStack = clusterLeafs(this.boundingBoxScene.box, this.sceneElements.map(x => new Leaf(x)))
        while (
            groupsStack
                .map(x => x.length > this.k)
                .some(x => x)
        ) {
            const groupOfLeafs = groupsStack.pop();
            if (groupOfLeafs.length > this.k) {
                const box = groupOfLeafs.reduce((e, x) => e.add(x.box), new Box());
                const [left, right] = clusterLeafs(box, groupOfLeafs);
                groupsStack.push(left);
                groupsStack.push(right)
            }
        }
        let nodeOrLeafStack = groupsStack.map(group => group.reduce((e, x) => e.add(x.element), new Node(this.k)));
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
        this.leafs = [];
    }

    add(element) {
        this.numberOfLeafs += 1;
        const elemBox = element.getBoundingBox();
        this.box = this.box.add(elemBox);
        if (!this.left && !this.right) {
            this.leafs.push(new Leaf(element));
            if (this.leafs.length < this.k) return this;
            // group children into cluster
            const [lefts, rights] = clusterLeafs(this.box, this.leafs);
            this.left = new Node(this.k).addList(lefts.map(x => x.element));
            this.right = new Node(this.k).addList(rights.map(x => x.element));
            this.leafs = [];
        } else {
            const children = [this.left, this.right];
            const index = argmin(children, x => element.boundingBox.distanceToBox(x.box));
            children[index].add(element);
        }
        return this;
    }

    addList(elements) {
        for (let i = 0; i < elements.length; i++) {
            this.add(elements[i]);
        }
        return this;
    }

    interceptWith(ray, depth = 1) {
        if (this.leafs.length > 0) {
            return leafsInterceptWith(this.leafs, ray);
        }
        return this.box.interceptWith(ray).flatMap(() => {
            const children = [this.left, this.right];
            const hits = [];
            for (let i = 0; i < children.length; i++) {
                children[i].interceptWith(ray, depth + 1)
                    .forEach(hit => hits.push(hit));
            }
            const minIndex = argmin(hits, ([point]) => point.sub(ray.init).length());
            if (minIndex === -1) return none();
            return some(hits[minIndex]);
        })
    }

    distanceToPoint(p) {
        return this.getElemNear(p).distanceToPoint(p);
    }

    getElemNear(p) {
        if (this.leafs.length > 0) {
            const minIndex = argmin(this.leafs, x => x.distanceToPoint(p));
            return this.leafs[minIndex].element;
        }
        const children = [this.left, this.right];
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].getElemNear(p);
    }

    getElemIn(box) {
        let elements = [];
        if (this.leafs.length > 0) {
            this.leafs.forEach(leaf =>
                !leaf.box.sub(box).isEmpty &&
                elements.push(leaf.element)
            );
            return elements;
        }
        const children = [this.left, this.right];
        for (let i = 0; i < children.length; i++) {
            if (!children[i].box.sub(box).isEmpty) {
                elements = elements.concat(children[i].getElemIn(box));
            }
        }
        return elements;
    }

    getRandomLeaf() {
        const index = Math.floor(Math.random() * this.children.length);
        return this.children[index].isLeaf ? this.children[index] : this.children[index].getRandomLeaf();
    }

    join(nodeOrLeaf) {
        if (nodeOrLeaf.isLeaf) return this.add(nodeOrLeaf.element);
        const newNode = new Node(this.k);
        newNode.left = this;
        newNode.right = nodeOrLeaf;
        newNode.box = this.box.add(nodeOrLeaf.box);
        newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
        return newNode;
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
        if (!box.sub(this.box).isEmpty) return [this.element];
        return [];
    }

    getElemNear() {
        return this.element;
    }

    interceptWith(ray) {
        return this.element.interceptWith(ray);
    }
}


function clusterLeafs(box, leafs, it = 10) {
    // initialization
    const clusters = [box.sample(), box.sample()];
    const clusterIndexes = [];
    for (let i = 0; i < it; i++) {
        for (let i = 0; i < clusters.length; i++) {
            clusterIndexes[i] = [];
        }
        // predict
        for (let j = 0; j < leafs.length; j++) {
            const leafPosition = leafs[j].box.center;
            const kIndex = argmin(clusters, c => c.sub(leafPosition).squareLength());
            clusterIndexes[kIndex].push(j);
        }
        for (let j = 0; j < clusters.length; j++) {
            if (clusterIndexes[j].length === 0) {
                const dataPoints = clusterIndexes[(j + 1) % clusters.length];
                clusterIndexes[j].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
            }
        }
        // update clusters
        for (let j = 0; j < clusters.length; j++) {
            let acc = Vec.ZERO(box.dim);
            for (let k = 0; k < clusterIndexes[j].length; k++) {
                const leafPosition = leafs[clusterIndexes[j][k]].box.center;
                acc = acc.add(leafPosition);
            }
            clusters[j] = acc.scale(1 / clusterIndexes[j].length);
        }
    }
    return [...clusterIndexes].map((indxs) => indxs.map(indx => leafs[indx]));
}


function leafsInterceptWith(leafs, ray) {
    let closestDistance = Number.MAX_VALUE;
    let closest = none();
    for (let i = 0; i < leafs.length; i++) {
        leafs[i].interceptWith(ray)
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