import Box from "../Geometry/Box.js";

export function triangulate(paths) {
    if (paths.length === 0) return [];
    const boxes = paths.map(path => path.reduce((e, x) => e.add(new Box(x, x)), new Box()));
    const boxTrees = createBoxHierarchy(boxes, paths);
    const triangles = []
    boxTrees.forEach((boxTree) => {
        triangles.push(...triangulateBoxTree(boxTree));
    })
    return triangles;
}

/**
 * boxes and paths must have same size
 */
function createBoxHierarchy(boxes, paths) {
    const trees = boxes.map((b, i) => ({ box: b, path: paths[i], children: [] }));
    const ans = [];
    for (let i = 0; i < trees.length; i++) {
        let left = trees[i];
        for (let j = i + 1; j < trees.length; j++) {
            const right = trees[j];
            const intersect = left.box.intersection(right.box);
            if (intersect.equals(right.box)) {
                left.children.push(right);
            }
            if (intersect.equals(left.box)) {
                right.children.push(left)
                left = right;
            }
        }
        if (!ans.some(x => x.box.contains(left.box))) ans.push(left);
    }
    if (ans.length === 0) ans.push(trees[0])
    return ans;
}

function triangulateBoxTree(boxTree) {
    const triangles = [];
    let path = [...joinBoxTreePaths(boxTree)];
    let i = 0;
    let samePath = 1e6;
    while (path.length > 3 && samePath > 0) {
        i = Math.floor(Math.random() * path.length);
        const prevIndex = mod(i - 1, path.length);
        const nextIndex = mod(i + 1, path.length);
        const prev = path[prevIndex];
        const next = path[nextIndex];
        const c = path[i];
        const u = next.sub(c);
        const v = prev.sub(c);
        const uWedgeV = u.cross(v);
        if (uWedgeV > 0) {
            samePath--;
            // i = (i + 1) % path.length;
            continue;
        }

        let havePointsInside = false;
        for (let j = 0; j < path.length; j++) {
            if (j === i || j === prevIndex || j === nextIndex) continue;
            const p = path[j].sub(c);
            const pWedgeV = p.cross(v);
            const uWedgeP = u.cross(p);
            if(uWedgeV === 0) continue;
            const alpha = pWedgeV / uWedgeV;
            const beta = uWedgeP / uWedgeV;
            if (alpha < 1 && alpha > 0 && beta < 1 && beta > 0) {
                havePointsInside = true;
                break;
            }
        }
        if (!havePointsInside) {
            if (uWedgeV > 0) triangles.push([prev, c, next])
            if (uWedgeV < 0) triangles.push([c, prev, next])
            path.splice(i, 1);
        }
        // i = (i + 1) % path.length;
    }
    const prev = path[2];
    const next = path[1];
    const c = path[0];
    const u = next.sub(c);
    const v = prev.sub(c);
    const uWedgeV = u.cross(v);
    if (uWedgeV > 0) triangles.push([path[2], path[0], path[1]])
    if (uWedgeV < 0) triangles.push([path[0], path[2], path[1]])
    return triangles;
}

function joinBoxTreePaths(boxTree) {
    const childPaths = boxTree.children.map(bT => bT.path);
    let grandPath = [...boxTree.path];
    childPaths.forEach(childPath => {
        let min = Number.MAX_VALUE;
        let minIndexI = -1;
        let minIndexJ = -1;
        for (let i = 0; i < grandPath.length; i++) {
            for (let j = 0; j < childPath.length; j++) {
                const d = childPath[j].sub(grandPath[i]).squareLength();
                // some deterministic salt in cost function
                if (d + j < min) {
                    min = d;
                    minIndexI = i;
                    minIndexJ = j;
                }
            }
        }
        const gradLeft = grandPath.slice(0, minIndexI + 1);
        const gradRight = grandPath.slice(minIndexI);
        const innerLeft = childPath.slice(0, minIndexJ + 1);
        const innerRight = childPath.slice(minIndexJ);
        grandPath = gradLeft.concat(cleanPath(innerRight.concat(innerLeft))).concat(gradRight);
    })
    return grandPath;
}


function mod(a, b) {
    return ((a % b) + b) % b;
}

function cleanPath(path) {
    const epsilon = 1e-6;
    const cleanPath = [];
    for (let i = 0; i < path.length - 1; i++) {
        if (!cleanPath.some(x => x.sub(path[i]).length() < epsilon)) {
            cleanPath.push(path[i]);
        }
    }
    cleanPath.push(path.at(-1));
    return cleanPath;
}