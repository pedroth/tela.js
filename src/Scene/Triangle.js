import Box from "../Box/Box";
import Color from "../Color/Color";
import { Vec2, Vec3 } from "../Vector/Vector";

export default class Triangle {
    constructor({ name, positions, colors, texCoords, normals, texture }) {
        this.name = name;
        this.colors = colors;
        this.normals = normals;
        this.texture = texture;
        this.positions = positions;
        this.texCoords = texCoords;
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x, x)), Box.EMPTY);
        return this.boundingBox;
    }

    static builder() {
        return new TriangleBuilder();
    }
}

const indx = [1, 2, 3];
class TriangleBuilder {
    constructor() {
        this._name;
        this._texture;
        this._normals = indx.map(() => Vec3());
        this._colors = indx.map(() => Color.BLACK);
        this._positions = indx.map(() => Vec3());
        this._texCoords = indx.map(() => Vec2());
    }

    name(name) {
        this._name = name;
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

    build() {
        const attrs = {
            name: this._name,
            colors: this._colors,
            normals: this._normals,
            positions: this._positions,
            texCoords: this._texCoords,
        };
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Triangle is incomplete");
        }
        return new Triangle({ ...attrs, texture: this._texture });
    }
}