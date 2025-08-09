import Color from "../Color/Color.js";
import Triangle from "../Geometry/Triangle.js";
import Ray from "../Ray/Ray.js";
import { randomPointInSphere } from "../Utils/Math.js";
import { getBiLinearTexColor, getDefaultTexColor, getTexColor } from "./common.js";

export function renderBackground(ray, backgroundImage) {
    const clampAcos = (x) => x > 1 ? 1 : x < -1 ? -1 : x;
    const dir = ray.dir;
    // atan2 returns [-π, π], we want [0, 1]
    const theta = Math.atan2(dir.y, dir.x) / (2 * Math.PI) + 0.5;
    const alpha = Math.acos(-clampAcos(dir.z)) / (Math.PI);
    return backgroundImage
        .getPxl(
            theta * backgroundImage.width,
            alpha * backgroundImage.height
        );
}


export function rayTrace(ray, scene, params = {}) {
    let { samplesPerPxl, bounces, variance, gamma, bilinearTexture, isBiased, renderSkyBox } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.5;
    bilinearTexture = bilinearTexture ?? false;
    isBiased = isBiased ?? true;
    renderSkyBox = renderSkyBox ?? (() => Color.BLACK);
    const invSamples = (isBiased ? bounces : 1) / samplesPerPxl
    let c = Color.BLACK;
    for (let i = 0; i < samplesPerPxl; i++) {
        const epsilon = randomPointInSphere(3).scale(variance);
        const epsilonOrtho = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
        const r = Ray(ray.init, ray.dir.add(epsilonOrtho).normalize());
        c = c.add(trace(r, scene, { bounces, bilinearTexture, renderSkyBox }));
    }
    return c.scale(invSamples).toGamma(gamma);
}

export function trace(ray, scene, options) {
    const { bounces, bilinearTexture, renderSkyBox } = options;
    if (bounces < 0) return renderSkyBox(ray);
    const hit = scene.interceptWithRay(ray);
    if (!hit) return renderSkyBox(ray);
    const [, p, e] = hit;
    const albedo = getColorFromElement(e, ray, { bilinearTexture });
    const mat = e.material;
    if (e.emissive) {
        return albedo;
    }
    const scatteredRay = mat.scatter(ray, p, e);
    const scatteredColor = trace(
        scatteredRay,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    const attenuation = scatteredRay.dir.dot(e.normalToPoint(p));
    const finalColor = albedo.mul(scatteredColor).scale(attenuation > 0 ? attenuation : 0);
    return finalColor;
}

export function traceMetro(ray, scene, options) {
    const { bounces, bilinearTexture, renderSkyBox } = options;
    if (bounces < 0) return renderSkyBox(ray);
    const hit = scene.interceptWithRay(ray);
    if (!hit) return renderSkyBox(ray);
    const [, p, e] = hit;
    const albedo = getColorFromElement(e, ray, { bilinearTexture });
    const mat = e.material;
    if (e.emissive) {
        return albedo;
    }
    // Metropolis sampling
    // https://en.wikipedia.org/wiki/Metropolis_light_transport

    let scatteredRay = mat.scatter(ray, p, e);
    let scatteredRayStar = mat.scatter(ray, p, e);
    let scatterColor = trace(
        scatteredRay,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    let scatterColorStar = trace(
        scatteredRayStar,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    const probM = scatterColorStar.toGray().red / scatterColor.toGray().red;
    if (Math.random() < probM) {
        scatterColor = scatterColorStar;
    }
    const attenuation = scatteredRay.dir.dot(e.normalToPoint(p));
    const finalColor = albedo.mul(scatterColor).scale(attenuation > 0 ? attenuation : 0);
    return finalColor;
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