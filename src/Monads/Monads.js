export function some(x) {
    const object = {
        map: f => maybe(f(x)),
        orElse: () => x,
        forEach: (f) => f(x),
        flatMap: f => f(x),
        isSome: () => true,
    };
    return object;
}

export function none() {
    const object = {
        map: () => object,
        orElse: (f = () => { }) => f(),
        forEach: () => { },
        flatMap: () => object,
        isSome: () => false,
    };
    return object
}

export function maybe(x) {
    if (x) {
        return some(x);
    }
    return none(x)
}