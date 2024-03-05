import Box from "../Box/Box.js";
import Line from "./Line.js";

export default class Path {
    constructor({ name, positions, colors }) {
        this.name = name;
        this.colors = colors;
        this.positions = positions;
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x, x)), Box.EMPTY);
        return this.boundingBox;
    }

    asLines() {
        const lines = [];
        for (let i = 0; i < this.positions.length - 1; i++) {
            lines.push(
                Line.builder()
                    .name(`${this.name}_${i}_${i + 1}`)
                    .positions(this.positions[i], this.positions[i + 1])
                    .colors(this.colors[i], this.colors[i + 1])
                    .build()
            )
        }
        return lines;
    }

    static builder() {
        return new PathBuilder();
    }
}

class PathBuilder {
    constructor() {
        this._name;
        this._colors;
        this._positions;
    }

    name(name) {
        this._name = name;
        return this;
    }

    positions(positions = []) {
        this._positions = positions;
        return this;
    }

    colors(colors = []) {
        this._colors = colors;
        return this;
    }


    build() {
        const attrs = {
            name: this._name,
            colors: this._colors,
            positions: this._positions,
        };
        if (Object.values(attrs).some((x) => x === undefined)) {
            throw new Error("Line is incomplete");
        }
        return new Path({ ...attrs });
    }
}