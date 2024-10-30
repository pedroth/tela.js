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

export function qBezier(p1, p2, p3) {
    const q1 = lerp(p1, p2);
    const q2 = lerp(p2, p3);
    return t => lerp(q1(t), q2(t))(t);
}

export function cBezier(p1, p2, p3, p4) {
    const b1 = lerp(p1, p2);
    const b2 = lerp(p2, p3);
    const b3 = lerp(p3, p4);
    return t => {
        const c1 = lerp(b1(t), b2(t));
        const c2 = lerp(b2(t), b3(t));
        return lerp(c1(t), c2(t))(t);
    }
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


export function orthoBasisFrom(...vectors) {
    const basis = [];
    const n = vectors.length;
    for (let i = 0; i < n; i++) {
        let v = vectors[i];
        for (let j = 0; j < basis.length; j++) {
            v = v.sub(basis[j].scale(v.dot(basis[j])))
        }
        basis.push(v.normalize());
    }
    return basis;
}