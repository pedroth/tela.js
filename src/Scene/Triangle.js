export default class Triangle {
    constructor(name, positions, colors) {
        this.name = name;
        this.positions = positions;
        this.colors = colors;
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

    build() {
        const attrs = [
            this._name,
            this._positions,
            this._colors,
        ];
        if (attrs.some((x) => x === undefined)) {
            throw new Error("Triangle is incomplete");
        }
        return new Triangle(...attrs);
    }
}