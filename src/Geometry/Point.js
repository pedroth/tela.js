import Box from "../Geometry/Box.js";
import Color from "../Color/Color.js";
import { Diffuse } from "../Material/Material.js";
import { randomPointInSphere } from "../Utils/Math.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";

class Point {
    constructor({ name, position, color, texCoord, normal, radius, texture, emissive, material }) {
        this.name = name;
        this.color = color;
        this.radius = radius;
        this.normals = normal;
        this.texture = texture;
        this.position = position;
        this.texCoord = texCoord;
        this.emissive = emissive;
        this.material = material;
    }

    distanceToPoint(p) {
        return this.position.sub(p).length() - this.radius;
    }

    normalToPoint(p) {
        const r = p.sub(this.position);
        const length = r.length();
        return length > this.radius ? r.normalize() : r.scale(-1).normalize();
    }

    interceptWith(ray) {
        const epsilon = 1e-9;
        const t = sphereInterception(this, ray);
        return !t ? undefined : [t, ray.trace(t - epsilon), this];
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

    sample() {
        return randomPointInSphere(this.position.dim).scale(this.radius).add(this.position);
    }

    isInside(p) {
        return p.sub(this.position).length() < this.radius;
    }

    static builder() {
        return new PointBuilder();
    }
}

class PointBuilder {
    constructor() {
        this._name;
        this._texture;
        this._radius = 1;
        this._normal = Vec3();
        this._color = Color.BLACK;
        this._position = Vec3();
        this._texCoord = Vec2();
        this._emissive = false;
        this._material = Diffuse();
    }

    name(name) {
        this._name = name;
        return this;
    }

    color(color) {
        if (!color) return this;
        this._color = color;
        return this;
    }

    normal(normal) {
        if (!normal) return this;
        this._normal = normal;
        return this;
    }

    radius(radius) {
        if (!radius) return this;
        this._radius = radius;
        return this;
    }

    position(posVec3) {
        if (!posVec3) return this;
        this._position = posVec3;
        return this;
    }

    texCoord(t) {
        if (!t) return this;
        this._texCoord = t;
        return this;
    }

    texture(image) {
        this._texture = image
        return this;
    }

    emissive(isEmissive) {
        this._emissive = isEmissive;
        return this;
    }

    material(material) {
        this._material = material;
        return this;
    }

    build() {
        const attrs = {
            name: this._name,
            color: this._color,
            normal: this._normal,
            radius: this._radius,
            position: this._position,
            texCoord: this._texCoord,
            emissive: this._emissive,
            material: this._material
        }
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Point is incomplete");
        }
        return new Point({ ...attrs, texture: this._texture });
    }
}

function sphereInterception(point, ray) {
    const { init, dir } = ray;
    const diff = init.sub(point.position);
    const b = 2 * dir.dot(diff);
    const c = diff.squareLength() - point.radius * point.radius;
    const discriminant = b * b - 4 * c; // a = 1
    if (discriminant < 0) return;
    const sqrt = Math.sqrt(discriminant);
    const [t1, t2] = [(-b - sqrt) / 2, (-b + sqrt) / 2];
    const t = Math.min(t1, t2);
    const tM = Math.max(t1, t2);
    if (t1 * t2 < 0) return tM;
    return t1 >= 0 && t2 >= 0 ? t : undefined;
}

export default Point;