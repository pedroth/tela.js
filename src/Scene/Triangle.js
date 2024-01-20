import Box from "../Box/Box";

export default class Triangle {
    constructor(name, positions, colors, texCoords, texture) {
        this.name = name;
        this.colors = colors;
        this.positions = positions;
        this.texCoords = texCoords;
        this.texture = texture;
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

class TriangleBuilder {
    constructor() {
        this._name;
        this._positions;
        this._colors;
        this._texCoords = [];
        this._texture;
    }

    name(name) {
        this._name = name;
        return this;
    }

    positions(v1, v2, v3) {
        this._positions = [v1, v2, v3];
        return this;
    }

    colors(c1, c2, c3) {
        this._colors = [c1, c2, c3];
        return this;
    }

    texCoords(t1, t2, t3) {
        this._texCoords = [t1, t2, t3];
        return this;
    }

    texture(image) {
        this._texture = image
        return this;
    }

    build() {
        const attrs = [
            this._name,
            this._positions,
            this._colors,
            this._texCoords,
        ];
        if (attrs.some((x) => x === undefined)) {
            throw new Error("Triangle is incomplete");
        }
        return new Triangle(...attrs, this._texture);
    }
}