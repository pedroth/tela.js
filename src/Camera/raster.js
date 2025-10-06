import Color from "../Color/Color.js";
import Line from "../Geometry/Line.js";
import Sphere from "../Geometry/Sphere.js";
import Mesh from "../Geometry/Mesh.js";
import Triangle from "../Geometry/Triangle.js";
import { Vec2 } from "../Vector/Vector.js";
import { getBiLinearTexColor, getDefaultTexColor, getTexColor } from "./common.js";

const ditheringMatrix4x4 = Float32Array.from([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]).map((x) => x / 16);

export function rasterGraphics(scene, camera, params = {}) {
    const type2render = {
        [Sphere.name]: rasterSphere,
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
        perspectiveCorrect,
    } = params;
    params.cullBackFaces = cullBackFaces ?? true;
    params.bilinearTexture = bilinearTexture ?? false;
    params.clipCameraPlane = clipCameraPlane ?? true;
    params.clearScreen = clearScreen ?? true;
    params.backgroundColor = backgroundColor ?? Color.BLACK;
    params.perspectiveCorrect = perspectiveCorrect ?? false;

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
        return canvas;
    }
}


function rasterSphere({ canvas, camera, elem, w, h, zBuffer }) {
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
    const intRadiusSquare = intRadius * intRadius;
    let finalColor = color;
    if (
        texture &&
        texCoord
    ) {
        const texColor = getTexColor(texCoord, texture);
        finalColor = finalColor.add(texColor).scale(1 / 2);
    }
    for (let l = -intRadius; l < intRadius; l++) {
        for (let k = -intRadius; k < intRadius; k++) {
            const xl = Math.max(0, Math.min(w - 1, x + k));
            const yl = Math.floor(y + l);
            const squareLength = k * k + l * l;
            if (squareLength > intRadiusSquare) continue;
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
        let W = 1;
        let wReciprocal = 1;
        const p = Vec2(x, y).sub(intPoints[0]);
        let alpha = - (v.x * p.y - v.y * p.x) * invDet;
        let beta = (u.x * p.y - u.y * p.x) * invDet;
        let gamma = 1 - alpha - beta;
        const zs = pointsInCamCoord.map(p => p.z);
        if (params.perspectiveCorrect) {
            // wReciprocal is the weight for perspective correction of z coordinate
            W = (1 / zs[0]) * gamma + (1 / zs[1]) * alpha + (1 / zs[2]) * beta;
            wReciprocal = 1 / W;
            alpha = (alpha / zs[1]) * wReciprocal;
            beta = (beta / zs[2]) * wReciprocal;
            gamma = (gamma / zs[0]) * wReciprocal;
        } else {
            wReciprocal = zs[0] * gamma + zs[1] * alpha + zs[2] * beta;
        }
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
                .add(texCoords[2].scale(beta))
            const texColor = texture ?
                params.bilinearTexture ?
                    getBiLinearTexColor(texUV, texture) :
                    getTexColor(texUV, texture) :
                c ? c : getDefaultTexColor(texUV); // TODO: review this
            c = texColor;
        }
        const [i, j] = canvas.canvas2grid(x, y);
        const zBufferIndex = Math.floor(w * i + j);
        if (wReciprocal < zBuffer[zBufferIndex]) {
            const matrixValue = ditheringMatrix4x4[(i % 4) * 4 + (j % 4)];
            const color = matrixValue < c.alpha ? c : undefined;
            if (color) zBuffer[zBufferIndex] = wReciprocal; // if color is undefined, don't update zBuffer
            return color;
        }
    }
    canvas.drawTriangle(intPoints[0], intPoints[1], intPoints[2], shader);
}

function rasterMesh({ canvas, camera, elem, w, h, zBuffer, params }) {
    const triangles = elem._meshScene.getElements();
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