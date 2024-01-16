import { none, some } from "../Monads/Monads";
import Vec, { Vec2, Vec3 } from "../Vector/Vector";


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
        if (this.isEmpty) return box;
        const { min, max } = this;
        return new Box(min.op(box.min, Math.min), max.op(box.max, Math.max));
    }

    union = this.add;

    sub(box) {
        if (this.isEmpty) return Box.EMPTY;
        const { min, max } = this;
        const newMin = min.op(box.min, Math.max);
        const newMax = max.op(box.max, Math.min);
        const newDiag = newMax.sub(newMin);
        const isAllPositive = newDiag.fold((e, x) => e && x >= 0, true);
        return !isAllPositive ? Box.EMPTY : new Box(newMin, newMax);
    }

    intersection = this.sub;

    interceptWith(ray) {
        const maxIte = 100;
        const epsilon = 1e-3;
        let p = ray.init;
        let t = this.distanceToPoint(p);
        let minT = t;
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = this.distanceToPoint(p);
            t += d;
            if (d < epsilon) {
                return some(p);
            }
            if (d > minT) {
                break;
            }
            minT = d;
        }
        return none();
    }

    scale(r) {
        return new Box(this.min.sub(this.center).scale(r), this.max.sub(this.center).scale(r)).move(this.center);
    }

    move(v) {
        return new Box(this.min.add(v), this.max.add(v));
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
        const q = p.map(Math.abs).sub(r);
        return q.map(x => Math.max(x, 0)).length() + Math.min(0, maxComp(q));
    }

    estimateNormal(pointVec) {
        const epsilon = 1e-3;
        const n = pointVec.dim;
        const grad = [];
        const d = this.distanceToPoint(pointVec);
        for (let i = 0; i < n; i++) {
            grad.push(this.distanceToPoint(pointVec.add(Vec.e(n)(i).scale(epsilon))) - d)
        }
        return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
    }

    collidesWith(box) {
        const vectorCollision = () => !this.sub(new Box(box, box)).isEmpty;
        const type2action = {
            [Box.name]: () => !this.sub(box).isEmpty,
            "Vector": vectorCollision,
            "Vector3": vectorCollision,
            "Vector2": vectorCollision,
        }
        if (box.constructor.name in type2action) {
            return type2action[box.constructor.name]();
        }
        return false;
    }

    toString() {
        return `{
        min:${this.min.toString()},
        max:${this.max.toString()}
    }`
    }

    static EMPTY = new Box();
}

function maxComp(u) {
    return u.fold((e, x) => Math.max(e, x), -Number.MAX_VALUE);
}