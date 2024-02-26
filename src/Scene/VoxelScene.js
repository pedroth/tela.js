
import { none, some } from "../Monads/Monads.js";
import Vec, { Vec3 } from "../Vector/Vector.js";
import Line from "./Line.js";

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
        for (let i = 0; i < elements.length; i++) {
            const elem = elements[i];
            const { name } = elem;
            this.id2ElemMap[name] = elem;
            this.sceneElements.push(elem);
            const h = this.hash(elem.getBoundingBox().center);
            if (!(h in this.gridMap)) {
                this.gridMap[h] = [];
            }
            let cell = this.gridMap[h];
            cell.push(elem);
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
            const newElements = this.gridMap[this.hash(p)];
            if (newElements?.length) {
                elements = elements.concat(newElements);
            }
            t += this.gridSpace;
        }
        if (elements?.length) {
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
        const { camera, canvas } = props;
        
        
        return canvas;
    }

    rebuild() {
        return this;
    }
}
