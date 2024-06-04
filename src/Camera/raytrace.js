import Color from "../Color/Color.js";
import Ray from "../Ray/Ray.js";
import Vec from "../Vector/Vector.js";

export function rayTrace(scene, params) {
    let { samplesPerPxl, bounces, variance, gamma } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.5;
    const invSamples = bounces / samplesPerPxl;
    const lambda = ray => {
        let c = Color.BLACK;
        for (let i = 0; i < samplesPerPxl; i++) {
            const epsilon = Vec.RANDOM(3).scale(variance);
            const epsilonOrto = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
            const r = Ray(ray.init, ray.dir.add(epsilonOrto).normalize());
            c = c.add(trace(r, scene, { bounces }));
        }
        return c.scale(invSamples).toGamma(gamma);
    }
    return lambda;
}

function trace(ray, scene, options) {
    const { bounces } = options;
    if (bounces < 0) return Color.BLACK;
    const hit = scene.interceptWithRay(ray);
    if (!hit) return Color.BLACK;
    const [, p, e] = hit;
    const color = e.color ?? e.colors[0];
    const mat = e.material;
    let r = mat.scatter(ray, p, e);
    let finalC = trace(
      r,
      scene,
      { bounces: bounces - 1 }
    );
    return e.emissive ? color.add(color.mul(finalC)) : color.mul(finalC);
  }