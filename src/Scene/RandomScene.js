
import Ray from "../Ray/Ray.js"
import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import NaiveScene from "./NaiveScene.js";
import { drawBox } from "../Utils/Utils3D.js";
import Vec, { Vec3 } from "../Vector/Vector.js";
import { none, some } from "../Monads/Monads.js";

export default class RandomScene {
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
            const binary = [0, 1];
            const n = binary.length ** 3;
            const powers = [binary.length ** 2, binary.length];
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
        const samples = 10;
        const epsilon = 1e-1;
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
        return elements.length === 0 ? none() : some(elements[0].getBoundingBox().interceptWith(ray));
        // let pos = Vec3();
        // let normal = Vec3();
        // let count = 0;
        // for (let i = 0; i < samples; i++) {
        //     interceptWith(
        //         Ray(
        //             ray.init,
        //             ray.dir.add(Vec.RANDOM(3).scale(epsilon)).normalize()
        //         ),
        //         elements
        //     ).forEach(([p, n]) => {
        //         pos = pos.add(p);
        //         normal = normal.add(n);
        //         count++;
        //     })
        // }
        // return count === 0 ? none() : some([pos.scale(1 / count), normal.scale(1 / count)])
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


function interceptWith(ray, elements) {
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