
import Box from "../Geometry/Box.js";
import Vec, { Vec3 } from "../Vector/Vector.js";
import { argmin } from "../Utils/Utils.js";
import PQueue from "../Utils/PQueue.js";
import NaiveScene from "./NaiveScene.js";
import Color from "../Color/Color.js";
import { drawBox } from "../Utils/Utils3D.js";

export default class KScene extends NaiveScene {
    constructor(k = 10) {
        super();
        this.k = k;
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.boundingBoxScene = new Node(k);
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
        super.clear();
        this.boundingBoxScene = new Node(this.k);
    }

    distanceToPoint(p, combineLeafs = Math.min) {
        if (this.boundingBoxScene.leafs.length > 0) {
            return distanceFromLeafs(this.boundingBoxScene.leafs, p, combineLeafs);
        }
        return this.getElementNear(p).distanceToPoint(p);
    }

    normalToPoint(p) {
        let normal = Vec3();
        let weight = 0;
        const ones = Vec3(1, 1, 1).scale(1 / (2 * this.k));
        const box = new Box(p.sub(ones), p.add(ones));
        const elements = this.getElementInBox(box);
        const size = elements.length;
        for (let i = 0; i < size; i++) {
            const n = elements[i].normalToPoint(p);
            const d = 1 / elements[i].distanceToPoint(p);
            normal = normal.add(n.scale(d));
            weight += d;
        }
        return normal.length() > 0 ? normal.scale(1 / weight).normalize() : super.normalToPoint(p);
    }

    interceptWithRay(ray) {
        return this.boundingBoxScene.interceptWithRay(ray);
    }

    distanceOnRay(ray, combineLeafs = Math.min) {
        return this.boundingBoxScene.distanceOnRay(ray, combineLeafs);
    }

    getElementNear(p) {
        if (this.boundingBoxScene.leafs.length > 0) {
            return this.boundingBoxScene.getElementNear(p);
        }
        const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right]
            .map(x => ({ node: x, distance: x.box.distanceToPoint(p) }));
        let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
        while (stack.length) {
            const { leaf, node } = stack.pop();
            if (leaf) return leaf.getElemNear(p);
            if (node.leafs.length > 0) {
                for (let i = 0; i < node.leafs.length; i++) {
                    const leaf = node.leafs[i];
                    stack.push({ leaf, distance: leaf.box.distanceToPoint(p) })
                }
            }
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
        if (!this.sceneElements.length) return this;
        let groupsQueue = PQueue.ofArray(
            clusterLeafs(this.boundingBoxScene.box, this.sceneElements.map(x => new Leaf(x))),
            (a, b) => b.length - a.length
        )
        while (
            groupsQueue
                .data
                .map(x => x.length > this.k)
                .some(x => x)
        ) {
            if (groupsQueue.peek().length > this.k) {
                const groupOfLeafs = groupsQueue.pop();
                const box = groupOfLeafs.reduce((e, x) => e.add(x.box), new Box());
                const [left, right] = clusterLeafs(box, groupOfLeafs);
                groupsQueue.push(left);
                groupsQueue.push(right)
            }
        }
        let nodeOrLeafStack = groupsQueue
            .data
            .map(group =>
                group.reduce((e, x) =>
                    e.add(x.element),
                    new Node(this.k)
                )
            );
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

    serialize() {
        const json = super.serialize();
        json.params = [this.k];
        json.type = KScene.name;
        return json;
    }
}

class Node {
    isLeaf = false;
    numberOfLeafs = 0;
    constructor(k) {
        this.k = k;
        this.box = Box.EMPTY;
        this.leafs = [];
        this.parent = undefined;
    }

    add(element) {
        this.numberOfLeafs += 1;
        const elemBox = element.getBoundingBox();
        this.box = this.box.add(elemBox);
        if (!this.left && !this.right) {
            this.leafs.push(new Leaf(element));
            if (this.leafs.length <= this.k) return this;
            // group children into cluster
            const [lefts, rights] = clusterLeafs(this.box, this.leafs);
            this.left = new Node(this.k).addList(lefts.map(x => x.element));
            this.right = new Node(this.k).addList(rights.map(x => x.element));
            this.left.parent = this;
            this.right.parent = this;
            this.leafs = [];
        } else {
            const children = [this.left, this.right];
            const index = argmin(children, x => element.getBoundingBox().distanceToBox(x.box));
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

    interceptWithRay(ray) {
        if (this.leafs.length > 0) {
            return leafsInterceptWithRay(this.leafs, ray);
        }
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
        if(!this.left && !this.right) return Number.MAX_VALUE;
        return this.getElementNear(p).distanceToPoint(p);
    }

    distanceOnRay(ray, combineLeafs) {
        if (this.leafs.length > 0) {
            return distanceFromLeafs(this.leafs, ray.init, combineLeafs);
        }
        const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
        const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
        if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE) return this.distanceToPoint(ray.init);
        const first = leftT <= rightT ? this.left : this.right;
        const second = leftT > rightT ? this.left : this.right;
        const firstT = Math.min(leftT, rightT);
        const secondT = Math.max(leftT, rightT);
        const firstHit = first.distanceOnRay(ray, combineLeafs);
        if (firstHit < secondT) return firstHit;
        const secondHit = second.distanceOnRay(ray, combineLeafs);
        return secondHit <= firstHit ? secondHit : firstHit;
    }

    getElementNear(p) {
        if (this.leafs.length > 0) {
            const minIndex = argmin(this.leafs, x => x.distanceToPoint(p));
            return this.leafs[minIndex].element;
        }
        const children = [this.left, this.right];
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].getElementNear(p);
    }

    getNodeNear(p) {
        if (this.leafs.length > 0) {
            return this;
        }
        const children = [this.left, this.right];
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].getNodeNear(p);
    }

    getLeafsNear(p) {
        if (this.leafs.length > 0) {
            return this.leafs;
        }
        const children = [this.left, this.right];
        const index = argmin(children, n => n.box.center.sub(p).length());
        return children[index].getLeafsNear(p);
    }

    getElemInBox(box) {
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
                elements = elements.concat(children[i].getElemInBox(box));
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
        newNode.left.parent = newNode;
        newNode.right = nodeOrLeaf;
        newNode.right.parent = newNode;
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

    interceptWithRay(ray) {
        return this.element.interceptWithRay(ray);
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
        // add a point to an empty cluster 
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
    return clusterIndexes.map((indxs) => indxs.map(indx => leafs[indx]));
}


function leafsInterceptWithRay(leafs, ray) {
    let closestDistance = Number.MAX_VALUE;
    let closest;
    for (let i = 0; i < leafs.length; i++) {
        const hit = leafs[i].interceptWithRay(ray);
        if (hit && hit[0] < closestDistance) {
            closest = hit;
            closestDistance = hit[0];
        }
    }
    return closest;
}

function distanceFromLeafs(leafs, p, combineLeafs) {
    const elements = leafs.map(x => x.element);
    let distance = Number.MAX_VALUE;
    for (let i = 0; i < elements.length; i++) {
        distance = combineLeafs(distance, elements[i].distanceToPoint(p));
    }
    return distance;
}