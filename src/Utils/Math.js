export function smin(a, b, k = 32) {
    const res = Math.exp(-k * a) + Math.exp(-k * b);
    return -Math.log(res) / k;
}

export function clipLine(p0, p1, box) {
    const pointStack = [p0, p1];
    const inStack = [];
    const outStack = [];
    for (let i = 0; i < pointStack.length; i++) {
        const p = pointStack[i];
        if (box.collidesWith(p)) {
            inStack.push(p);
        } else {
            outStack.push(p);
        }
    }
    // both points are inside
    if (inStack.length >= 2) {
        return inStack;
    }
    // one of them is inside
    if (inStack.length === 1) {
        const [inPoint] = inStack;
        const [outPoint] = outStack;
        return [inPoint, ...lineBoxIntersection(inPoint, outPoint)];
    }
    // both points are outside,need to intersect the boundary
    return lineBoxIntersection(...outStack, box);
}

function lineBoxIntersection(start, end, box) {
    const width = box.max.get(0) - box.min.get(0);
    const height = box.max.get(1) - box.min.get(1);
    const v = end.sub(start);
    // point and direction of boundary
    const boundary = [
        [vec2.ZERO, vec2.of(height, 0)],
        [vec2.of(height, 0), vec2.of(0, width)],
        [vec2.of(height, width), vec2.of(-height, 0)],
        [vec2.of(0, width), vec2.of(0, -width)],
    ];
    const intersectionSolutions = [];
    boundary.forEach(([s, d]) => {
        if (d.get(0) === 0) {
            const solution = this._solveLowTriMatrix(v, -d.get(1), s.sub(start));
            solution !== undefined && intersectionSolutions.push(solution);
        } else {
            const solution = this._solveUpTriMatrix(v, -d.get(0), s.sub(start));
            solution !== undefined && intersectionSolutions.push(solution);
        }
    });
    const validIntersections = [];
    intersectionSolutions.forEach((solution) => {
        const [x, y] = [solution.get(0), solution.get(1)];
        if (0 <= x && x <= 1 && 0 <= y && y <= 1) {
            validIntersections.push(solution);
        }
    });
    if (validIntersections.length === 0) return [];
    return validIntersections.map((solution) => {
        const t = solution.get(0);
        return start.add(v.scale(t));
    });
}