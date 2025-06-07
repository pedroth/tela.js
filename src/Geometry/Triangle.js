import Box from "../Geometry/Box.js";
import Color from "../Color/Color.js";
import { Diffuse, MATERIALS } from "../Material/Material.js";
import Vec, { Vec2, Vec3 } from "../Vector/Vector.js";
import { deserialize as deserializeImage } from "../Tela/utils.js";
import { generateUniqueID } from "../Utils/Utils.js";

export default class Triangle {
    constructor({ name, positions, colors, texCoords, normals, texture, emissive, material, radius }) {
        this.name = name;
        this.colors = colors;
        this.normals = normals;
        this.texture = texture;
        this.positions = positions;
        this.texCoords = texCoords;
        this.emissive = emissive;
        this.material = material;
        this.radius = radius;
        this.edges = [];
        const n = this.positions.length;
        for (let i = 0; i < n; i++) {
            this.edges.push(this.positions[(i + 1) % n].sub(this.positions[i]));
        }
        this.tangents = [this.edges[0], this.edges.at(-1).scale(-1)];
        const u = this.tangents[0];
        const v = this.tangents[1];
        const cross = u.cross(v);
        this.faceNormal = Number.isFinite(cross) ? Vec3(0, 0, cross) : cross?.normalize();

        // precompute inverse of matrix [u, v]^T [u, v]
        const a = u.dot(u);
        const b = u.dot(v);
        const c = b;
        const d = v.dot(v);
        const detInv = 1 / (a * d - b * c);
        this.isDegenerate = !Number.isFinite(detInv) || Number.isNaN(detInv)
        this.invU1 = Vec2(d, -b).scale(detInv)
        this.invU2 = Vec2(-c, a).scale(detInv);
    }

    getBarycentricCoords(p) {
        const r = p.sub(this.positions[0]);
        const x = Vec2(this.tangents[0].dot(r), this.tangents[1].dot(r));
        let alpha = Vec2(this.invU1.dot(x), this.invU2.dot(x));
        const sum = alpha.fold((e, x) => e + x, 0)
        return Vec3(alpha.x, alpha.y, 1 - sum);
    }

    getBoundingBox() {
        const n = this.positions[0].dim;
        if (this.boundingBox) return this.boundingBox;
        const r = Vec.ONES(n).scale(this.radius)
        this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x.sub(r), x.add(r))), Box.EMPTY);
        return this.boundingBox;
    }

    distanceToPoint(p) {
        let alpha = this.getBarycentricCoords(p).map(x => Math.max(0, x));
        const sum = alpha.fold((e, x) => e + x, 0);

        // if (sum === 1) {
        //     const r0 = p.sub(this.positions[0]);
        //     const r1 = p.sub(this.positions[1]);
        //     const r2 = p.sub(this.positions[2]);
        //     return -Math.min(
        //         r0.sub(this.edges[0].scale(this.edges[0].dot(r0) / this.edges[0].dot(this.edges[0]))).length(),
        //         r1.sub(this.edges[1].scale(this.edges[1].dot(r1) / this.edges[1].dot(this.edges[1]))).length(),
        //         r2.sub(this.edges[2].scale(this.edges[2].dot(r2) / this.edges[2].dot(this.edges[2]))).length()
        //     )
        // }

        alpha = alpha.scale(1 / sum);
        const pointOnTriangle = this.positions[0]
            .add(
                this.tangents[0].scale(alpha.x)
                    .add(this.tangents[1].scale(alpha.y))
            );
        return p.sub(pointOnTriangle).length() - this.radius;
    }

    normalToPoint(p) {
        if (this.radius === 0) {
            const r = p.sub(this.positions[0]);
            const dot = this.faceNormal.dot(r);
            return dot < 1e-3 ? this.faceNormal : this.faceNormal.scale(-1);
        }
        const epsilon = 1e-6;
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
        if(this.radius === 0) {
            const epsilon = 1e-9
            const v = ray.dir;
            const p = ray.init.sub(this.positions[0]);
            const n = this.faceNormal;
            const t = - n.dot(p) / n.dot(v);
            if (t <= epsilon) return;
            const x = ray.trace(t);
            for (let i = 0; i < this.positions.length; i++) {
                const xi = this.positions[i];
                const u = x.sub(xi);
                const ni = n.cross(this.edges[i]);
                const dot = ni.dot(u);
                if (dot <= epsilon) return;
            }
            return [t - epsilon, x, this];
        }
        const maxIte = 20;
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
        return this.tangents[0].scale(Math.random()).add(this.tangents[1].scale(Math.random())).add(this.positions[0]);
    }

    isInside(p) {
        return this.faceNormal.dot(p.sub(this.positions[0])) >= 0;
    }

    serialize() {
        return {
            type: Triangle.name,
            name: this.name,
            emissive: this.emissive,
            colors: this.colors.map(x => x.toArray()),
            texCoords: this.texCoords.map(x => x.toArray()),
            positions: this.positions.map(x => x.toArray()),
            texture: this.texture ? this.texture.serialize() : undefined,
            material: { type: this.material.type, args: this.material.args }
        }
    }

    static async deserialize(json, artifacts) {
        const { type, args } = json.material;
        const texture = json.texture ? await deserializeImage(json.texture, artifacts) : undefined;
        return Triangle
            .builder()
            .name(json.name)
            .emissive(json.emissive)
            .material(MATERIALS[type](...args))
            .colors(...json.colors.map(x => new Color(x)))
            .positions(...json.positions.map(x => Vec.fromArray(x)))
            .texCoords(...json.texCoords.map(x => Vec.fromArray(x)))
            .texture(texture)
            .build()
    }

    static builder() {
        return new TriangleBuilder();
    }
}

const indx = [1, 2, 3];
class TriangleBuilder {
    constructor() {
        this._name = generateUniqueID(10);
        this._texture;
        this._normals = indx.map(() => Vec3());
        this._colors = indx.map(() => Color.BLACK);
        this._positions = indx.map(() => Vec3());
        this._texCoords = [Vec2(), Vec2(1, 0), Vec2(0, 1)];
        this._radius = 0.0;
        this._emissive = false;
        this._material = Diffuse();
    }

    name(name) {
        this._name = name;
        return this;
    }

    radius(radius) {
        this._radius = radius;
        return this;
    }

    positions(v1, v2, v3) {
        if ([v1, v2, v3].some(x => !x)) return this;
        this._positions = [v1, v2, v3];
        return this;
    }

    colors(c1, c2, c3) {
        if ([c1, c2, c3].some(x => !x)) return this;
        this._colors = [c1, c2, c3];
        return this;
    }

    texCoords(t1, t2, t3) {
        if ([t1, t2, t3].some(x => !x)) return this;
        this._texCoords = [t1, t2, t3];
        return this;
    }

    normals(n1, n2, n3) {
        if ([n1, n2, n3].some(x => !x)) return this;
        this._normals = [n1, n2, n3];
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
            radius: this._radius,
            colors: this._colors,
            normals: this._normals,
            positions: this._positions,
            texCoords: this._texCoords,
            emissive: this._emissive,
            material: this._material
        };
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Triangle is incomplete");
        }
        return new Triangle({ ...attrs, texture: this._texture });
    }
}