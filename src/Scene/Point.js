import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import { none, some } from "../Monads/Monads.js";
import Vec, { Vec3 } from "../Vector/Vector.js";

class Point {
    constructor({ name, position, normal, color, radius }) {
        this.name = name;
        this.color = color;
        this.normal = normal;
        this.radius = radius;
        this.position = position;
    }

    interceptWith(ray) {
        return sphereInterception(this, ray)
            .map(t => {
                const pointOnSphere = ray.trace(t);
                const normal = pointOnSphere.sub(this.position).normalize();
                return [pointOnSphere, normal];
            })
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        const n = this.position.dim;
        this.boundingBox = new Box(
            this.position.add(Vec.ONES(n).scale(-this.radius)),
            this.position.add(Vec.ONES(n).scale(this.radius))
        );
        return this.boundingBox;
    }

    static builder() {
        return new PointBuilder();
    }
}



class PointBuilder {
    constructor() {
        this._name;
        this._color = Color.WHITE;
        this._radius = 1;
        this._normal = Vec3(1, 0, 0);
        this._position = Vec3(0, 0, 0);
    }

    name(name) {
        this._name = name;
        return this;
    }

    color(r = 0, g = 0, b = 0) {
        this._color = Color.ofRGB(r, g, b);
        return this;
    }


    radius(radius) {
        this._radius = radius;
        return this;
    }

    normal(normal) {
        this._normal = normal;
        return this;
    }

    position(posVec3) {
        this._position = posVec3;
        return this;
    }

    build() {
        const attrs = {
            name: this._name,
            color: this._color,
            radius: this._radius,
            normal: this._normal,
            position: this._position,
        }
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Point is incomplete");
        }
        return new Point(attrs);
    }
}

function sphereInterception(point, ray) {
    const { init, dir } = ray;
    const diff = init.sub(point.position);
    const b = 2 * dir.dot(diff);
    const c = diff.squareLength() - point.radius * point.radius;
    const discriminant = b * b - 4 * c; // a = 1
    if (discriminant < 0) return none();
    const sqrt = Math.sqrt(discriminant);
    const [t1, t2] = [(-b - sqrt) / 2, (-b + sqrt) / 2];
    const t = Math.min(t1, t2);
    if (t1 * t2 < 0) return some(t);
    return t1 >= 0 && t2 >= 0 ? some(t) : none();
}

export default Point;