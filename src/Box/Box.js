import Vec from "../Vector/Vector.js";


export default class Box {
    constructor(min, max) {
        this.isEmpty = min === undefined || max === undefined;
        if (this.isEmpty) return this;
        this.min = min.op(max, Math.min);
        this.max = max.op(min, Math.max);
        this.center = min.add(max).scale(1 / 2);
        this.diagonal = max.sub(min);
        this.dim = min.dim;
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
        const epsilon = 1e-3;
        let tmin = -Number.MAX_VALUE;
        let tmax = Number.MAX_VALUE;
        const min = this.min.toArray();
        const max = this.max.toArray();
        const rInit = ray.init.toArray();
        const dirInv = ray.dirInv.toArray();
        const dim = this.min?.dim;
        for (let i = 0; i < dim; ++i) {
            let t1 = (min[i] - rInit[i]) * dirInv[i];
            let t2 = (max[i] - rInit[i]) * dirInv[i];

            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
        }
        return tmax > Math.max(tmin, 0) ? [tmin - epsilon, ray.trace(tmin - epsilon), this] : undefined;
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

    sample() {
        return this.min.add(Vec.RANDOM(this.dim).mul(this.diagonal));
    }

    static EMPTY = new Box();
}

function maxComp(u) {
    return u.fold((e, x) => Math.max(e, x), -Number.MAX_VALUE);
}