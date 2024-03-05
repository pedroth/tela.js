import Line from "../Scene/Line.js";
import { Vec3 } from "../Vector/Vector.js";

const UNIT_BOX_VERTEX = [
    Vec3(),
    Vec3(1, 0, 0),
    Vec3(1, 1, 0),
    Vec3(0, 1, 0),
    Vec3(0, 0, 1),
    Vec3(1, 0, 1),
    Vec3(1, 1, 1),
    Vec3(0, 1, 1),
]

const UNIT_BOX_FACES = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [3, 7],
    [2, 6],
]

export function drawBox({ box, color, debugScene }) {
    if (box.isEmpty) return;
    const vertices = UNIT_BOX_VERTEX.map(v => v.mul(box.diagonal).add(box.min))
    const lines = UNIT_BOX_FACES
        .map(([i, j]) =>
            Line
                .builder()
                .name(`debug_box_${i}_${j}`)
                .positions(vertices[i], vertices[j])
                .colors(color, color)
                .build()
        )
    debugScene.addList(lines);
    return debugScene;
}