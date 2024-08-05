import Color from "../Color/Color.js";
import Box from "../Geometry/Box.js";
import { mod } from "../Utils/Math.js";
import { Vec2 } from "../Vector/Vector.js";

export const CHANNELS = 4;

// Abstract Image
export default class Tela {
    constructor(width, height) {
        this.isDirty = false;
        this.width = width;
        this.height = height;
        this.image = new Float32Array(CHANNELS * this.width * this.height);
        this.box = new Box(Vec2(0, 0), Vec2(this.width, this.height));
    }

    hash() {
        if (!this.isDirty && this._hash) return this._hash;
        let h = 0;
        for (let i = 0; i < this.image.length; i++) {
            h += (h * 37) ^ this.image[i];
        }
        this._hash = h;
        this.isDirty = false;
        return h;
    }

    // Flush image data
    paint() {
        // To be implemented by its children
        return this;
    }

    /**
    * lambda: (x: Number, y: Number) => Color 
    */
    map(lambda) {
        const n = this.image.length;
        const w = this.width;
        const h = this.height;
        for (let k = 0; k < n; k += CHANNELS) {
            const i = Math.floor(k / (CHANNELS * w));
            const j = Math.floor((k / CHANNELS) % w);
            const x = j;
            const y = h - 1 - i;
            const color = lambda(x, y);
            if (!color) continue;
            this.image[k] = color.red;
            this.image[k + 1] = color.green;
            this.image[k + 2] = color.blue;
            this.image[k + 3] = color.alpha;
        }
        this.isDirty = true;
        return this.paint();
    }

    fill(color) {
        if (!color) return;
        const n = this.image.length;
        for (let k = 0; k < n; k += CHANNELS) {
            this.image[k] = color.red;
            this.image[k + 1] = color.green;
            this.image[k + 2] = color.blue;
            this.image[k + 3] = color.alpha;
        }
        this.isDirty = true;
        return this;
    }

    getPxl(x, y) {
        const w = this.width;
        const h = this.height;
        let [i, j] = this.canvas2grid(x, y);
        i = mod(i, h);
        j = mod(j, w);
        let index = CHANNELS * (w * i + j);
        return Color.ofRGB(this.image[index], this.image[index + 1], this.image[index + 2], this.image[index + 3]);
    }

    setPxl(x, y, color) {
        const w = this.width;
        const [i, j] = this.canvas2grid(x, y);
        let index = CHANNELS * (w * i + j);
        this.image[index] = color.red;
        this.image[index + 1] = color.green;
        this.image[index + 2] = color.blue;
        this.image[index + 3] = color.alpha;
        this.isDirty = true;
        return this;
    }

    setPxlData(index, color) {
        this.image[index] = color.red;
        this.image[index + 1] = color.green;
        this.image[index + 2] = color.blue;
        this.image[index + 3] = color.alpha;
        this.isDirty = true;
        return this;
    }

    drawLine(p1, p2, shader) {
        const w = this.width;
        const h = this.height;
        const line = clipLine(p1, p2, this.box);
        if (line.length <= 1) return;
        const [pi, pf] = line;
        const v = pf.sub(pi);
        const n = v.map(Math.abs).fold((e, x) => e + x);
        for (let k = 0; k < n; k++) {
            const s = k / n;
            const lineP = pi.add(v.scale(s)).map(Math.floor);
            const [x, y] = lineP.toArray();
            const j = x;
            const i = h - 1 - y;
            const index = CHANNELS * (i * w + j);
            const color = shader(x, y);
            if (!color) continue;
            this.image[index] = color.red;
            this.image[index + 1] = color.green;
            this.image[index + 2] = color.blue;
            this.image[index + 3] = color.alpha;
        }
        this.isDirty = true;
        return this;
    }

    drawTriangle(x1, x2, x3, shader) {
        this.isDirty = true;
        return drawConvexPolygon(this, [x1, x2, x3], shader);
    }

    grid2canvas(i, j) {
        const h = this.height;
        const x = j;
        const y = h - 1 - i;
        return [x, y]
    }

    canvas2grid(x, y) {
        const h = this.height;
        const j = Math.floor(x);
        const i = Math.floor(h - 1 - y);
        return [i, j];
    }

    exposure(time = Number.MAX_VALUE) {
        let it = 1;
        const ans = {};
        // chatGPT
        for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
            if (descriptor && typeof descriptor.value === 'function') {
                ans[key] = descriptor.value.bind(this);
            }
        }
        // end of chatGPT
        ans.width = this.width;
        ans.height = this.height;
        ans.map = (lambda) => {
            const n = this.image.length;
            const w = this.width;
            const h = this.height;
            for (let k = 0; k < n; k += 4) {
                const i = Math.floor(k / (4 * w));
                const j = Math.floor((k / 4) % w);
                const x = j;
                const y = h - 1 - i;
                const color = lambda(x, y);
                if (!color) continue;
                this.image[k] = this.image[k] + (color.red - this.image[k]) / it;
                this.image[k + 1] = this.image[k + 1] + (color.green - this.image[k + 1]) / it;
                this.image[k + 2] = this.image[k + 2] + (color.blue - this.image[k + 2]) / it;
                this.image[k + 3] = this.image[k + 3] + (color.alpha - this.image[k + 3]) / it;
            }
            ans.isDirty = true;
            if (it < time) it++
            return this.paint();
        }

        ans.setPxl = (x, y, color) => {
            const w = this.width;
            const [i, j] = this.canvas2grid(x, y);
            let index = 4 * (w * i + j);
            this.image[index] = this.image[index] + (color.red - this.image[index]) / it;
            this.image[index + 1] = this.image[index + 1] + (color.green - this.image[index + 1]) / it;
            this.image[index + 2] = this.image[index + 2] + (color.blue - this.image[index + 2]) / it;
            this.image[index + 3] = this.image[index + 3] + (color.alpha - this.image[index + 3]) / it;
            ans.isDirty=true;
            return this;
        }

        ans.setPxlData = (index, color) => {
            this.image[index] = this.image[index] + (color.red - this.image[index]) / it;
            this.image[index + 1] = this.image[index + 1] + (color.green - this.image[index + 1]) / it;
            this.image[index + 2] = this.image[index + 2] + (color.blue - this.image[index + 2]) / it;
            this.image[index + 3] = this.image[index + 3] + (color.alpha - this.image[index + 3]) / it;
            ans.isDirty=true;
            return ans;
        }

        ans.paint = () => {
            if (it < time) it++
            return this.paint();
        }
        return ans;
    }

    resize(width, height) {
        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.image = new Float32Array(CHANNELS * this.width * this.height);
        this.box = new Box(Vec2(0, 0), Vec2(this.width, this.height));
    }

    serialize() {
        return {width: this.width, height: this.height, image: this.image};
    }
}
//========================================================================================
/*                                                                                      *
 *                                  AUXILIARY FUNCTIONS                                 *
 *                                                                                      */
//========================================================================================

function drawConvexPolygon(tela, positions, shader) {
    const { width, height } = tela;
    const canvasBox = tela.box;
    let boundingBox = Box.EMPTY;
    positions.forEach((x) => {
        boundingBox = boundingBox.add(new Box(x, x));
    });
    const finalBox = canvasBox.intersection(boundingBox);
    if (finalBox.isEmpty) return tela;
    const [xMin, yMin] = finalBox.min.toArray();
    const [xMax, yMax] = finalBox.max.toArray();

    const isInsideFunc = isInsideConvex(positions);
    for (let x = xMin; x < xMax; x++) {
        for (let y = yMin; y < yMax; y++) {
            if (isInsideFunc(Vec2(x, y))) {
                const j = x;
                const i = height - 1 - y;
                const color = shader(x, y);
                if (!color) continue;
                const index = CHANNELS * (i * width + j);
                tela.image[index] = color.red;
                tela.image[index + 1] = color.green;
                tela.image[index + 2] = color.blue;
                tela.image[index + 3] = color.alpha;
            }
        }
    }
    return tela;
}

function isInsideConvex(positions) {
    const m = positions.length;
    const v = [];
    const n = [];
    for (let i = 0; i < m; i++) {
        const p1 = positions[(i + 1) % m];
        const p0 = positions[i];
        v[i] = p1.sub(p0);
        n[i] = Vec2(-v[i].y, v[i].x);
    }
    const orientation = v[0].x * v[1].y - v[0].y * v[1].x >= 0 ? 1 : -1;
    return x => {
        for (let i = 0; i < m; i++) {
            const r = x.sub(positions[i]);
            const myDot = r.dot(n[i]) * orientation;
            if (myDot < 0) return false;
        }
        return true;
    }
}

function clipLine(p0, p1, box) {
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