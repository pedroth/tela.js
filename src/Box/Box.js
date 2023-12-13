import { none, some } from "../Monads/Monads";
import Vec from "../Vector/Vector";


export default class Box {
    constructor(min, max) {
        this.isEmpty = min === undefined || max === undefined;
        if (this.isEmpty) return this;
        this.min = min.op(max, Math.min);
        this.max = max.op(min, Math.max);
        this.center = min.add(max).scale(1 / 2);
        this.diagonal = max.sub(min);
    }

    add(box) {
        if (this === Box.EMPTY) return box;
        const { min, max } = this;
        return new Box(min.op(box.min, Math.min), max.op(box.max, Math.max));
    }

    union = this.add;

    sub(box) {
        if (this === Box.EMPTY) return Box.EMPTY;
        const { min, max } = this;
        const newMin = min.op(box.min, Math.max);
        const newMax = max.op(box.max, Math.min);
        const newDiag = newMax.sub(newMin);
        const isAllPositive = newDiag.data.every((x) => x >= 0);
        return !isAllPositive ? Box.EMPTY : new Box(newMin, newMax);
    }

    intersection = this.sub;

    interceptWith(ray) {
        const maxIte = 100;
        const epsilon = 1e-3;
        let p = ray.init;
        let t = this.distanceToPoint(p);
        const maxT = t;
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = this.distanceToPoint(p);
            t += d;
            if (d < epsilon) {
                return some(p);
            }
            if (d > maxT) {
                break;
            };
        }
        return none();
    }

    equals(box) {
        if (!(box instanceof Box)) return false;
        if (this == Box.EMPTY) return true;
        return this.min.equals(box.min) && this.max.equals(box.max);
    }

    distanceToBox(box) {
        // return this.center.sub(box.center).length;
        return this.min.sub(box.min).length() + this.max.sub(box.max).length();
    }

    distanceToPoint(pointVec) {
        const p = pointVec.sub(this.center);
        const r = this.max.sub(this.center);
        return p.map(Math.abs).sub(r).map(x => Math.max(x, 0)).length();
    }

    estimateNormal(pointVec) {
        const epsilon = 1e-3;
        const n = pointVec.dim;
        const grad = [];
        for (let i = 0; i < n; i++) {
            grad.push(this.distanceToPoint(pointVec.add(Vec.e(n)(i).scale(epsilon))) - this.distanceToPoint(pointVec))
        }
        return Vec.fromArray(grad).normalize();
    }

    static EMPTY = new Box();
}