export function measureTime(lambda) {
    const t = performance.now();
    lambda()
    return 1e-3 * (performance.now() - t);
}

export function compose(f, g) {
    return x => f(g(x));
}

export function or(...lambdas) {
    for (let i = 0; i < lambdas.length; i++) {
        try {
            return lambdas[i]();
        } catch (err) {
            continue;
        }
    }
}