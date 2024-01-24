import { Vec3, Vec2 } from "../Vector/Vector.js";
import Point from "./Point.js"
import Box from "../Box/Box.js";
import Color from "../Color/Color.js";
import Line from "./Line.js";
import Triangle from "./Triangle.js";
import { groupBy } from "../Utils/Utils.js";

const RADIUS = 0.001;
export default class Mesh {
    constructor({ vertices, normals, textureCoords, faces, colors, texture }) {
        this.vertices = vertices || [];
        this.normals = normals || [];
        this.textureCoords = textureCoords || [];
        this.faces = faces || [];
        this.colors = colors || [];
        this.texture = texture;
    }

    /**
     * Image|Canvas => Mesh
     */
    addTexture(image) {
        this.texture = image;
        return this;
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
            faces: this.faces,
            texture: this.texture,
            colors: this.colors
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
            colors: newColors,
            texture: this.texture
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
        const points = {};
        for (let i = 0; i < this.faces.length; i++) {
            const texCoordIndexes = this
                .faces[i]
                .textures
            const normalIndexes = this
                .faces[i]
                .normals
            const verticesIndexes = this
                .faces[i]
                .vertices
            for (let j = 0; j < 3; j++) {
                const pointName = `${name}_${verticesIndexes[j]}`
                if (!(pointName in points)) {
                    points[pointName] = Point
                        .builder()
                        .name(pointName)
                        .radius(radius)
                        .texture(this.texture)
                        .color(this.colors[verticesIndexes[j]])
                        .normal(this.normals[normalIndexes[j]])
                        .position(this.vertices[verticesIndexes[j]])
                        .texCoord(this.textureCoords[texCoordIndexes[j]])
                        .build();
                }
            }
        }
        return Object.values(points);
    }

    asLines(name) {
        const lines = {};
        for (let i = 0; i < this.faces.length; i++) {
            const indices = this.faces[i].vertices;
            for (let j = 0; j < indices.length; j++) {
                const vi = indices[j];
                const vj = indices[(j + 1) % indices.length];
                const edge_id = [vi, vj].sort().join("_");
                const edge_name = `${name}_${edge_id}`;
                lines[edge_id] =
                    Line
                        .builder()
                        .name(edge_name)
                        .positions(this.vertices[vi], this.vertices[vj])
                        .colors(this.colors[vi], this.colors[vj])
                        .build()
            }
        }
        return Object.values(lines);
    }

    asTriangles(name) {
        const triangles = [];
        for (let i = 0; i < this.faces.length; i++) {
            let texCoordIndexes = this
                .faces[i]
                .textures
            const normalIndexes = this
                .faces[i]
                .normals
            const verticesIndexes = this
                .faces[i]
                .vertices
            const edge_id = verticesIndexes
                .join("_");
            const edge_name = `${name}_${edge_id}`;
            triangles.push(
                Triangle
                    .builder()
                    .name(edge_name)
                    .texture(this.texture)
                    .normals(...normalIndexes.map(j => this.normals[j]))
                    .positions(...verticesIndexes.map(j => this.vertices[j]))
                    .colors(...verticesIndexes.map(j => this.colors[j]))
                    .texCoords(...(!texCoordIndexes.length ? [] : texCoordIndexes.map(j => this.textureCoords[j])))
                    .build()
            )

        }
        return Object.values(triangles);
    }

    static readObj(objFile) {
        const vertices = [];
        const normals = [];
        const textureCoords = [];
        const faces = [];
        const lines = objFile.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const spaces = line.split(" ");
            const type = spaces[0];
            if (!type) continue;
            if (type === "v") {
                // 3 numbers
                const v = spaces.slice(1, 4)
                    .map(x => Number.parseFloat(x));
                vertices.push(Vec3(...v));
                continue;
            }
            if (type === "vn") {
                // 3 numbers
                const v = spaces.slice(1, 4)
                    .map(x => Number.parseFloat(x));
                normals.push(Vec3(...v));
                continue;
            }
            if (type === "vt") {
                // 2 numbers
                const v = spaces
                    .slice(1, 3)
                    .map(x => Number.parseFloat(x));
                textureCoords.push(Vec2(...v));
                continue;
            }
            if (type === "f") {
                const facesInfo = spaces
                    .slice(1, 4)
                    .flatMap(x => x.split("/"))
                    .map(x => Number.parseFloat(x));
                const length = facesInfo.length;
                const lengthDiv3 = length / 3;
                // vertex_index/texture_index/normal_index
                const group = groupBy(facesInfo, (_, i) => i % (Math.floor(lengthDiv3)));
                const face = { vertices: [], textures: [], normals: [] }
                Object.keys(group).map(k => {
                    k = Number.parseInt(k);
                    const indices = group[k].map(x => x - 1);
                    if (k === 0) face.vertices = indices;
                    if (k === 1) face.textures = indices;
                    if (k === 2) face.normals = indices;
                });
                faces.push(face);
                continue;
            }
        }
        // const newFaces = faces.map((f, i) => i % 2 === 0 ? f : { ...f, textures: [f.textures[0], f.textures[2], f.textures[1]] })
        return new Mesh({ vertices, normals, textureCoords, faces })
    }
}