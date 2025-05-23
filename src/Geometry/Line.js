import Box from "./Box.js";
import Color from "../Color/Color.js";
import { Diffuse, MATERIALS } from "../Material/Material.js";
import { clamp } from "../Utils/Math.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import { generateUniqueID } from "../Utils/Utils.js";

const clamp01 = clamp();

export default class Line {
    constructor({ name, positions, colors, texCoords, normals, texture, radius, emissive, material }) {
        this.name = name;
        this.radius = radius;
        this.colors = colors;
        this.normals = normals;
        this.texture = texture;
        this.emissive = emissive;
        this.material = material;
        this.positions = positions;
        this.texCoords = texCoords;
        this.edge = this.positions[1].sub(this.positions[0]);
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        const size = Vec3(this.radius, this.radius, this.radius);
        this.boundingBox = this.positions.reduce(
            (box, x) => box.add(new Box(x.sub(size), x.add(size))),
            Box.EMPTY
        );
        return this.boundingBox;
    }

    distanceToPoint(p) {
        const l = this.edge;
        const v = p.sub(this.positions[0]);
        const sqLength = l.dot(l);
        if(sqLength < 1e-6) return Number.MAX_VALUE
        const h = clamp01(l.dot(v) / sqLength);
        return p.sub(this.positions[0].add(l.scale(h))).length() - this.radius;
    }

    normalToPoint(p) {
        const epsilon = 1e-3;
        const f = this.distanceToPoint(p);
        const sign = Math.sign(f);
        const grad = Vec3(
            this.distanceToPoint(p.add(Vec3(epsilon, 0, 0))) - f,
            this.distanceToPoint(p.add(Vec3(0, epsilon, 0))) - f,
            this.distanceToPoint(p.add(Vec3(0, 0, epsilon))) - f,
        ).normalize();
        return grad.scale(sign);
    }

    interceptWithRay(ray) {
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
                return [t, p, this];
            }
            if (d > minT) {
                break;
            }
            minT = d;
        }
        return;
    }

    sample() {
        return this.edge.scale(Math.random());
    }

    isInside(p) {
        return this.distanceToPoint(p) < 0;
    }

    serialize() {
        return {
            type: Line.name,
            name: this.name,
            radius: this.radius,
            emissive: this.emissive,
            colors: this.colors.map(x => x.toArray()),
            texCoords: this.texCoords.map(x => x.toArray()),
            positions: this.positions.map(x => x.toArray()),
            texture: this.texture ? this.texture.serialize() : undefined,
            material: { type: this.material.type, args: this.material.args }
        }
    }

    static deserialize(json) {
        const { type, args } = json.material;
        return Line
            .builder()
            .name(json.name)
            .radius(json.radius)
            .positions(...json.positions.map(x => Vec.fromArray(x)))
            .colors(...json.colors.map(x => new Color(x)))
            .emissive(json.emissive)
            .material(MATERIALS[type](...args))
            .build()
    }

    static builder() {
        return new LineBuilder();
    }
}

const indx = [1, 2];
class LineBuilder {
    constructor() {
        this._name = generateUniqueID(10);
        this._texture;
        this._radius = 1;
        this._normals = indx.map(() => Vec3());
        this._colors = indx.map(() => Color.BLACK);
        this._positions = indx.map(() => Vec3());
        this._texCoords = indx.map(() => Vec2());
        this._emissive = false;
        this._material = Diffuse();
    }

    name(name) {
        this._name = name;
        return this;
    }

    positions(v1, v2) {
        if ([v1, v2].some(x => !x)) return this;
        this._positions = [v1, v2];
        return this;
    }

    colors(c1, c2) {
        if ([c1, c2].some(x => !x)) return this;
        this._colors = [c1, c2];
        return this;
    }

    texCoords(t1, t2) {
        if ([t1, t2].some(x => !x)) return this;
        this._texCoords = [t1, t2];
        return this;
    }

    normals(n1, n2) {
        if ([n1, n2].some(x => !x)) return this;
        this._normals = [n1, n2];
        return this;
    }

    texture(image) {
        this._texture = image
        return this;
    }

    radius(radius) {
        this._radius = radius;
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
            radius: this._radius,
            colors: this._colors,
            normals: this._normals,
            positions: this._positions,
            texCoords: this._texCoords,
            emissive: this._emissive,
            material: this._material
        };
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Line is incomplete");
        }
        return new Line({ ...attrs, texture: this._texture });
    }
}