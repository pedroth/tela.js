export function smin(a, b, k = 32) {
    const res = Math.exp(-k * a) + Math.exp(-k * b);
    return -Math.log(res) / k;
}
