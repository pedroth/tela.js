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
    let { samplesPerPxl, bounces, variance, gamma, bilinearTexture, isBiased, renderSkyBox, useCache, useMetro } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.5;
    bilinearTexture = bilinearTexture ?? false;
    isBiased = isBiased ?? true;
    renderSkyBox = renderSkyBox ?? (() => Color.BLACK);
    useCache = useCache ?? false;
    useMetro = useMetro ?? false;
    const invSamples = (isBiased ? bounces : 1) / samplesPerPxl
    let c = Color.BLACK;
    for (let i = 0; i < samplesPerPxl; i++) {
        const epsilon = randomPointInSphere(3).scale(variance);
        const epsilonOrtho = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
        const r = Ray(ray.init, ray.dir.add(epsilonOrtho).normalize());
        c = c.add(
            useMetro ?
                traceMetro(r, scene, { bounces, bilinearTexture, renderSkyBox, useCache }) :
                trace(r, scene, { bounces, bilinearTexture, renderSkyBox, useCache })
        );
    }
    return c.scale(invSamples).toGamma(gamma);
}

export function trace(ray, scene, options) {
    const { bounces, bilinearTexture, renderSkyBox, useCache } = options;
    if (bounces < 0) return renderSkyBox(ray);
    const hit = scene.interceptWithRay(ray);
    if (!hit) return renderSkyBox(ray);
    const [, p, e] = hit;
    if (useCache) {
        const cachedColor = cache.get(p);
        if (cachedColor) { return cachedColor; }
    }
    const albedo = getColorFromElement(e, ray, { bilinearTexture });
    const mat = e.material;
    let scatterRay = mat.scatter(ray, p, e);
    let scatterColor = trace(
        scatterRay,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    let attenuation = scatterRay.dir.dot(e.normalToPoint(p));
    attenuation = attenuation <= 0 ? -attenuation : attenuation;
    const finalColor = e.emissive ?
        albedo.add(albedo.mul(scatterColor.scale(attenuation))) :
        albedo.mul(scatterColor.scale(attenuation));
    if (useCache) { cache.set(p, finalColor); }
    return finalColor;
}

export function traceMetro(ray, scene, options) {
    const { bounces, bilinearTexture, renderSkyBox, useCache } = options;
    if (bounces < 0) return renderSkyBox(ray);
    const hit = scene.interceptWithRay(ray);
    if (!hit) return renderSkyBox(ray);
    const [, p, e] = hit;
    if (useCache) {
        const cachedColor = cache.get(p);
        if (cachedColor) { return cachedColor; }
    }
    const albedo = getColorFromElement(e, ray, { bilinearTexture });
    const mat = e.material;
    // Metropolis sampling
    // https://en.wikipedia.org/wiki/Metropolis_light_transport
    let scatterRay = mat.scatter(ray, p, e);
    let scatterRayStar = mat.scatter(ray, p, e);
    let scatterColor = trace(
        scatterRay,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    let scatterColorStar = trace(
        scatterRayStar,
        scene,
        { bounces: bounces - 1, bilinearTexture, renderSkyBox }
    );
    const probM = scatterColorStar.toGray().red / scatterColor.toGray().red;
    if (Math.random() < probM) {
        scatterColor = scatterColorStar;
    }
    let attenuation = scatterRay.dir.dot(e.normalToPoint(p));
    attenuation = attenuation <= 0 ? -attenuation : attenuation;
    const finalColor = e.emissive ?
        albedo.add(albedo.mul(scatterColor.scale(attenuation))) :
        albedo.mul(scatterColor.scale(attenuation));
    if (useCache) { cache.set(p, finalColor); }
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


const lightColorCache = (gridSpace) => {
    const point2ColorMap = {};
    const point2Ite = {};
    const ans = {};
    ans.hash = (p) => {
        const integerCoord = p.map(z => Math.floor(z / gridSpace));
        const h = (integerCoord.x * 92837111) ^ (integerCoord.y * 689287499) ^ (integerCoord.z * 283923481);
        return Math.abs(h);
    }
    ans.set = (p, c) => {
        const h = ans.hash(p);
        if (h in point2ColorMap) {
            point2Ite[h] = point2Ite[h] + 1;
            point2ColorMap[h] = point2ColorMap[h].add(c.sub(point2ColorMap[h]).scale(1 / point2Ite[h]));
        } else {
            point2Ite[h] = 1;
            point2ColorMap[h] = c;
        }

        return ans;
    }
    ans.get = (p) => {
        const samples = 10;
        const coin = Math.random() < 0.5;
        if (!coin) return undefined;
        let validSamples = 0;
        const h = ans.hash(p);
        let accColor = point2ColorMap[h];
        if (!accColor) return undefined;
        for (let i = 0; i < samples; i++) {
            const epsilon = randomPointInSphere(3).scale(gridSpace);
            const p2 = p.add(epsilon);
            const h = ans.hash(p2);
            if (h in point2ColorMap) {
                accColor = accColor.add(point2ColorMap[h]);
                validSamples++;
            }
        }
        if (validSamples === 0) return undefined;
        return accColor.scale(1 / validSamples);

        // const h = ans.hash(p);
        // return Math.random() < 0.5 ? point2ColorMap[h] : undefined;
    }
    return ans;
}
const cache = lightColorCache(0.05);