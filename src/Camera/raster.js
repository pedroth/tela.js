import Color from "../Color/Color.js";
import Line from "../Geometry/Line.js";
import Point from "../Geometry/Point.js";
import Mesh from "../Geometry/Mesh.js";
import Triangle from "../Geometry/Triangle.js";
import { lerp } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";

export function rasterGraphics(scene, camera, params) {
    const type2render = {
        [Point.name]: rasterPoint,
        [Line.name]: rasterLine,
        [Triangle.name]: rasterTriangle,
        [Mesh.name]: rasterMesh,
    }
    const {
        cullBackFaces,
        bilinearTexture,
        clipCameraPlane,
        clearScreen,
        backgroundColor,
    } = params;
    params.cullBackFaces = cullBackFaces ?? true;
    params.bilinearTexture = bilinearTexture ?? false;
    params.clipCameraPlane = clipCameraPlane ?? true;
    params.clearScreen = clearScreen ?? true;
    params.backgroundColor = backgroundColor ?? Color.BLACK;

    return canvas => {
        params.clearScreen && canvas.fill(params.backgroundColor);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h).fill(Number.MAX_VALUE);
        const elements = scene.getElements();
        for (let i = 0; i < elements.length; i++) {
            const elem = elements[i];
            if (elem.constructor.name in type2render) {
                type2render[elem.constructor.name]({
                    w,
                    h,
                    elem,
                    canvas,
                    params,
                    zBuffer,
                    camera,
                });
            }
        }
        canvas.paint();
        return canvas;
    }
}


function rasterPoint({ canvas, camera, elem, w, h, zBuffer }) {
    const point = elem;
    const { distanceToPlane } = camera;
    const { texCoord, texture, position, color, radius } = point;
    // camera coords
    let pointInCamCoord = camera.toCameraCoord(position)
    //frustum culling
    const z = pointInCamCoord.z;
    if (z < distanceToPlane) return;
    //project
    const projectedPoint = pointInCamCoord
        .scale(distanceToPlane / z);
    // shader
    let x = w / 2 + projectedPoint.x * w;
    let y = h / 2 + projectedPoint.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const intRadius = Math.ceil((radius) * (distanceToPlane / z) * w);
    let finalColor = color;
    if (
        texture &&
        texCoord
    ) {
        const texColor = getTexColor(texCoord, texture);
        finalColor = finalColor.add(texColor).scale(1 / 2);
    }
    for (let k = -intRadius; k < intRadius; k++) {
        for (let l = -intRadius; l < intRadius; l++) {
            const xl = Math.max(0, Math.min(w - 1, x + k));
            const yl = Math.floor(y + l);
            const [i, j] = canvas.canvas2grid(xl, yl);
            const zBufferIndex = Math.floor(w * i + j);
            if (z < zBuffer[zBufferIndex]) {
                zBuffer[zBufferIndex] = z;
                canvas.setPxl(
                    xl,
                    yl,
                    finalColor
                )
            }
        }
    }
}

function rasterLine({ canvas, camera, elem, w, h, zBuffer, params }) {
    const lineElem = elem;
    const { colors, positions } = lineElem;
    const { distanceToPlane } = camera;
    // camera coords
    const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
    //frustum culling
    let inFrustum = [];
    let outFrustum = [];
    pointsInCamCoord.forEach((p, i) => {
        const zCoord = p.z;
        if (zCoord < distanceToPlane) {
            outFrustum.push(i);
        } else {
            inFrustum.push(i);
        }
    });
    if (params.clipCameraPlane && outFrustum.length === 2) return;
    if (outFrustum.length === 1) {
        const inVertex = inFrustum[0];
        const outVertex = outFrustum[0];
        const inter = lineCameraPlaneIntersection(
            pointsInCamCoord[outVertex],
            pointsInCamCoord[inVertex],
            camera
        );
        pointsInCamCoord[outVertex] = inter;
    }
    //project
    const projectedPoints = pointsInCamCoord
        .map(p => p.scale(distanceToPlane / p.z))
    // integer coordinates
    const intPoints = projectedPoints
        .map((p) => {
            let x = w / 2 + p.x * w;
            let y = h / 2 + p.y * h;
            x = Math.floor(x);
            y = Math.floor(y);
            return Vec2(x, y);
        })
    // shader
    const v = intPoints[1].sub(intPoints[0]);
    const vSquared = v.squareLength();
    const shader = (x, y) => {
        const p = Vec2(x, y).sub(intPoints[0]);
        const t = v.dot(p) / vSquared;
        const z = pointsInCamCoord[0].z * (1 - t) + pointsInCamCoord[1].z * t;
        const c = colors[0].scale(1 - t).add(colors[1].scale(t));
        const [i, j] = canvas.canvas2grid(x, y);
        const zBufferIndex = Math.floor(w * i + j);
        if (z < zBuffer[zBufferIndex]) {
            zBuffer[zBufferIndex] = z;
            return c;
        }
    }
    canvas.drawLine(intPoints[0], intPoints[1], shader);
}

function rasterTriangle({ canvas, camera, elem, w, h, zBuffer, params }) {
    const triangleElem = elem;
    const { distanceToPlane } = camera;
    const { colors, positions, texCoords, texture, } = triangleElem;
    // camera coords
    const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
    // back face culling
    if (params.cullBackFaces) {
        const du = pointsInCamCoord[1].sub(pointsInCamCoord[0]);
        const dv = pointsInCamCoord[2].sub(pointsInCamCoord[0]);
        const n = du.cross(dv).normalize();
        if (n.dot(pointsInCamCoord[0]) <= 0) return;
    }
    //frustum culling
    let inFrustum = [];
    let outFrustum = [];
    pointsInCamCoord.forEach((p, i) => {
        const zCoord = p.z;
        if (zCoord < distanceToPlane) {
            outFrustum.push(i);
        } else {
            inFrustum.push(i);
        }
    });
    if (params.clipCameraPlane && outFrustum.length >= 1) return;
    //project
    const projectedPoints = pointsInCamCoord
        .map(p => p.scale(distanceToPlane / p.z))
    // integer coordinates
    const intPoints = projectedPoints
        .map((p) => {
            let x = w / 2 + p.x * w;
            let y = h / 2 + p.y * h;
            x = Math.floor(x);
            y = Math.floor(y);
            return Vec2(x, y);
        })
    // shader
    const u = intPoints[1].sub(intPoints[0]);
    const v = intPoints[2].sub(intPoints[0]);
    const det = u.x * v.y - u.y * v.x; // wedge product
    if (det === 0) return;
    const invDet = 1 / det;
    const c1 = colors[0].toArray();
    const c2 = colors[1].toArray();
    const c3 = colors[2].toArray();
    const haveTextures = texCoords &&
        texCoords.length > 0 &&
        !texCoords.some(x => x === undefined);
    const shader = (x, y) => {
        const p = Vec2(x, y).sub(intPoints[0]);
        const alpha = - (v.x * p.y - v.y * p.x) * invDet;
        const beta = (u.x * p.y - u.y * p.x) * invDet;
        const gamma = 1 - alpha - beta;
        const z = pointsInCamCoord[0].z * gamma +
            pointsInCamCoord[1].z * alpha +
            pointsInCamCoord[2].z * beta;
        // compute color
        let c = Color.ofRGB(
            c1[0] * gamma + c2[0] * alpha + c3[0] * beta,
            c1[1] * gamma + c2[1] * alpha + c3[1] * beta,
            c1[2] * gamma + c2[2] * alpha + c3[2] * beta,
            c1[3] * gamma + c2[3] * alpha + c3[3] * beta,
        );
        if (haveTextures) {
            const texUV = texCoords[0].scale(gamma)
                .add(texCoords[1].scale(alpha))
                .add(texCoords[2].scale(beta));
            const texColor = texture ?
                params.bilinearTexture ?
                    getBiLinearTexColor(texUV, texture) :
                    getTexColor(texUV, texture) :
                getDefaultTexColor(texUV);
            c = texColor;
        }
        const [i, j] = canvas.canvas2grid(x, y);
        const zBufferIndex = Math.floor(w * i + j);
        if (z < zBuffer[zBufferIndex]) {
            zBuffer[zBufferIndex] = z;
            return Math.random() < c.alpha ? c : undefined;
        }
    }
    canvas.drawTriangle(intPoints[0], intPoints[1], intPoints[2], shader);
}

function rasterMesh({ canvas, camera, elem, w, h, zBuffer, params }) {
    const triangles = elem.meshScene.getElements();
    for (let i = 0; i < triangles.length; i++) {
        rasterTriangle({ canvas, camera, elem: triangles[i], w, h, zBuffer, params })
    }
}

function lineCameraPlaneIntersection(vertexOut, vertexIn, camera) {
    const { distanceToPlane } = camera;
    const v = vertexIn.sub(vertexOut);
    const alpha = (distanceToPlane - vertexOut.z) / v.z;
    const p = vertexOut.add(v.scale(alpha));
    return p;
}

function getDefaultTexColor(texUV) {
    texUV = texUV.scale(16).map(x => x % 1)
    return texUV.x < 0.5 && texUV.y < 0.5 ?
        Color.BLACK :
        texUV.x > 0.5 && texUV.y > 0.5 ?
            Color.BLACK :
            Color.PURPLE;
}

function getBiLinearTexColor(texUV, texture) {
    const size = Vec2(texture.width, texture.height);
    const texInt = texUV.mul(size);

    const texInt0 = texInt.map(Math.floor);
    const texInt1 = texInt0.add(Vec2(1, 0));
    const texInt2 = texInt0.add(Vec2(0, 1));
    const texInt3 = texInt0.add(Vec2(1, 1));

    const color0 = texture.getPxl(...texInt0.toArray());
    const color1 = texture.getPxl(...texInt1.toArray());
    const color2 = texture.getPxl(...texInt2.toArray());
    const color3 = texture.getPxl(...texInt3.toArray());

    const x = texInt.sub(texInt0);
    const bottomX = lerp(color0, color1)(x.x);
    const topX = lerp(color2, color3)(x.x);
    return lerp(bottomX, topX)(x.y);
}

function getTexColor(texUV, texture) {
    return texture.getPxl(texUV.x * texture.width, texUV.y * texture.height);
}