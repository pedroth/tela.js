import { Vec3, Vec2 } from "../Vector/Vector.js";
import Point from "./Point.js"
import Box from "../Box/Box.js";

const RADIUS = 0.001;
export default class Mesh {
    constructor({ vertices, normals, textureCoords, faces, colors }) {
        this.vertices = vertices || [];
        this.normals = normals || [];
        this.textureCoords = textureCoords || [];
        this.faces = faces || [];
        this.colors = colors || [];
    }

    mapVertices(lambda) {
        const newVertices = [];
        for (let i = 0; i < this.vertices.length; i++) {
            newVertices.push(lambda(this.vertices[i]));
        }
        return new Mesh({
            vertices: newVertices,
            normals: this.normals,
            textureCoords: this.textureCoords,
            faces: this.faces
        })
    }

    mapColors(lambda) {
        const newColors = [];
        for (let i = 0; i < this.vertices.length; i++) {
            newColors.push(lambda(this.vertices[i]));
        }
        return new Mesh({
            vertices: this.vertices,
            normals: this.normals,
            textureCoords: this.textureCoords,
            faces: this.faces,
            colors: newColors
        })
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        this.boundingBox = new Box();
        for (let i = 0; i < this.vertices.length; i++) {
            this.boundingBox = this.boundingBox.add(new Box(
                this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS)),
                this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS))
            ));
        }
        return this.boundingBox;
    }

    asPoints(name, radius = RADIUS) {
        const points = [];
        for (let i = 0; i < this.vertices.length; i++) {
            points.push(
                Point
                    .builder()
                    .radius(radius)
                    .name(`${name}_${i}`)
                    .color(this.colors[i])
                    .position(this.vertices[i])
                    .normal(this.normals[i] || Vec3(1, 0, 0))
                    .build()
            )
        }
        return points;
    }


    static readObj(objFile) {
        const vertices = [];
        const normals = [];
        const texture = [];
        const faces = [];
        objFile.split("\n")
            .forEach((lines) => {
                const spaces = lines.split(" ")
                const type = spaces[0];
                if (type === "v") {
                    const v = spaces.slice(1, 4)
                        .map(x => Number.parseFloat(x));
                    vertices.push(Vec3(...v));
                }
                if (type === "vn") {
                    const v = spaces.slice(1, 4)
                        .map(x => Number.parseFloat(x));
                    normals.push(Vec3(...v));
                }
                if (type === "vt") {
                    const v = spaces.slice(1, 3)
                        .map(x => Number.parseFloat(x));
                    texture.push(Vec2(...v));
                }
                if (type === "f") {
                    // TODO
                }
            })
        return new Mesh({ vertices, normals, texture, faces })
    }
}