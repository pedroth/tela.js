
import Box from "../Geometry/Box.js";
import { Vec3 } from "../Vector/Vector.js";
import NaiveScene from "./NaiveScene.js";
import Color from "../Color/Color.js";
import { drawBox } from "../Utils/Utils3D.js";

export default class VoxelScene extends NaiveScene {
    // after some tests, found that gridSpace ~ 4 * E[size of elements];
    constructor(gridSpace = 0.1) {
        super();
        this.gridMap = {};
        this.gridSpace = gridSpace;
    }

    addList(elements) {
        const binary = [0, 1];
        const n = binary.length ** 3;
        const powers = [binary.length ** 2, binary.length];
        for (let i = 0; i < elements.length; i++) {
            const elem = elements[i];
            const { name } = elem;
            this.id2ElemMap[name] = elem;
            this.sceneElements.push(elem);
            const pivot = elem.getBoundingBox().min;
            const points = []
            for (let k = 0; k < n; k++) {
                const i0 = Math.floor(k / powers[0])
                const i1 = Math.floor(k / powers[1]) % powers[1];
                const i2 = k % powers[1]
                points.push(pivot.add(Vec3(i0, i1, i2).mul(elem.getBoundingBox().diagonal)));
            }
            points.forEach(p => {
                const h = hash(p, this.gridSpace);
                if (!(h in this.gridMap)) {
                    this.gridMap[h] = {};
                }
                let cell = this.gridMap[h];
                cell[elem.name] = elem;
            })
        }
        return this;
    }

    clear() {
        super.clear();
        this.gridMap = {};
    }

    distanceToPoint(p) {
        const elements = this.getElementsNear(p);
        let distance = Number.MAX_VALUE;
        for (let i = 0; i < elements.length; i++) {
            distance = Math.min(distance, elements[i].distanceToPoint(p));
        }
        return distance;
    }

    normalToPoint(p) {
        let weight = 0;
        let normal = Vec3();
        const elements = this.getElementsNear(p);
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
        const maxDist = 10;
        const maxIte = maxDist / this.gridSpace;
        let t = 0;
        const elementsMap = {};
        for (let n = 0; n < maxIte; n++) {
            let p = ray.trace(t);
            const nearby = this.getElementsNear(p);
            for (let i = 0; i < nearby.length; i++) {
                elementsMap[nearby[i].name] = nearby[i];
            }
            t += this.gridSpace;
        }
        const elements = Object.values(elementsMap);
        if (elements.length) {
            let closestDistance = Number.MAX_VALUE;
            let closest;
            for (let i = 0; i < elements.length; i++) {
                const hit = elements[i].interceptWithRay(ray)
                if (hit && hit[0] < closestDistance) {
                    closest = hit;
                    closestDistance = hit[0];
                }
            }
            return closest;
        }
    }

    distanceOnRay(ray, combineLeafs = Math.min) {
        // Check the cell at ray origin first (cheapest check)
        const originCell = this.gridMap[hash(ray.init, this.gridSpace)];
        if (originCell) {
            const elements = this.getElementsNear(ray.init);
            let distance = Number.MAX_VALUE;
            for (let i = 0; i < elements.length; i++) {
                distance = combineLeafs(distance, elements[i].distanceToPoint(ray.init));
            }
            return distance;
        }
        // Walk the ray checking single cells, return distance to first occupied neighborhood
        const maxDist = 10;
        const maxIte = maxDist / this.gridSpace;
        let t = this.gridSpace;
        for (let n = 0; n < maxIte; n++) {
            const p = ray.trace(t);
            if (this.gridMap[hash(p, this.gridSpace)]) {
                // Found occupied cell, return approximate distance
                return t;
            }
            t += this.gridSpace;
        }
        return Number.MAX_VALUE;
    }

    getElementsNear(p) {
        const elements = {};
        const ix = Math.floor(p.x / this.gridSpace);
        const iy = Math.floor(p.y / this.gridSpace);
        const iz = Math.floor(p.z / this.gridSpace);
        const range = [-1, 0, 1];
        const n = range.length;
        const nn = n * n;
        const nnn = n * n * n;
        for (let k = 0; k < nnn; k++) {
            const dx = range[Math.floor(k / (nn)) % n];
            const dy = range[Math.floor(k / n) % n];
            const dz = range[k % n];
            const h = hashCoord(ix + dx, iy + dy, iz + dz);
            const cell = this.gridMap[h];
            if (cell) {
                Object.assign(elements, cell);
            }
        }
        return Object.values(elements);
    }

    getElementsInBox(box) {
        const size = box.diagonal.fold((e, x) => e * x, 1);
        const samples = Math.floor(size / this.gridSpace);
        let elements = [];
        for (let i = 0; i < samples; i++) {
            const p = box.sample();
            elements = elements.concat(Object.values(this.gridMap[hash(p, this.gridSpace)] || {}));
        }
        return elements;
    }

    rebuild() {
        return this;
    }

    debug(props) {
        const { camera, canvas } = props;
        const debugScene = new NaiveScene();
        Object.keys(this.gridMap)
            .forEach(k => {
                const elemsMap = this.gridMap[k] || {};
                Object.values(elemsMap).forEach(e => {
                    const pivot = e
                        .getBoundingBox()
                        .center
                        .map(z =>
                            Math.floor(z / this.gridSpace)
                        )
                        .scale(this.gridSpace);
                    drawBox({
                        box: new Box(
                            pivot,
                            pivot.add(Vec3(1, 1, 1).scale(this.gridSpace))
                        ),
                        color: Color.RED,
                        debugScene
                    });
                })
            })
        camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
        return canvas;
    }

    serialize() {
        const json = super.serialize();
        json.params = [this.gridSpace];
        json.type = VoxelScene.name;
        return json;
    }
}

// Hash function from https://www.youtube.com/watch?v=D2M8jTtKi44
function hashCoord(ix, iy, iz) {
    const h = (ix * 92837111) ^ (iy * 689287499) ^ (iz * 283923481);
    return Math.abs(h);
}

function hash(p, gridSpace) {
    return hashCoord(
        Math.floor(p.x / gridSpace),
        Math.floor(p.y / gridSpace),
        Math.floor(p.z / gridSpace)
    );
}