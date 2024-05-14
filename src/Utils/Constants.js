import { Vec3 } from "../Vector/Vector.js"
export const MAX_8BIT = 255;
export const RAD2DEG = 180 / Math.PI;


export const UNIT_BOX_VERTEX = [
    Vec3(),
    Vec3(1, 0, 0),
    Vec3(1, 1, 0),
    Vec3(0, 1, 0),
    Vec3(0, 0, 1),
    Vec3(1, 0, 1),
    Vec3(1, 1, 1),
    Vec3(0, 1, 1),
]

export const UNIT_BOX_FACES = [
    // x-y
    [0, 1, 2],
    [2, 3, 0],
    [4, 5, 6],
    [6, 7, 4],
    // x-z
    [0, 1, 4],
    [4, 5, 1],
    [2, 3, 6],
    [6, 7, 3],
    // y-z
    [0, 3, 7],
    [7, 4, 0],
    [1, 2, 6],
    [6, 5, 1]
]