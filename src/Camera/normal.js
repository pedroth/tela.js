import Color from "../Color/Color.js";

export function normalTrace(scene) {
    return ray => {
        const hit = scene.interceptWithRay(ray)
        if (hit) {
            const [, point, element] = hit;
            const normal = element.normalToPoint(point);
            return Color.ofRGB(
                (normal.get(0) + 1) / 2,
                (normal.get(1) + 1) / 2,
                (normal.get(2) + 1) / 2
            )
        }
        return Color.BLACK;
    }
}