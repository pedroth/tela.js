// ported from https://www.khanacademy.org/computer-programming/area-maximization-with-length-constraint/5707682901393408
async (canvas, logger) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p>Left mouse button: drag curve</p>
    `;
    document.body.appendChild(div);
    canvas.DOM.addEventListener("contextmenu", (e) => e.preventDefault());

    const width = 640;
    const height = 640;
    canvas.resize(width, height);

    const scene = new NaiveScene();
    
    // Original coordinate limits for camera
    const camera = new Camera2D(new Box(Vec2(-1, -1), Vec2(1, 1)));

    // Simulation params
    const kSamples = 10;
    const curveSamples = 50;
    const variance = 26 * Math.PI;
    const curveLength = 4;
    const closed = true;
    const initP = Vec2(-0.1, -0.5);

    let curvature = [];
    let myCurve = [];
    let theta = [];
    
    // Using Vector API
    let mousePos = Vec2();
    let mouseOn = 0;

    //========================================================================================
    /*                                                                                      *
     *                                      MATH HELPERS                                    *
     *                                                                                      */
    //========================================================================================

    const baseFunc = (x) => Math.max(Math.min(1 - x, x + 1), 0);

    const signalInter = (s, a, b, x) => {
        const size = s.length;
        if (x < a || x > b) {
            return 0;
        } else if (x === b) {
            return s[size - 1];
        } else if (x === a) {
            return s[0];
        } else {
            const n = ((x - a) / (b - a)) * (size - 1);
            const i = Math.floor(n);
            return s[i] * baseFunc(n - i) + s[i + 1] * baseFunc(n - i - 1);
        }
    };

    const signalIntegrate = (s, a, b) => {
        const n = s.length;
        const h = (b - a) / (n - 1);
        let acm = 0;
        for (let i = 0; i < n - 1; i++) {
            acm += s[i] + s[i + 1];
        }
        return 0.5 * h * acm;
    };

    //========================================================================================
    /*                                                                                      *
     *                                     INITIALIZATION                                   *
     *                                                                                      */
    //========================================================================================

    function initCurve() {
        for (let i = 0; i < kSamples; i++) {
            curvature[i] = variance * (Math.random() * 2 - 1);
        }

        if (closed) {
            const epsilon = 1E-9;
            const alfa = 0.50;
            const iter = 10;
            let area = (2 * Math.PI - signalIntegrate(curvature, 0, 1));
            for (let i = 0; i < iter || Math.abs(area - 2 * Math.PI) < epsilon; i++) {
                for (let j = 0; j < curvature.length; j++) {
                    curvature[j] += alfa * area;
                }
                area = (2 * Math.PI - signalIntegrate(curvature, 0, 1));
            }
        }

        myCurve[0] = initP.clone();
        theta[0] = 0;
        const delta = 1 / (curveSamples - 1);

        for (let i = 0; i < curveSamples - 1; i++) {
            const x = delta * i;
            theta[i + 1] = theta[i] + 0.5 * delta * (signalInter(curvature, 0, 1, x) + signalInter(curvature, 0, 1, x + delta));
            
            // Build next coordinate
            const er = Vec2(Math.cos(theta[i]), Math.sin(theta[i]));
            myCurve[i + 1] = myCurve[i].add(er.scale(curveLength * delta));
        }

        if (closed) {
            const v = myCurve[0].sub(myCurve[curveSamples - 1]);
            for (let i = 0; i < curveSamples; i++) {
                myCurve[i] = myCurve[i].add(v.scale(i / (curveSamples - 1)));
            }
        }
    }

    initCurve();

    //========================================================================================
    /*                                                                                      *
     *                                    MOUSE HANDLING                                    *
     *                                                                                      */
    //========================================================================================
    
    let mousedown = false;
    canvas.onMouseDown((x, y, e) => {
        mousedown = e?.buttons === 1;
        if (mousedown) {
            mouseOn = 1;
            mousePos = camera.toWorldCoord(Vec2(x, y), canvas);
        }
    });

    canvas.onMouseMove((x, y) => {
        if (mousedown) {
            mousePos = camera.toWorldCoord(Vec2(x, y), canvas);
        }
    });

    canvas.onMouseUp(() => {
        mousedown = false;
        mouseOn = 0;
    });

    //========================================================================================
    /*                                                                                      *
     *                                     PDE SOLVER LOGIC                                 *
     *                                                                                      */
    //========================================================================================

    const df = (x) => {
        const delta = 1 / (myCurve.length - 1);
        const n = myCurve.length - 1;
        if (closed) {
            const fForward = myCurve[(x + 1) % n];
            const fBack = myCurve[Math.max(x - 1 + n, x - 1) % n];
            return fForward.sub(fBack).scale(0.5 / delta);
        } else {
            const xh = Math.min(x + 1, myCurve.length - 1);
            const xmh = Math.max(0, x - 1);
            return myCurve[xh].sub(myCurve[xmh]).scale(0.5 / delta);
        }
    };

    const d2f = (x) => {
        const delta = 1 / (myCurve.length - 1);
        const n = myCurve.length - 1;
        if (closed) {
            const fForward = myCurve[(x + 1) % n];
            const fBack = myCurve[Math.max(x - 1 + n, x - 1) % n];
            const f = myCurve[x];
            return fForward.sub(f.scale(2)).add(fBack).scale(0.5 / delta);
        } else {
            const xh = Math.min(x + 1, myCurve.length - 1);
            const xmh = Math.max(0, x - 1);
            return myCurve[xh].sub(myCurve[x].scale(2)).add(myCurve[xmh]).scale(0.5 / delta);
        }
    };

    const pde = (x) => {
        let v = mousePos.sub(myCurve[x]);
        const dist = v.squareLength();
        v = v.scale(1 / (1e-9 + dist));
        
        const u = df(x);
        const uRotated = Vec2(u.y, -u.x); // orthogonal vector
        
        return v.scale(-mouseOn).add(uRotated);
    };

    const dotConstraint = () => {
        const n = myCurve.length;
        const h = 1 / (n - 1);
        let acmDot = Vec2();
        let acmNorm = Vec2();
        
        for (let i = 0; i < n - 1; i++) {
            const aux1 = d2f(i).scale(-1);
            const aux2 = d2f(i + 1).scale(-1);
            
            // `pointWise` corresponds to `.mul()` in Vector2 API
            acmDot = acmDot.add(pde(i).mul(aux1)).add(pde(i + 1).mul(aux2));
            acmNorm = acmNorm.add(aux1.mul(aux1)).add(aux2.mul(aux2));
        }

        acmDot = acmDot.scale(0.5 * h);
        acmNorm = acmNorm.scale(0.5 * h);
        
        // Ensure we avoid div-by-zero using an epsilon fallback vector
        const safeNorm = Vec2(acmNorm.x || 1e-9, acmNorm.y || 1e-9);
        return acmDot.div(safeNorm);
    };

    const updateScene = (dt) => {
        scene.clear();
        
        if (dt <= 0) return;
        
        const du = [];
        const constraint = dotConstraint();

        // Calculate updates and populate vector field visualizers
        for (let i = 0; i < myCurve.length; i++) {
            const pdeVal = pde(i);
            
            // pdeVal + constraint * d2f(i) (element-wise multiplication)
            du[i] = pdeVal.add(constraint.mul(d2f(i)));

            // Draw vector field pushing on the curve
            const u = myCurve[i].add(du[i].scale(0.25));
            scene.add(Line.builder()
                .name(`vf_${i}`)
                .positions(myCurve[i], u)
                .colors(Color.RED, Color.RED)
                .build());
        }

        // Apply velocity to positions
        for (let i = 0; i < myCurve.length; i++) {
            myCurve[i] = myCurve[i].add(du[i].scale(dt));
        }

        // Render standard curve outlines
        for (let i = 0; i < curveSamples - 1; i++) {
            scene.add(Line.builder()
                .name(`curve_${i}`)
                .positions(myCurve[i], myCurve[i + 1])
                .colors(Color.BLUE, Color.BLUE)
                .build());
        }

        // Render active mouse tether line
        if (mouseOn === 1) {
            scene.add(Line.builder()
                .name("mouse_tether")
                .positions(myCurve[0], mousePos)
                .colors(Color.RED, Color.RED)
                .build());
        }
    };

    //========================================================================================
    /*                                                                                      *
     *                                         MAIN                                         *
     *                                                                                      */
    //========================================================================================

    loop(async ({ dt }) => {
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
        
        // Cap dt to prevent integration explosions if the frame hangs
        const safeDt = Math.min(dt, 0.1);
        updateScene(0.05 * safeDt);

        // Draw with the original style background
        const bgColor = Color.ofRGB(1, 238 / 255, 0); 
        canvas.fill(bgColor);
        camera.raster(scene).to(canvas).paint();
    }).play();
}