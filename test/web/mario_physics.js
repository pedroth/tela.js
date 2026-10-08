/* eslint-disable no-undef */
async (canvas, logger) => {
    // AI made demo for reference to use tela.js for soft body physics with Mario mesh
    const div = document.createElement("div");
    div.innerHTML = `
        <p>Left drag: grab a triangle and stretch Mario</p>
        <p>Right drag: orbit camera</p>
        <p>Mouse wheel: zoom</p>
    `;
    document.body.appendChild(div);
    canvas.DOM.addEventListener("contextmenu", (e) => e.preventDefault());

    const width = 640;
    const height = 480;
    canvas.resize(width, height);

    const SPRING_STIFFNESS = 150;
    const FRICTION = 3;
    const REST_STIFFNESS = 25;
    const GRAB_STIFFNESS = 400;
    const MAX_STEP = 1 / 240;

    // load mesh, normalize and orient it
    const obj = await fetch("/assets/mario.obj").then(x => x.text());
    const texture = await Canvas.ofUrl("/assets/mario.png");
    let mesh = Mesh.readObj(obj, "mario");
    const box = mesh.getBoundingBox();
    const maxDiagInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
    mesh = mesh
        .addTexture(texture)
        .mapVertices(v => v.sub(box.center).scale(maxDiagInv))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x));

    // physics graph: one node per vertex, one spring per unique edge
    const n = mesh.vertices.length;
    const pos = new Float64Array(3 * n);
    const rest = new Float64Array(3 * n);
    const vel = new Float64Array(3 * n);
    mesh.vertices.forEach((v, i) => {
        pos.set(v.toArray(), 3 * i);
        rest.set(v.toArray(), 3 * i);
    });
    const faces = mesh.faces.map(f => f.vertices);
    const edgeSet = new Set();
    const edgeList = [];
    for (const f of faces) {
        for (let s = 0; s < 3; s++) {
            const a = f[s];
            const b = f[(s + 1) % 3];
            if (a === b) continue;
            const key = a < b ? a * n + b : b * n + a;
            if (edgeSet.has(key)) continue;
            edgeSet.add(key);
            edgeList.push([a, b]);
        }
    }
    const neighbors = [...Array(n)].map(() => []); // [other, restLength]
    for (const [a, b] of edgeList) {
        const l = Math.hypot(
            pos[3 * a] - pos[3 * b],
            pos[3 * a + 1] - pos[3 * b + 1],
            pos[3 * a + 2] - pos[3 * b + 2]
        );
        neighbors[a].push(b, l);
        neighbors[b].push(a, l);
    }

    // scene: triangles share the node positions, updated in place each frame
    const triangles = mesh.asTriangles();
    const scene = new NaiveScene();
    scene.addList(triangles);
    const nodeVec = i => Vec3(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]);
    function syncScene() {
        const vecs = new Array(n);
        for (let i = 0; i < n; i++) vecs[i] = nodeVec(i);
        for (let i = 0; i < triangles.length; i++) {
            const p = triangles[i].positions;
            for (let j = 0; j < 3; j++) p[j] = vecs[faces[i][j]];
        }
    }

    const camera = new Camera().orbit(3.4, 0, 0.12);
    const rayAt = (x, y) => camera.rayFromImage(width, height)(x, y);

    // Triangles cache edges/normals on creation, so build a fresh scene from the current pose to pick
    function pick(ray) {
        const pickScene = new NaiveScene();
        pickScene.addList(faces.map((f, i) =>
            Triangle.builder()
                .name(`${i}`)
                .positions(...f.map(nodeVec))
                .build()
        ));
        const hit = pickScene.interceptWithRay(ray);
        return hit && { face: Number(hit[2].name), point: hit[1] };
    }

    //========================================================================================
    /*                                                                                      *
     *                                    MOUSE HANDLING                                    *
     *                                                                                      */
    //========================================================================================

    let leftDown = false;
    let rightDown = false;
    let mouse = Vec2();
    let grab; // { nodes, offsets, target, normal }

    function mouseOnPlane(x, y) {
        const ray = rayAt(x, y);
        const denom = grab.normal.dot(ray.dir);
        if (Math.abs(denom) < 1e-6) return;
        const t = grab.target.sub(ray.init).dot(grab.normal) / denom;
        if (t < 0) return;
        return ray.trace(t);
    }

    canvas.onMouseDown((x, y, e) => {
        mouse = Vec2(x, y);
        if (e?.button === 0) {
            leftDown = true;
            const ray = rayAt(x, y);
            const hit = pick(ray);
            if (hit) {
                const nodes = faces[hit.face];
                grab = {
                    nodes,
                    offsets: nodes.map(i => nodeVec(i).sub(hit.point)),
                    target: hit.point,
                    normal: ray.dir,
                };
            }
        } else if (e?.button === 2) {
            rightDown = true;
        }
    });

    canvas.onMouseUp((x, y, e) => {
        if (e?.button === 0) {
            leftDown = false;
            grab = undefined;
        } else if (e?.button === 2) {
            rightDown = false;
        }
    });

    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (leftDown && grab) {
            const p = mouseOnPlane(x, y);
            if (p) grab.target = p;
        }
        if (rightDown) {
            const [dx, dy] = newMouse.sub(mouse).toArray();
            camera.orbit(c => Vec3(
                c.x,
                c.y - 2 * Math.PI * (dx / width),
                Math.min(1.45, Math.max(-1.45, c.z - 2 * Math.PI * (dy / height)))
            ));
        }
        mouse = newMouse;
    });

    canvas.onMouseWheel((e) => {
        e.preventDefault();
        camera.orbit(c => Vec3(Math.min(8, Math.max(1.4, c.x + e.deltaY * 0.001)), c.y, c.z));
    });

    //========================================================================================
    /*                                                                                      *
     *                                       PHYSICS                                        *
     *                                                                                      */
    //========================================================================================

    function integrate(i, dt) {
        const i3 = 3 * i;
        let fx = REST_STIFFNESS * (rest[i3] - pos[i3]);
        let fy = REST_STIFFNESS * (rest[i3 + 1] - pos[i3 + 1]);
        let fz = REST_STIFFNESS * (rest[i3 + 2] - pos[i3 + 2]);
        const nb = neighbors[i];
        for (let k = 0; k < nb.length; k += 2) {
            const j3 = 3 * nb[k];
            const dx = pos[j3] - pos[i3];
            const dy = pos[j3 + 1] - pos[i3 + 1];
            const dz = pos[j3 + 2] - pos[i3 + 2];
            const len = Math.hypot(dx, dy, dz);
            if (len > nb[k + 1] && len > 1e-6) {
                const s = SPRING_STIFFNESS * (len - nb[k + 1]) / len;
                fx += dx * s;
                fy += dy * s;
                fz += dz * s;
            }
        }
        if (grab) {
            const k = grab.nodes.indexOf(i);
            if (k >= 0) {
                const goal = grab.target.add(grab.offsets[k]);
                fx += GRAB_STIFFNESS * (goal.x - pos[i3]);
                fy += GRAB_STIFFNESS * (goal.y - pos[i3 + 1]);
                fz += GRAB_STIFFNESS * (goal.z - pos[i3 + 2]);
            }
        }
        fx -= FRICTION * vel[i3];
        fy -= FRICTION * vel[i3 + 1];
        fz -= FRICTION * vel[i3 + 2];
        vel[i3] += fx * dt;
        vel[i3 + 1] += fy * dt;
        vel[i3 + 2] += fz * dt;
        pos[i3] += vel[i3] * dt;
        pos[i3 + 1] += vel[i3 + 1] * dt;
        pos[i3 + 2] += vel[i3 + 2] * dt;
    }

    function updatePhysics(frameDt) {
        const steps = Math.max(1, Math.ceil(frameDt / MAX_STEP));
        const dt = frameDt / steps;
        for (let s = 0; s < steps; s++) {
            for (let i = 0; i < n; i++) integrate(i, dt);
        }
        syncScene();
    }

    loop(({ dt }) => {
        camera
            .reverseShot(scene, {
                cullBackFaces: false,
                clipCameraPlane: true,
                perspectiveCorrect: true,
                backgroundColor: Color.ofRGB(0.08, 0.08, 0.1),
            })
            .to(canvas)
            .paint();
        updatePhysics(Math.min(dt, 1 / 30));
        logger.print(Math.floor(1 / dt));
    }).play();
}
