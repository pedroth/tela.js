
import { none, some } from "../Monads/Monads.js";
import { argmin } from "../Utils/Utils.js";
import Vec from "../Vector/Vector.js";

export default class VoxelScene {
    constructor(gridSpace = 1) {
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.gridMap = new Map();
        this.gridSpace = gridSpace;
    }

    // Hash function from https://www.youtube.com/watch?v=D2M8jTtKi44
    hash(element) {
        const box = element.getBoundingBox();
        const integerCoord = box.center.map(z => Math.floor(z / this.gridSpace));
        const h = (integerCoord.x * 92837111) ^ (integerCoord.y * 689287499) ^ (integerCoord.z * 283923481);
        return h;
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
            const h = this.hash(elem);
            if (!this.gridMap.has(h)) {
                this.gridMap.set(h, []);
            }
            let cell = this.gridMap.get(h);
            cell.push(elem);
        }
        return this;
    }

    clear() {
        this.id2ElemMap = {};
        this.sceneElements = [];
        this.gridMap = new Map();
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
        // TODO
        const maxIte = 100;
        let t = 0;
        let elements = [];
        for (let n = 0; n < maxIte; n++) {
            let p = ray.trace(t);
            elements = this.gridMap.get(this.hash(p));
            if (elements.length) break;
            t += this.gridSpace;
        }
        if (elements.length) {
            let closestDistance = Number.MAX_VALUE;
            let closest = none();
            for (let i = 0; i < elements.length; i++) {
                elements[i].interceptWith(ray)
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
        return none();
    }

    distanceToPoint(p) {
        // TODO
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
        const { canvas } = props;
        return canvas;
    }

    rebuild() {
        return this;
    }
}

