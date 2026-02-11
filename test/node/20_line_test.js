import { Vec2, Window, loop, Box, Camera2D, NaiveScene, Line, Color } from "../../src/index.node.js";

//========================================================================================
/*                                                                                      *
 *                                       SETUP                                          *
 *                                                                                      */
//========================================================================================

const WIDTH = 640;
const HEIGHT = 640;

const window = new Window(WIDTH, HEIGHT).onResizeWindow(() => window.paint());
const camera = new Camera2D(new Box(Vec2(0), Vec2(1, 1)));

// Main scene holds completed lines
const scene = new NaiveScene();
// Draft scene holds the line currently being drawn
const draftScene = new NaiveScene();

//========================================================================================
/*                                                                                      *
 *                                    MOUSE STATE                                       *
 *                                                                                      */
//========================================================================================

let isDrawing = false;
let currentMousePos = Vec2();
let lineStartPos = Vec2();

//========================================================================================
/*                                                                                      *
 *                                   EVENT HANDLERS                                     *
 *                                                                                      */
//========================================================================================

function handleMouseDown(x, y, event) {
    const isMiddleClick = event?.button === 1;
    isDrawing = isMiddleClick;
    lineStartPos = camera.toWorldCoord(Vec2(x, y), window);
    currentMousePos = lineStartPos;
}

function handleMouseUp(x, y) {
    if (isDrawing) {
        const lineEndPos = camera.toWorldCoord(Vec2(x, y), window);
        const newLine = Line.builder()
            .name(`line-${Math.random()}`)
            .positions(lineStartPos, lineEndPos)
            .colors(Color.random(), Color.random())
            .build();
        
        scene.add(newLine);
        draftScene.clear();
    }
    
    isDrawing = false;
    currentMousePos = Vec2();
}

function handleMouseMove(x, y) {
    const newMousePos = camera.toWorldCoord(Vec2(x, y), window);
    
    if (!isDrawing || newMousePos.equals(currentMousePos)) {
        currentMousePos = newMousePos;
        return;
    }
    
    // Update draft line preview
    const previewLine = Line.builder()
        .name(`preview-${Math.random()}`)
        .positions(lineStartPos, newMousePos)
        .colors(Color.CYAN, Color.CYAN)
        .build();
    
    draftScene.clear();
    draftScene.add(previewLine);
    currentMousePos = newMousePos;
}

function handleKeyDown(event) {
    if (event.key === "r") {
        scene.clear();
        draftScene.clear();
    }
}

// Register event handlers
window.onMouseDown(handleMouseDown);
window.onMouseUp(handleMouseUp);
window.onMouseMove(handleMouseMove);
window.onKeyDown(handleKeyDown);

//========================================================================================
/*                                                                                      *
 *                                      MAIN LOOP                                       *
 *                                                                                      */
//========================================================================================

function render(dt) {
    window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    window.fill(Color.BLACK);
    
    camera.raster(draftScene).to(window);
    camera.raster(scene).to(window).paint();
}

loop(async ({ dt }) => render(dt)).play();



