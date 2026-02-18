import { Vec3, Vec2 } from "../Vector/Vector.js";
import Sphere from "./Sphere.js"
import Line from "./Line.js";
import Triangle from "./Triangle.js";
import { groupBy } from "../Utils/Utils.js";
import { Diffuse } from "../Material/Material.js";
import KScene from "../Scene/KScene.js"
import { UNIT_BOX_LINES, UNIT_BOX_VERTEX } from "../Utils/Utils3D.js";
//========================================================================================
/*                                                                                      *
 *                                       CONSTANTS                                      *
 *                                                                                      */
//========================================================================================
let MESH_COUNTER = 0;
const RADIUS = 0.001;

//========================================================================================
/*                                                                                      *
 *                                      MAIN CLASS                                      *
 *                                                                                      */
//========================================================================================

export default class Mesh {
    constructor({ name, vertices, normals, textureCoords, faces, colors, texture, materials }) {
        this.vertices = vertices || [];
        this.normals = normals || [];
        this.textureCoords = textureCoords || [];
        this.faces = faces || [];
        this.colors = colors || [];
        this.texture = texture;
        this.name = name || `Mesh_${MESH_COUNTER++}`;
        this.materials = materials;
    }

    _init() {
        if (this._meshScene) return this;
        this._meshScene = new KScene();
        this._meshScene.addList(this.asTriangles());
        this._meshScene.rebuild();
        return this;
    }

    get meshScene() {
        this._init();
        return this._meshScene;
    }

    getBoundingBox() {
        if (this.boundingBox) return this.boundingBox;
        this.boundingBox = this.meshScene.boundingBoxScene.box;
        return this.boundingBox;
    }

    distanceToPoint(x) {
        return this.meshScene.distanceToPoint(x);
    }

    normalToPoint(x) {
        throw Error("No implementation");
    }

    interceptWithRay(ray) {
        return this.meshScene.interceptWithRay(ray);
    }

    distanceOnRay(ray) {
        return this.meshScene.distanceOnRay(ray);
    }

    setName(name) {
        this.name = name;
        return this;
    }

    /**
     * Image|Canvas => Mesh
     */
    addTexture(image) {
        this.texture = image;
        this.meshScene.getElements().forEach(e => e.texture = this.texture);
        return this;
    }

    mapVertices(lambda) {
        const newVertices = [];
        for (let i = 0; i < this.vertices.length; i++) {
            newVertices.push(lambda(this.vertices[i]));
        }
        return new Mesh({
            name: this.name,
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
            name: this.name,
            vertices: this.vertices,
            normals: this.normals,
            textureCoords: this.textureCoords,
            faces: this.faces,
            colors: newColors,
            texture: this.texture,
        })
    }

    mapMaterials(lambda) {
        const newMaterials = [];
        for (let i = 0; i < this.faces.length; i++) {
            newMaterials.push(lambda(this.faces[i]));
        }
        return new Mesh({
            name: this.name,
            vertices: this.vertices,
            normals: this.normals,
            textureCoords: this.textureCoords,
            faces: this.faces,
            colors: this.colors,
            texture: this.texture,
            materials: newMaterials
        })
    }

    asSpheres(radius = RADIUS) {
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
                const pointName = `${this.name}_${verticesIndexes[j]}`
                if (!(pointName in points)) {
                    points[pointName] = Sphere
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

    asLines(radius = RADIUS) {
        const lines = {};
        for (let i = 0; i < this.faces.length; i++) {
            const indices = this.faces[i].vertices;
            for (let j = 0; j < indices.length; j++) {
                const vi = indices[j];
                const vj = indices[(j + 1) % indices.length];
                const edge_id = [vi, vj].sort().join("_");
                const edge_name = `${this.name}_${edge_id}`;
                lines[edge_id] =
                    Line
                        .builder()
                        .name(edge_name)
                        .radius(radius)
                        .positions(this.vertices[vi], this.vertices[vj])
                        .colors(this.colors[vi], this.colors[vj])
                        .build()
            }
        }
        return Object.values(lines);
    }

    asTriangles() {
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
            const material = this.materials?.[i] ?? Diffuse();
            const edge_id = verticesIndexes
                .join("_");
            const edge_name = `${this.name}_${edge_id}`;
            triangles.push(
                Triangle
                    .builder()
                    .name(edge_name)
                    .texture(this.texture)
                    .colors(...verticesIndexes.map(j => this.colors[j]))
                    .normals(...normalIndexes.map(j => this.normals[j]))
                    .positions(...verticesIndexes.map(j => this.vertices[j]))
                    .texCoords(...texCoordIndexes.map(j => this.textureCoords[j]))
                    .material(material)
                    .build()
            )

        }
        return triangles;
    }

    serialize() {
        // TODO
    }

    deserialize(jsonMesh) {
        // TODO        
    }

    static readObj(objFile, name = `Mesh_${MESH_COUNTER++}`) {
        const vertices = [];
        const normals = [];
        const textureCoords = [];
        const faces = [];
        const lines = objFile.split(/\n|\r/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const spaces = line.split(" ")
                .filter(x => x !== "");
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
                triangulate(spaces.slice(1))
                    ?.forEach(triangleIdx => {
                        faces.push(parseFace(triangleIdx))
                    })
                continue;
            }
        }
        // const newFaces = faces.map((f, i) => i % 2 === 0 ? f : { ...f, textures: [f.textures[0], f.textures[2], f.textures[1]] })
        return new Mesh({ name, vertices, normals, textureCoords, faces })
    }

    static ofBox(box, name) {
        const vertices = UNIT_BOX_VERTEX.map(v => v.mul(box.diagonal).add(box.min))
        return new Mesh({ name: name, vertices, faces: UNIT_BOX_LINES.map(indx => ({ vertices: indx })) });
    }
}

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

function triangulate(polygon) {
    if (polygon.length === 3) {
        return [polygon];
    }
    if (polygon.length === 4) {
        return [
            [polygon[0], polygon[1], polygon[2]],
            [polygon[2], polygon[3], polygon[0]]
        ]
    }
}


function parseFace(vertexInfo) {
    const facesInfo = vertexInfo
        .flatMap(x => x.split("/"))
        .map(x => Number.parseFloat(x));
    const length = facesInfo.length;
    const lengthDiv3 = Math.floor(length / 3);
    // vertex_index/texture_index/normal_index
    const group = groupBy(facesInfo, (_, i) => i % lengthDiv3);
    const face = { vertices: [], textures: [], normals: [] }
    Object.keys(group).map(k => {
        k = Number.parseInt(k);
        const indices = group[k].map(x => x - 1); // obj file is 1-indexed
        if (k === 0) face.vertices = indices;
        if (k === 1) face.textures = indices;
        if (k === 2) face.normals = indices;
    });
    return face;
}