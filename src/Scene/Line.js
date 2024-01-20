export default class Line {
    constructor(name, positions, colors) {
        this.name = name;
        this.positions = positions;
        this.colors = colors;
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
        this._positions;
        this._colors;
    }

    name(name) {
        this._name = name;
        return this;
    }

    positions(start, end) {
        this._positions = [start, end];
        return this;
    }

    colors(start, end) {
        this._colors = [start, end];
        return this;
    }

    build() {
        const attrs = [
            this._name,
            this._positions,
            this._colors
        ];
        if (attrs.some((x) => x === undefined)) {
            throw new Error("Line is incomplete");
        }
        return new Line(...attrs);
    }
}