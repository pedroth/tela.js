import { Vec2 } from "../Vector/Vector";

export function smin(a, b, k = 32) {
    const res = Math.exp(-k * a) + Math.exp(-k * b);
    return -Math.log(res) / k;
}

export function mod(n, m) {
    return ((n % m) + m) % m;
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
        return [inPoint, ...lineBoxIntersection(inPoint, outPoint, box)];
    }
    // both points are outside, need to intersect the boundary
    return lineBoxIntersection(...outStack, box);
}

//========================================================================================
/*                                                                                      *
 *                                       Auxiliary                                       *
 *                                                                                      */
//========================================================================================


function lineBoxIntersection(start, end, box) {
    const width = box.diagonal.x;
    const height = box.diagonal.y;
    const v = end.sub(start);
    // point and direction of boundary
    const boundary = [
        [Vec2(), Vec2(width, 0)],
        [Vec2(width, 0), Vec2(0, height)],
        [Vec2(width, height), Vec2(-width, 0)],
        [Vec2(0, height), Vec2(0, -height)],
    ];
    const intersectionSolutions = [];
    boundary.forEach(([s, d]) => {
        if (d.x === 0) {
            const solution = solveLowTriMatrix(v, -d.y, s.sub(start));
            solution !== undefined && intersectionSolutions.push(solution);
        } else {
            const solution = solveUpTriMatrix(v, -d.x, s.sub(start));
            solution !== undefined && intersectionSolutions.push(solution);
        }
    });
    const validIntersections = [];
    intersectionSolutions.forEach((solution) => {
        const [x, y] = [solution.x, solution.y];
        if (0 <= x && x <= 1 && 0 <= y && y <= 1) {
            validIntersections.push(solution);
        }
    });
    if (validIntersections.length === 0) return [];
    if (validIntersections.length >= 2) {
        const p1 = start.add(v.scale(validIntersections[0].x));
        const p2 = start.add(v.scale(validIntersections[1].x));
        return [p1, p2];
    }
    //it can be shown that at this point there is only one valid intersection
    return [start.add(v.scale(validIntersections[0].x))]
}

/**
 * return solution to : [ v_0 , 0] x = f_0
 *
 *                      [ v_1,  a] y = f_1
 */
function solveLowTriMatrix(v, a, f) {
    const v1 = v.x;
    const v2 = v.y;
    const av1 = a * v1;
    if (av1 === 0 || v1 === 0) return undefined;
    const f1 = f.x;
    const f2 = f.y;
    return Vec2(f1 / v1, (f2 * v1 - v2 * f1) / av1);
}

/**
 * return solution to : [ v_0 , a] x = f_0
 *
 *					    [ v_1,  0] y = f_1
 */
function solveUpTriMatrix(v, a, f) {
    const v1 = v.x;
    const v2 = v.y;
    const av2 = a * v2;
    if (av2 === 0 || v2 === 0) return undefined;
    const f1 = f.x;
    const f2 = f.y;
    return Vec2(f2 / v2, (f1 * v2 - v1 * f2) / av2);
}