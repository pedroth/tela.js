import Color from "../Color/Color.js";
import Ray from "../Ray/Ray.js";

export function sdfTrace(scene) {
    return ray => {
        const maxIte = 100;
        const epsilon = 1e-6;
        let p = ray.init;
        let t = scene.distanceOnRay(ray);
        let minT = t;
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = scene.distanceOnRay(Ray(p, ray.dir));
            t += d;
            if (d < epsilon) {
                const normal = scene.normalToPoint(p);
                return Color.ofRGB(
                    (normal.x + 1) / 2,
                    (normal.y + 1) / 2,
                    (normal.z + 1) / 2
                )
            }
            if (d > 2 * minT) {
                return Color.ofRGB(0, 0, i / maxIte);
            }
            minT = d;
        }
        return Color.BLACK;
    }
}