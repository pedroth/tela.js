import Ray from "../Ray/Ray.js"
import { clamp, randomPointInSphere } from "../Utils/Math.js";

export const MATERIALS = {
    Diffuse:  Diffuse,
    Metallic:  Metallic,
    Alpha:  Alpha,
    DiElectric: DiElectric
}
const MATERIAL_NAMES = Object.keys(MATERIALS).reduce((e,x) => ({[x]: x, ...e}), {});

export function Diffuse() {
    return {
        type: MATERIAL_NAMES.Diffuse,
        args: [],
        scatter(inRay, point, element) {
            let normal = element.normalToPoint(point);
            const randomInSphere = randomPointInSphere(3);
            if (randomInSphere.dot(normal) >= 0) return Ray(point, randomInSphere);
            return Ray(point, randomInSphere.scale(-1));
        }
    }
}

export function Metallic(fuzz = 0) {
    return {
        type: MATERIAL_NAMES.Metallic,
        args: [fuzz],
        scatter(inRay, point, element) {
            fuzz = Math.min(1, Math.max(0, fuzz));
            let normal = element.normalToPoint(point);
            const v = inRay.dir;
            let reflected = v.sub(normal.scale(2 * v.dot(normal)));
            reflected = reflected.add(randomPointInSphere(3).scale(fuzz)).normalize();
            return Ray(point, reflected);
        }
    }
}

export function Alpha(alpha = 1) {
    alpha = clamp()(alpha);
    return {
        type: MATERIAL_NAMES.Alpha,
        args: [alpha],
        scatter(inRay, point, element) {
            if (Math.random() <= alpha) return Diffuse().scatter(inRay, point, element);
            const v = point.sub(inRay.init);
            let t = undefined
            if (inRay.dir.x !== 0) t = v.x / inRay.dir.x;
            if (inRay.dir.y !== 0) t = v.y / inRay.dir.y;
            if (inRay.dir.z !== 0) t = v.z / inRay.dir.z;
            return Ray(inRay.trace(t + 1e-2), inRay.dir);
        }
    }
}

export function DiElectric(indexOfRefraction = 1.0) {
    return {
        type: MATERIAL_NAMES.DiElectric,
        args: [indexOfRefraction],
        scatter(inRay, point, element) {
            const p = point.sub(inRay.init);
            let t = undefined
            if (inRay.dir.x !== 0) t = p.x / inRay.dir.x;
            if (inRay.dir.y !== 0) t = p.y / inRay.dir.y;
            if (inRay.dir.z !== 0) t = p.z / inRay.dir.z;

            const isInside = element.isInside(point);
            const refractionRatio = isInside ? indexOfRefraction : 1 / indexOfRefraction;
            const vIn = inRay.dir;
            const n = element.normalToPoint(point).scale(-1);
            const cosThetaIn = Math.min(1, vIn.dot(n));
            const sinThetaIn = Math.sqrt(1 - cosThetaIn * cosThetaIn);
            const sinThetaOut = refractionRatio * sinThetaIn;
            if (sinThetaOut > 1) {
                // reflect
                const vOut = vIn.sub(n.scale(-2 * cosThetaIn));
                return Ray(inRay.trace(t + 1e-2), vOut);
            }
            // refract
            const cosThetaOut = Math.sqrt(1 - sinThetaOut * sinThetaOut)
            const vp = n.scale(cosThetaIn);
            const vo = vIn.sub(vp).normalize();
            const vOut = n.scale(cosThetaOut).add(vo.scale(sinThetaOut));

            return Ray(inRay.trace(t + 1e-2), vOut);
        }
    }
}