/* eslint-disable no-undef */
async (canvas, logger) => {
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);
    canvas.DOM.focus();

    let exposedCanvas = canvas.exposure();
    const scene = new NaiveScene();
    const camera = new Camera({ lookAt: Vec3(0, 0, 1.2) });
    const atlas = await Canvas.ofUrl("/assets/stickman_sprite.png?v=2");

    const frameColumns = [
        [82, 202],
        [214, 333],
        [350, 467],
        [483, 598],
        [614, 730],
        [749, 865],
        [875, 999],
        [1017, 1140],
        [1156, 1272],
        [1287, 1400],
    ];
    const animationRows = [
        [72, 235],
        [292, 469],
        [524, 720],
    ];

    const stickman = {
        position: Vec3(0, 0, 0),
        velocity: Vec3(0, 0, 0),
        facingRight: true,
        onGround: true,
        animationState: "idle",
        animationTime: 0,
        idleFrameTime: 0,
        moveFrameTime: 0,
        jumpFrameTime: 0,
    };

    const keysDown = new Set();
    const moveSpeed = 2.2;
    const sprintSpeed = 4.0;
    const jumpSpeed = 6.2;
    const gravity = 16.0;
    const bodyWidth = 1.2;
    const bodyHeight = 2.4;
    const bodyCenterOffset = Vec3(0, 0, bodyHeight / 2);
    const lightDir = Vec3(-0.4, -0.35, 0.85).normalize();
    const lightSharpness = 48;
    let renderMode = "raytrace";
    const cameraOrbit = {
        distance: 6.0,
        yaw: Math.PI * 0.75,
        pitch: 0.45,
    };
    let shouldResetExposure = true;
    let isMouseDown = false;
    let lastMouse = Vec2();

    const ground = [];
    const groundMin = -18;
    const groundMax = 18;
    const groundTiles = 12;
    const groundStep = (groundMax - groundMin) / groundTiles;
    for (let gx = 0; gx < groundTiles; gx++) {
        for (let gy = 0; gy < groundTiles; gy++) {
            const x0 = groundMin + gx * groundStep;
            const x1 = x0 + groundStep;
            const y0 = groundMin + gy * groundStep;
            const y1 = y0 + groundStep;
            const tint = 0.02 * ((gx + gy) % 2 === 0 ? 1 : -1);
            const colorA = Color.ofRGB(0.2 + tint, 0.28 + tint, 0.2 + tint);
            const colorB = Color.ofRGB(0.22 + tint, 0.3 + tint, 0.22 + tint);
            ground.push(
                Triangle
                    .builder()
                    .name(`ground-${gx}-${gy}-1`)
                    .colors(colorA, colorB, colorA)
                    .positions(Vec3(x0, y0, 0), Vec3(x1, y0, 0), Vec3(x1, y1, 0))
                    .build(),
                Triangle
                    .builder()
                    .name(`ground-${gx}-${gy}-2`)
                    .colors(colorB, colorA, colorB)
                    .positions(Vec3(x1, y1, 0), Vec3(x0, y1, 0), Vec3(x0, y0, 0))
                    .build(),
            );
        }
    }

    let stickmanTriangleA = Triangle
        .builder()
        .name("stickman-triangle-a")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .texture(atlas)
        .build();
    let stickmanTriangleB = Triangle
        .builder()
        .name("stickman-triangle-b")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .texture(atlas)
        .build();

    scene.add(...ground, stickmanTriangleA, stickmanTriangleB);

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function frameToUV(rowIndex, frameIndex, flipX = false) {
        const [x0, x1] = frameColumns[frameIndex];
        const [y0, y1] = animationRows[rowIndex];
        const inset = 4;
        const left = (x0 + inset) / atlas.width;
        const right = (x1 - inset) / atlas.width;
        const bottom = (atlas.height - (y1 - inset)) / atlas.height;
        const top = (atlas.height - (y0 + inset)) / atlas.height;
        if (flipX) {
            return { u0: right, u1: left, v0: bottom, v1: top };
        }
        return { u0: left, u1: right, v0: bottom, v1: top };
    }

    function applyFrame(rowIndex, frameIndex, flipX = false) {
        const { u0, u1, v0, v1 } = frameToUV(rowIndex, frameIndex, flipX);
        const triangleATexCoords = [
            Vec2(u0, v0),
            Vec2(u1, v0),
            Vec2(u1, v1),
        ];
        const triangleBTexCoords = [
            Vec2(u1, v1),
            Vec2(u0, v1),
            Vec2(u0, v0),
        ];
        return [triangleATexCoords, triangleBTexCoords];
    }

    function getCameraGroundAxes() {
        const forward = Vec3(-Math.cos(cameraOrbit.yaw), -Math.sin(cameraOrbit.yaw), 0);
        const right = Vec3(-Math.sin(cameraOrbit.yaw), Math.cos(cameraOrbit.yaw), 0);
        return {
            forward: forward.normalize(),
            right: right.normalize(),
        };
    }

    function updateThirdPersonCamera(stickmanCenter) {
        camera.lookAt = stickmanCenter;
        camera.orbit(cameraOrbit.distance, cameraOrbit.yaw, cameraOrbit.pitch);
    }

    function renderRaster() {
        camera
            .reverseShot(scene, {
                cullBackFaces: false,
                bilinearTexture: false,
                clipCameraPlane: true,
                perspectiveCorrect: true,
                backgroundColor: Color.ofRGB(0.72, 0.86, 0.98),
            })
            .to(canvas)
            .paint();
    }

    async function renderRaytrace() {
        if (shouldResetExposure) {
            exposedCanvas = canvas.exposure();
            shouldResetExposure = false;
        }
        const image = await camera
            .parallelShot(scene, {
                bounces: 10,
                gamma: 0.5,
                isBiased: false,
                useCache: false,
                useMetro: true,
                skyBoxPath: "/assets/sky.jpg",
                lightDir,
                lightSharpness,
            })
            .to(exposedCanvas);
        image.paint();
    }

    function updateStickman(dt) {
        const isSprint = keysDown.has("ShiftLeft") || keysDown.has("ShiftRight");
        const moveX = (keysDown.has("KeyD") ? 1 : 0) - (keysDown.has("KeyA") ? 1 : 0);
        const moveY = (keysDown.has("KeyW") ? 1 : 0) - (keysDown.has("KeyS") ? 1 : 0);
        const moving = moveX !== 0 || moveY !== 0;
        const speed = isSprint ? sprintSpeed : moveSpeed;

        if (moving) {
            const { forward, right } = getCameraGroundAxes();
            const moveDir = right.scale(moveX).add(forward.scale(moveY)).normalize();
            stickman.velocity = Vec3(moveDir.x * speed, moveDir.y * speed, stickman.velocity.z);
            if (Math.abs(moveDir.dot(right)) > 1e-6) {
                stickman.facingRight = moveDir.dot(right) >= 0;
            }
        } else {
            stickman.velocity = Vec3(0, 0, stickman.velocity.z);
        }

        stickman.velocity = Vec3(
            stickman.velocity.x,
            stickman.velocity.y,
            stickman.velocity.z - gravity * dt
        );

        stickman.position = stickman.position.add(stickman.velocity.scale(dt));
        if (stickman.position.z <= 0) {
            stickman.position = Vec3(stickman.position.x, stickman.position.y, 0);
            stickman.velocity = Vec3(stickman.velocity.x, stickman.velocity.y, 0);
            stickman.onGround = true;
            stickman.jumpFrameTime = 0;
        } else {
            stickman.onGround = false;
        }

        const nextState = stickman.onGround ? (moving ? "move" : "idle") : "jump";
        if (nextState !== stickman.animationState) {
            stickman.animationState = nextState;
            stickman.animationTime = 0;
        }
        stickman.animationTime += dt;

        let rowIndex = 0;
        let frameIndex = 0;
        const flipX = !stickman.facingRight;

        if (stickman.animationState === "move") {
            rowIndex = 1;
            stickman.moveFrameTime += dt * (isSprint ? 1.5 : 1);
            frameIndex = Math.floor(stickman.moveFrameTime * (isSprint ? 14 : 10)) % 10;
        } else if (stickman.animationState === "jump") {
            rowIndex = 2;
            stickman.jumpFrameTime += dt;
            frameIndex = clamp(Math.floor(stickman.jumpFrameTime * 14), 0, 9);
        } else {
            rowIndex = 0;
            stickman.idleFrameTime += dt;
            frameIndex = Math.floor(stickman.idleFrameTime * 6) % 10;
        }

        const [triangleATexCoords, triangleBTexCoords] = applyFrame(rowIndex, frameIndex, flipX);

        const stickmanCenter = stickman.position.add(bodyCenterOffset);
        const previousCameraPosition = camera.position;
        updateThirdPersonCamera(stickmanCenter);
        if (camera.position.sub(previousCameraPosition).length() > 1e-6) {
            shouldResetExposure = true;
        }

        const right = camera.basis[0].scale(bodyWidth / 2);
        const up = camera.basis[1].scale(bodyHeight / 2);
        const bottomLeft = stickmanCenter.sub(right).sub(up);
        const bottomRight = stickmanCenter.add(right).sub(up);
        const topRight = stickmanCenter.add(right).add(up);
        const topLeft = stickmanCenter.sub(right).add(up);

        stickmanTriangleA = Triangle
            .builder()
            .name("stickman-triangle-a")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(bottomLeft, bottomRight, topRight)
            .texCoords(...triangleATexCoords)
            .texture(atlas)
            .build();
        stickmanTriangleB = Triangle
            .builder()
            .name("stickman-triangle-b")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(topRight, topLeft, bottomLeft)
            .texCoords(...triangleBTexCoords)
            .texture(atlas)
            .build();
        scene.sceneElements[2] = stickmanTriangleA;
        scene.sceneElements[3] = stickmanTriangleB;
        scene.id2ElemMap[stickmanTriangleA.name] = stickmanTriangleA;
        scene.id2ElemMap[stickmanTriangleB.name] = stickmanTriangleB;
    }

    canvas.onMouseDown((x, y) => {
        isMouseDown = true;
        lastMouse = Vec2(x, y);
        canvas.DOM.focus();
    });

    canvas.onMouseUp(() => {
        isMouseDown = false;
        lastMouse = Vec2();
    });

    canvas.onMouseMove((x, y) => {
        const mouse = Vec2(x, y);
        if (!isMouseDown || mouse.equals(lastMouse)) {
            lastMouse = mouse;
            return;
        }
        const delta = mouse.sub(lastMouse);
        cameraOrbit.yaw -= 2 * Math.PI * (delta.x / canvas.width);
        cameraOrbit.pitch = clamp(
            cameraOrbit.pitch - 2 * Math.PI * (delta.y / canvas.height),
            -0.15,
            Math.PI / 2.5
        );
        shouldResetExposure = true;
        lastMouse = mouse;
    });

    canvas.onMouseWheel(({ deltaY }) => {
        cameraOrbit.distance = clamp(cameraOrbit.distance + deltaY * 0.01, 3.0, 10.0);
        shouldResetExposure = true;
    });

    updateThirdPersonCamera(stickman.position.add(bodyCenterOffset));

    canvas.onKeyDown((e) => {
        keysDown.add(e.code);
        if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ShiftRight", "KeyR"].includes(e.code)) {
            e.preventDefault();
        }
        if (e.code === "KeyR") {
            renderMode = renderMode === "raytrace" ? "raster" : "raytrace";
            shouldResetExposure = true;
            return;
        }
        shouldResetExposure = true;
        if (e.code === "Space" && stickman.onGround) {
            stickman.velocity = Vec3(stickman.velocity.x, stickman.velocity.y, jumpSpeed);
            stickman.onGround = false;
            stickman.jumpFrameTime = 0;
            stickman.animationState = "jump";
            stickman.animationTime = 0;
        }
    });

    canvas.onKeyUp((e) => {
        keysDown.delete(e.code);
        shouldResetExposure = true;
    });

    loop(async ({ dt }) => {
        updateStickman(clamp(dt, 0, 1 / 24));
        if (renderMode === "raster") {
            renderRaster();
        } else {
            await renderRaytrace();
        }
        logger.print(`FPS: ${(1 / dt).toFixed(2)} | frame: ${stickman.animationState} | mode: ${renderMode}`);
    }).play();
}
