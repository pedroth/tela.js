import { Mesh, Vec3 } from "../../dist/node/index.js";
import { readFileSync } from "fs"


const stanfordBunnyObj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj);
const bunnyBox = bunnyMesh.getBoundingBox();
console.log("Box:", bunnyBox.toString())
// bunnyMesh = bunnyMesh.map(v =>
//     v.map((x,i) => 2 * (x - bunnyBox.min.get(i)) / (bunnyBox.diagonal.get(i)) - 1)
// );
bunnyMesh = bunnyMesh.map(v => {
    const ans = v
        .sub(bunnyBox.min)
        .scale(2)
        .div(bunnyBox.diagonal)
        .sub(Vec3(1, 1, 1));
    return ans;
});

bunnyMesh.vertices.forEach((v => {
    console.log(">>>", v.toString());
}))

