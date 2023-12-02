export function measureTime(lambda) {
    const t = performance.now();
    lambda()
    return 1e-3 * (performance.now() - t);
}