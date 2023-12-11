export function some(x) {
    return {
        map: f => maybe(f(x)),
        orElse: () => x,
        forEach: (f) => f(x),
        flatMap: f => f(x),
        isSome: () => true,
    }
}

export function none() {
    return {
        map: () => none(),
        orElse: f => f(),
        forEach: () => { },
        flatMap: () => none(),
        isSome: () => false,
    }
}

export function maybe(x) {
    if (x) {
        return some(x);
    }
    return none(x)
}