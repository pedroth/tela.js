export function measureTime(lambda) {
    const t = performance.now();
    lambda()
    return 1e-3 * (performance.now() - t);
}

export async function measureTimeWithAsyncResult(lambda) {
    const t = performance.now();
    const result = await lambda();
    return { result, time: 1e-3 * (performance.now() - t) };
}

export function measureTimeWithResult(lambda) {
    const t = performance.now();
    const result = lambda();
    return { result, time: 1e-3 * (performance.now() - t) };
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

export function groupBy(array, groupFunction) {
    const ans = {};
    array.forEach((x, i) => {
        const key = groupFunction(x, i);
        if (!ans[key]) ans[key] = [];
        ans[key].push(x);
    });
    return ans;
}

export function argmin(array, costFunction = x => x) {
    let argminIndex = -1;
    let cost = Number.MAX_VALUE;
    // faster than forEach
    for (let i = 0; i < array.length; i++) {
        const newCost = costFunction(array[i], i);
        if (newCost < cost) {
            cost = newCost;
            argminIndex = i;
        }
    }
    return argminIndex;
}

export function shuffle(elements) {
    for (let i = elements.length - 1; i > 0; i--) {
        // random number between 0 and i
        const r = Math.floor(Math.random() * (i + 1));
        //swap in place
        const temp = elements[i];
        elements[i] = elements[r];
        elements[r] = temp;
    }
    return elements;
}

export function arrayIsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function memoize(func) {
    // not working...
    const cache = {}
    return (...args) => {
        const key = JSON.stringify(args.map(x => x.toString()));
        if (key in cache) return cache[key];
        const ans = func(...args);
        cache[key] = ans;
        return ans;
    }
}