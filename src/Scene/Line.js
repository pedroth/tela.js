import Color from "../Color/Color";
import { Vec2, Vec3 } from "../Vector/Vector";

export default class Line {
    constructor({name, positions, colors, texCoords, normals, texture}) {
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
        return new LineBuilder();
    }
}

class LineBuilder {
    constructor() {
        this._name;
        this._texture;
        this._normals = [1, 2].map(() => Vec3());
        this._colors = [1, 2].map(() => Color.BLACK);
        this._positions = [1, 2].map(() => Vec3());
        this._texCoords = [1, 2].map(() => Vec2());
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
        this._colors = [c1, c2];
        return this;
    }

    texCoords(t1, t2) {
        this._texCoords = [t1, t2];
        return this;
    }

    normals(n1, n2) {
        this._normals = [n1, n2];
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
            throw new Error("Line is incomplete");
        }
        return new Line({ ...attrs, texture: this._texture });
    }
}