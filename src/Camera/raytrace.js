import Color from "../Color/Color.js";
import Triangle from "../Geometry/Triangle.js";
import Ray from "../Ray/Ray.js";
import Vec from "../Vector/Vector.js";
import { getBiLinearTexColor, getDefaultTexColor, getTexColor } from "./common.js";

export function rayTrace(scene, params = {}) {
    let { samplesPerPxl, bounces, variance, gamma, bilinearTexture } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.5;
    bilinearTexture = bilinearTexture ?? false;

    const invSamples = bounces / samplesPerPxl;
    const lambda = ray => {
        let c = Color.BLACK;
        for (let i = 0; i < samplesPerPxl; i++) {
            const epsilon = Vec.RANDOM(3).scale(variance);
            const epsilonOrtho = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
            const r = Ray(ray.init, ray.dir.add(epsilonOrtho).normalize());
            c = c.add(trace(r, scene, { bounces, bilinearTexture }));
        }
        return c.scale(invSamples).toGamma(gamma);
    }
    return lambda;
}

export function trace(ray, scene, options) {
    const { bounces, bilinearTexture } = options;
    if (bounces < 0) return Color.BLACK;
    const hit = scene.interceptWithRay(ray);
    if (!hit) return Color.BLACK;
    const [, p, e] = hit;
    const color = getColorFromElement(e, ray, { bilinearTexture });
    const mat = e.material;
    let r = mat.scatter(ray, p, e);
    let finalC = trace(
        r,
        scene,
        { bounces: bounces - 1, bilinearTexture }
    );
    return e.emissive ? color.add(color.mul(finalC)) : color.mul(finalC);
}

function getColorFromElement(e, ray, params) {
    if (Triangle.name === e.constructor.name) {
        return getTriangleColor(e, ray, params);
    }
    return e.color ?? e.colors[0]
}

function getTriangleColor(triangle, ray, params) {
    const { tangents, positions, texCoords, texture, colors } = triangle;

    const haveTextures = texture &&
        texCoords &&
        texCoords.length > 0 &&
        !texCoords.some(x => x === undefined);

    const v = ray.init.sub(positions[0]);
    const u1 = tangents[0];
    const u2 = tangents[1];
    const r = ray.dir;
    const detInv = 1 / u1.cross(u2).dot(r);
    const alpha = v.cross(u2).dot(r) * detInv
    const beta = u1.cross(v).dot(r) * detInv;
    if (haveTextures) {
        const texUV = texCoords[0].scale(1 - alpha - beta)
            .add(texCoords[1].scale(alpha))
            .add(texCoords[2].scale(beta));
        const texColor = texture ?
            params.bilinearTexture ?
                getBiLinearTexColor(texUV, texture) :
                getTexColor(texUV, texture) :
            getDefaultTexColor(texUV);
        return texColor;
    }
    return colors[0]
        .scale(alpha)
        .add(colors[1].scale(beta))
        .add(colors[2].scale(1 - alpha - beta))
}