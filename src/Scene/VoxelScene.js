
import Box from "../Box/Box.js";
import Vec, { Vec3 } from "../Vector/Vector.js";
import NaiveScene from "./NaiveScene.js";
import Color from "../Color/Color.js";
import { drawBox } from "../Utils/Utils3D.js";

export default class VoxelScene {
    // after some tests, found that gridSpace ~ 4 * E[size of elements];
    constructor(gridSpace = 0.1) {
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.gridMap = {};
        this.gridSpace = gridSpace;
    }

    // Hash function from https://www.youtube.com/watch?v=D2M8jTtKi44
    hash(p) {
        const integerCoord = p.map(z => Math.floor(z / this.gridSpace));
        const h = (integerCoord.x * 92837111) ^ (integerCoord.y * 689287499) ^ (integerCoord.z * 283923481);
        return Math.abs(h);
    }

    add(...elements) {
        return this.addList(elements);
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
                const h = this.hash(p);
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
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.gridMap = {};
    }

    getElements() {
        return this.sceneElements;
    }

    getElementInBox(box) {
        // TODO
    }

    getElementNear(p) {
        // TODO
    }

    interceptWith(ray) {
        const maxDist = 10;
        const maxIte = maxDist / this.gridSpace;
        let t = 0;
        let elements = [];
        for (let n = 0; n < maxIte; n++) {
            let p = ray.trace(t);
            const newElements = Object.values(this.gridMap[this.hash(p)] || {});
            if (newElements?.length) {
                elements = elements.concat(newElements);
            }
            t += this.gridSpace;
        }
        if (elements?.length) {
            let closestDistance = Number.MAX_VALUE;
            let closest;
            for (let i = 0; i < elements.length; i++) {
                const hit = elements[i].interceptWith(ray)
                if (hit && hit[0] < closestDistance) {
                    closest = hit;
                    closestDistance = hit[0];
                }
            }
            return closest;
        }
    }

    distanceToPoint(p) {
        // TODO
        return Number.MAX_VALUE;
    }

    distanceOnRay(ray) {
        const maxDist = 10;
        const maxIte = maxDist / this.gridSpace;
        let t = 0;
        let elements = [];
        for (let n = 0; n < maxIte; n++) {
            let p = ray.trace(t);
            const newElements = Object.values(this.gridMap[this.hash(p)] || {});
            if (newElements?.length) {
                elements = elements.concat(newElements);
                break;
            }
            t += this.gridSpace;
        }
        if (elements?.length) {
            let distance = Number.MAX_VALUE;
            for (let i = 0; i < elements.length; i++) {
                distance = Math.min(distance, elements[i].distanceToPoint(ray.init));
            }
            return distance;
        }
        return Number.MAX_VALUE;
    }

    estimateNormal(p) {
        let normal = Vec3();
        const elements = Object.values(this.gridMap[this.hash(p)] || {});
        for (let i = 0; i < elements.length; i++) {
            const elem = elements[i];
            normal = normal.add(elem.normalToPoint(p));
        }
        return normal.length() > 0 ? normal.normalize(): normal;
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

    rebuild() {
        return this;
    }
}