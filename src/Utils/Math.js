import Vec from "../Vector/Vector.js";

export function smin(a, b, k = 32) {
    const res = Math.exp(-k * a) + Math.exp(-k * b);
    return -Math.log(res) / k;
}

export function mod(n, m) {
    return ((n % m) + m) % m;
}

export function clamp(min = 0, max = 1) {
    return x => Math.max(min, Math.min(max, x));
}

export function lerp(a, b) {
    if (typeof a === "number" && typeof b === "number")
        return t => a + (b - a) * t;
    return t => a.scale(1 - t).add(b.scale(t));
}

export function randomPointInSphere(dim) {
    let randomInSphere;
    while (true) {
        const random = Vec.RANDOM(dim).map(x => 2 * x - 1);
        if (random.squareLength() >= 1) continue;
        randomInSphere = random.normalize();
        break;
    }
    return randomInSphere;
}