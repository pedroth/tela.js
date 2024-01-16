import { Vec3, Vec2 } from "../Vector/Vector.js";
import Point from "./Point.js"
import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import Line from "./Line.js";

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

    asLines(name) {
        const lines = {};
        for (let i = 0; i < this.faces.length; i++) {
            const indices = this.faces[i];
            for (let j = 0; j < indices.length; j++) {
                const vi = indices[j] - 1;
                const vj = indices[(j + 1) % indices.length] - 1;
                const edge_id = [vi, vj].sort().join("_");
                const edge_name = `${name}_${vi}_${vj}`;
                lines[edge_id] =
                    Line
                        .builder()
                        .name(edge_name)
                        .start(this.vertices[vi])
                        .end(this.vertices[vj])
                        .color(Color.GREEN)
                        .build()
            }
        }
        return Object.values(lines);
    }


    static readObj(objFile) {
        const vertices = [];
        const normals = [];
        const texture = [];
        const faces = [];
        objFile.split("\n")
            .forEach((line) => {
                const spaces = line.split(" ");
                const type = spaces[0];
                if (!type) return;
                if (type === "v") {
                    // 3 numbers
                    const v = spaces.slice(1, 4)
                        .map(x => Number.parseFloat(x));
                    vertices.push(Vec3(...v));
                }
                if (type === "vn") {
                    // 3 numbers
                    const v = spaces.slice(1, 4)
                        .map(x => Number.parseFloat(x));
                    normals.push(Vec3(...v));
                }
                if (type === "vt") {
                    // 2 numbers
                    const v = spaces.slice(1, 3)
                        .map(x => Number.parseFloat(x));
                    texture.push(Vec2(...v));
                }
                if (type === "f") {
                    // vertex_index/texture_index/normal_index
                    const v = spaces.slice(1, 4)
                        .map(x => Number.parseFloat(x.split("/")[0]));
                    faces.push(v);
                }
            })
        return new Mesh({ vertices, normals, texture, faces })
    }
}