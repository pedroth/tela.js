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

    getBoundingBox() {
        return this;
    }

    distanceToPoint(pointVec) {
        const p = pointVec.sub(this.center);
        const r = this.max.sub(this.center);
        const q = p.map(Math.abs).sub(r);
        return q.map(x => Math.max(x, 0)).length() + Math.min(0, maxComp(q));
    }

    normalToPoint(pointVec) {
        const epsilon = 1e-3;
        const n = pointVec.dim;
        const grad = [];
        const d = this.distanceToPoint(pointVec);
        for (let i = 0; i < n; i++) {
            grad.push(this.distanceToPoint(pointVec.add(Vec.e(n)(i).scale(epsilon))) - d)
        }
        return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
    }

    interceptWithRay(ray) {
        const epsilon = 1e-3;
        let tmin = -Number.MAX_VALUE;
        let tmax = Number.MAX_VALUE;
        if (this.isEmpty) return;
        const minArray = this.min.toArray();
        const maxArray = this.max.toArray();
        const rInit = ray.init.toArray();
        const dirInv = ray.dirInv.toArray();
        const dim = this.min?.dim;
        for (let i = 0; i < dim; ++i) {
            let t1 = (minArray[i] - rInit[i]) * dirInv[i];
            let t2 = (maxArray[i] - rInit[i]) * dirInv[i];

            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
        }
        return tmax >= Math.max(tmin, 0) ? [tmin - epsilon, ray.trace(tmin - epsilon), this] : undefined;
    }

    interceptWithLine(a, b) {
        const epsilon = 1e-3;
        let tmin = -Number.MAX_VALUE;
        let tmax = Number.MAX_VALUE;
        if (this.isEmpty) return;
        const minArray = this.min.toArray();
        const maxArray = this.max.toArray();
        const rInit = a.toArray();
        const dir = b.sub(a).normalize();
        const dirInv = dir.map(x => 1 / (x + epsilon)).toArray();
        const dim = this.min?.dim;
        for (let i = 0; i < dim; ++i) {
            let t1 = (minArray[i] - rInit[i]) * dirInv[i];
            let t2 = (maxArray[i] - rInit[i]) * dirInv[i];

            tmin = Math.max(tmin, Math.min(t1, t2));
            tmax = Math.min(tmax, Math.max(t1, t2));
        }
        if (Number.isNaN(tmin) || Number.isNaN(tmax)) return;
        if (Math.abs(tmin - tmax) < epsilon) return [a.add(dir.scale(tmin - epsilon))]
        return [a.add(dir.scale(tmin - epsilon)), a.add(dir.scale(tmax - epsilon))]
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

    scale(r) {
        return new Box(this.min.sub(this.center).scale(r), this.max.sub(this.center).scale(r)).move(this.center);
    }

    move(v) {
        return new Box(this.min.add(v), this.max.add(v));
    }

    equals(box) {
        if (!(box instanceof Box)) return false;
        if (this.isEmpty !== box.isEmpty) return false;
        return this.min.equals(box.min) && this.max.equals(box.max);
    }

    distanceToBox(box) {
        // return this.center.sub(box.center).length;
        return this.min.sub(box.min).length() + this.max.sub(box.max).length();
    }

    collidesWith(arg) {
        const vectorCollision = () => !this.sub(new Box(arg, arg)).isEmpty;
        const type2action = {
            [Box.name]: () => !this.sub(arg).isEmpty,
            "Vector": vectorCollision,
            "Vector3": vectorCollision,
            "Vector2": vectorCollision,
        }
        if (arg.constructor.name in type2action) {
            return type2action[arg.constructor.name]();
        }
        return false;
    }

    contains(box, precision = 1e-6) {
        const v = box.volume();
        return Math.abs(v - this.sub(box).volume()) < precision;
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

    volume() {
        if(this.isEmpty) return 0;
        return this.diagonal.fold((e, x) => e * x, 1);
    }

    serialize() {
        return {
            type: Box.name,
            min: this.min.toArray(),
            max: this.max.toArray()
        }
    }

    static async deserialize(json) {
        return new Box(Vec.fromArray(json.min), Vec.fromArray(json.max));
    }

    static EMPTY = new Box();
}

function maxComp(u) {
    return u.fold((e, x) => Math.max(e, x), -Number.MAX_VALUE);
}