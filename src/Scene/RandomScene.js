
import Box from "../Geometry/Box.js";
import Vec, { Vec2 } from "../Vector/Vector.js";
import { argmin } from "../Utils/Utils.js";
import NaiveScene from "./NaiveScene.js";
import Color from "../Color/Color.js";
import { drawBox } from "../Utils/Utils3D.js";
import PQueue from "../Utils/PQueue.js";

const rayCache = (gridSize = 0.01, dirGrid = 0.01) => {
    const cache = {};
    cache.table = {};
    function hash(p) {
        const integerCoord = p.map(z => Math.floor(z / gridSize));
        const h = (integerCoord.x * 92837111) ^ (integerCoord.y * 689287499) ^ (integerCoord.z * 283923481);
        return Math.abs(h);
    }
    function dirHash(d) {
        const sphericalCoords = Vec2(Math.atan2(d.y, d.x), Math.asin(d.z));
        const integerCoord = sphericalCoords.map(z => Math.floor(z / dirGrid));
        const h = (integerCoord.x * 92837111) ^ (integerCoord.y * 689287499);
        return Math.abs(h);
    }
    cache.put = (ray, value) => {
        const { init, dir } = ray;
        let h = hash(init);
        if (!(h in cache.table)) {
            cache.table[h] = {};
        }
        const dirCache = cache.table[h];
        h = dirHash(dir);
        dirCache[h] = value;
        return cache;
    }
    cache.get = (ray) => {
        const { init, dir } = ray;
        let h = hash(init);
        const dirCache = cache.table[h];
        if(dirCache) {
            h = dirHash(dir);
            return dirCache[h];
        }
        return;
    }

    return cache;
}

const RAY_CACHE = rayCache();

export default class RandomScene {
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
        return this.boundingBoxScene.getElemNear(p);
    }

    interceptWith(ray, level) {
        const nodeCache = RAY_CACHE.get(ray);
        if (nodeCache) {
            return leafsInterceptWith(nodeCache.leafs, ray);
        }
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
        let groupsQueue = PQueue.ofArray(
            [...clusterLeafs(this.boundingBoxScene.box, this.sceneElements.map(x => new Leaf(x)))],
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

    interceptWith(ray) {
        const boxHit = this.box.interceptWith(ray);
        if (!boxHit) return;
        if (this.leafs.length > 0) {
            RAY_CACHE.put(ray, this);
            return leafsInterceptWith(this.leafs, ray);
        }
        const children = [this.left, this.right];
        const hits = [];
        for (let i = 0; i < children.length; i++) {
            const hit = children[i].interceptWith(ray);
            if (hit) hits.push(hit);
        }
        const minIndex = argmin(hits, ([t]) => t);
        if (minIndex === -1) return;
        return hits[minIndex];
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
        const coin = RCACHE() < 0.01 ? 1 : 0;
        return children[(index + coin) % 2].getElemNear(p);
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
        if (this.leafs.length > 0) {
            const index = Math.floor(Math.random() * this.leafs.length);
            return this.leafs[index];
        }
        const children = [this.left, this.right];
        const index = Math.floor(Math.random() * children.length);
        return children[index].getRandomLeaf();

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

function random(n) {
    let index = 0;
    const numbers = new Float64Array(n).map(() => Math.random());
    return () => numbers[index++ % n];
}

const RCACHE = random(100);

function leafsInterceptWith(leafs, ray) {
    let closestDistance = Number.MAX_VALUE;
    let closest;
    for (let i = 0; i < leafs.length; i++) {
        const hit = leafs[i].interceptWith(ray);
        if (hit && hit[0] < closestDistance) {
            closest = hit;
            closestDistance = hit[0];
        }
    }
    return closest;
}