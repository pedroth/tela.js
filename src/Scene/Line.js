export default class Line {
    constructor(name, start, end, color) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.color = color;
    }

    static builder() {
        return new LineBuilder();
    }
}

class LineBuilder {
    constructor() {
        this._name;
        this._start;
        this._end;
        this._color;
    }

    name(name) {
        this._name = name;
        return this;
    }

    start(start) {
        this._start = start;
        return this;
    }

    end(end) {
        this._end = end;
        return this;
    }

    color(color) {
        this._color = color;
        return this;
    }

    build() {
        const attrs = [
            this._name,
            this._start,
            this._end,
            this._color
        ];
        if (attrs.some((x) => x === undefined)) {
            throw new Error("Line is incomplete");
        }
        return new Line(...attrs);
    }
}