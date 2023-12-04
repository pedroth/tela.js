export function measureTime(lambda) {
    const t = performance.now();
    lambda()
    return 1e-3 * (performance.now() - t);
}

export function compose(f, g) {
    return x => f(g(x));
}