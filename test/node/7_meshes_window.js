import { Camera, Mesh, NaiveScene, Vec3, Vec2, Image, loop, Window } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const maxRadius = 3;
const window = Window.ofSize(width, height);

// Scene setup
const scene = new NaiveScene();
const camera = new Camera().orbit(maxRadius, Math.PI, 0);

// Mesh selection
let nextMeshIndex = 0;
let currentMeshIndex = -1;

const meshes = [
  { mesh: "./assets/spot.obj", texture: "./assets/spot.png" },
  { mesh: "./assets/megaman.obj", texture: "./assets/megaman.png" },
  { mesh: "./assets/spyro.obj", texture: "./assets/spyro.png" },
  { mesh: "./assets/earth.obj", texture: "./assets/earth.jpg" },
  { mesh: "./assets/blub.obj", texture: "./assets/blub.png" },
  { mesh: "./assets/bob.obj", texture: "./assets/bob.png" },
  { mesh: "./assets/oil.obj", texture: "./assets/oil.png" },
  { mesh: "./assets/riku.obj", texture: "./assets/riku.png" },
  { mesh: "./assets/wipeout.obj", texture: "./assets/wipeout.png" },
  { mesh: "./assets/bunny_orig.obj", texture: undefined },
  { mesh: "./assets/rocker_arm.obj", texture: undefined },
  { mesh: "./assets/teapot.obj", texture: undefined },
  { mesh: "./assets/torus.obj", texture: undefined },
  { mesh: "./assets/moses_min.obj", texture: undefined },
  { mesh: "./assets/dragonHD.obj", texture: undefined },
];

async function loadMesh(index) {
  scene.clear();
  const meshObj = readFileSync(meshes[index].mesh, { encoding: "utf-8" });
  let mesh = Mesh.readObj(meshObj, "mesh");
  const box = mesh.getBoundingBox();
  const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
  mesh = mesh
    .mapVertices(v => v.sub(box.center).scale(scaleInv))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x));
  if (meshes[index].texture) {
    mesh = mesh.addTexture(await Image.ofUrl(meshes[index].texture));
  }
  scene.addList(mesh.asTriangles());
  currentMeshIndex = index;
}

await loadMesh(nextMeshIndex);

// Mouse handling
let mousedown = false;
let mouse = Vec2();

window.onMouseDown((x, y) => {
    mousedown = true;
    mouse = Vec2(x, y);
});

window.onMouseUp(() => {
    mousedown = false;
    mouse = Vec2();
});

window.onMouseMove((x, y) => {
    const newMouse = Vec2(x, y);
    if (!mousedown || newMouse.equals(mouse)) {
        return;
    }
    const [dx, dy] = newMouse.sub(mouse).toArray();
    camera.orbit(orbitCoord => orbitCoord.add(
        Vec3(
            0,
            -2 * Math.PI * (dx / window.width),
            -2 * Math.PI * (dy / window.height)
        )
    ));
    mouse = newMouse;
});

window.onMouseWheel(({ deltaY }) => {
    camera.orbit(orbitCoord => orbitCoord.add(Vec3(0.1 * deltaY, 0, 0)));
});

window.onKeyDown((e) => {
    const { key } = e;
    if (key === "right") {
        nextMeshIndex = (currentMeshIndex + 1) % meshes.length;
    }
    if (key === "left") {
        nextMeshIndex = (currentMeshIndex - 1 + meshes.length) % meshes.length;
    }
});

// Render loop
loop(async ({ dt }) => {
    if (currentMeshIndex !== nextMeshIndex) {
        await loadMesh(nextMeshIndex);
    }
    camera.reverseShot(
        scene,
        {
            cullBackFaces: true,
            bilinearTextures: true,
            clipCameraPlane: false
        }
    )
        .to(window)
        .paint();
    window.setTitle(`Select Mesh with left/right arrows | FPS: ${Math.floor(1 / dt)}`);
}).play();