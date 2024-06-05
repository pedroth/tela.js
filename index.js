const isGithub = window.location.host === "pedroth.github.io";
const SOURCE = isGithub ? "/tela.js" : ""
// eslint-disable-next-line no-unused-vars
const { DOM, Monads } = await import(SOURCE + "/dist/web/index.js")
const { some, none } = Monads;
//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================
function toggleFullScreen(elem) {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {  // current working methods
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
}

const MAGIC_CODE_LINE_NUMBER_OFFSET = toggleFullScreen.toString().split("\n").length + 21;

async function svg(url) {
    const data = await fetch(SOURCE + url);
    return await data.text();
}

function debounce(lambda, debounceTimeInMillis = 500) {
    let timerId;
    return function (...vars) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            lambda(...vars);
        }, debounceTimeInMillis);
        return true;
    };
}

const TelaLocalStorage = (() => {
    const namespace = "tela.js";
    return {
        getItem: key => {
            const ls = localStorage.getItem(namespace);
            return !ls ? ls : JSON.parse(ls)[key];
        },
        setItem: (key, value) => {
            const ls = JSON.parse(localStorage.getItem(namespace)) || {};
            ls[key] = value;
            localStorage.setItem(namespace, JSON.stringify(ls));
            return this;
        }
    };
})();

let modal = undefined;
// eslint-disable-next-line no-unused-vars
function modalAlert(title, message) {
    if (!modal) {
        modal = DOM.of("dialog").style("position: relative");
        document.body.appendChild(modal.build());
    }
    modal.removeChildren();
    modal.appendChild(
        DOM.of("button")
            .style("position: absolute; top: 0; right: 0; margin: 0.5rem")
            .inner(svg("/assets/x.svg"))
            .event("click", () => modal.element.close()),
        DOM.of("h2").inner(title),
        DOM.of("p").inner(message)
    )
    modal.element.showModal()
}

function printErrorInCode(errorMessage, lineNumber) {
    lineNumber = lineNumber - MAGIC_CODE_LINE_NUMBER_OFFSET;
    const decorations = AppState.editor.map(editor => {
        return editor.createDecorationsCollection([
            {
                // eslint-disable-next-line no-undef
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'monaco-line-error',
                    hoverMessage: {
                        value: errorMessage,
                        isTrusted: true
                    }
                }
            },
        ]);
    })
        .orElse({ clear: () => { } });
    return decorations;
}

//========================================================================================
/*                                                                                      *
 *                                          UI                                          *
 *                                                                                      */
//========================================================================================

const getIframeDefaultBody = () => `
<style>
    :root {
        --primary-color: rgb(52, 152, 219);
        --secondary-color: rgb(231, 76, 60);
        --tertiary-color: rgb(60, 231, 63);
        --background-color: rgb(24, 24, 24);
        --background-color-light: rgb(255, 255, 255);
        --text-color: rgba(255, 255, 255, 0.9);
        --text-color-light: rgba(24, 24, 24, 0.9);
        --fast-transition: 0.3s;
        --faster-transition: 0.1s;
    }
    
    /* GENERAL  */
    
    html {
        scroll-behavior: smooth;
        height: 100vh;
        width: 100vw;
    }
    
    body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-size: 1.25rem;
        font-weight: 400;
        overflow-x: hidden;
        font-family: Arial, Helvetica, sans-serif;
    }

    #root {
        display: flex;
        flex-direction:column;
    }

    #canvasContainer {
        margin: auto;
        display: flex;
        width: 73%;
    }

    #canvas {
        flex-grow: 1;
    }

    #logger {
        background-color: rgba(0,0,0, 0.75);
        border-radius: 0.25rem;
        max-height: 10rem;
        overflow-y: auto;
        width: 73%;
        margin: 1rem auto;
    }

    #expandButton {
        position: absolute;
        bottom: 25px;
        right: 25px;
        color: white;
    }

    #expandButton svg {
        height: 1.5rem;
        width: 1.5rem;
        cursor:pointer;
        transition: all 0.1s ease-in-out;
    }

    #expandButton svg:hover {
        transform: scale(1.5);
    }
</style>
<div id="root">
    <div id="canvasContainer">
        <div id="expandButton">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" fill="currentColor" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/></svg>
        </div>
        <canvas id="canvas"></canvas>
    </div>
    <p id="logger"></p>
</div>
`;

function execBtn() {
    return DOM
        .of("button")
        .style("margin-left: auto")
        .inner("Run code")
        .event("click", () => AppState.editor.forEach(e => execCode(e.getValue())))
}

function exampleSelector() {
    const select = DOM.of("select")
        .attr("title", "Examples")
        .appendChild(...examples.map(({ title, path }) => {
            const option = DOM.of("option")
                .attr("value", path)
                .attr("key", title)
                .inner(title)
            if (getSelectedExample() === title) option.attr("selected", "")
            return option;
        }));
    select.event("change", ({ target: selectElem }) => {
        const index = selectElem.selectedIndex;
        const examplePath = selectElem.options[index].value;
        const selectedExample = selectElem.options[index].text;
        TelaLocalStorage.setItem("selectedExample", selectedExample);
        AppState.editor.forEach(async editor => {
            const exampleTxt = await getExampleFromPath(examplePath);
            editor.setValue(exampleTxt)
            execCode(exampleTxt);

        })
    });
    return DOM.of("div")
        .appendChild(
            DOM.of("span")
                .style("margin-right: 0.5rem")
                .inner("Example:"),
            select
        )
}

function headerTools() {
    return DOM.of("div")
        .addClass("flex")
        .style("margin-bottom: 0.25rem")
        .appendChild(
            exampleSelector(),
            execBtn()
        );
}

function header() {
    return DOM.of("header")
        .appendChild(
            DOM.of("a")
                .attr("href", "https://pedroth.github.io/tela.js")
                .appendChild(
                    DOM.of("h2").inner("Tela.js playground")
                ),
        )
}

async function input() {
    const container = DOM.of("div");
    container.appendChild(headerTools())
    // eslint-disable-next-line no-undef
    require.config({ paths: { vs: './vs-monaco/package/min/vs' } });
    const editor = await new Promise((re) => {
        // eslint-disable-next-line no-undef
        require(['vs/editor/editor.main'], function () {
            // eslint-disable-next-line no-undef
            re(monaco.editor.create(container.build(), {
                value: "",
                fontSize: "16",
                theme: "vs-dark",
                lineNumbers: "on",
                insertSpaces: false,
                language: "javascript",
                automaticLayout: true,
                wordWrap: "wordWrapColumn",
            }));
        })
    });
    editor.onDidChangeModelContent(
        debounce(() => {
            const newInput = editor.getValue();
            TelaLocalStorage.setItem("input", newInput);
        })
    );
    AppState.editor = some(editor);
    return container.addClass("grow margin");
}

function output() {
    const iframe = DOM.of("iframe")
        .addClass("margin")
        .style("height:inherit;width:97%;border:none");
    AppState.outputIframe = some(iframe);
    const iframeEl = iframe.element;
    iframe.event("load", () => {
        iframeEl.contentDocument.body.innerHTML = getIframeDefaultBody();
        iframeEl.contentWindow.addEventListener("error", (e) => {
            AppState.lineDecorations = some(printErrorInCode(e.message, e.lineno));
            iframeEl.contentDocument.getElementById("root").innerHTML = `
                <p style="color: red">Error:${e.message} at line ${e.lineno - MAGIC_CODE_LINE_NUMBER_OFFSET}</p>
            `;
        })
    })
    return DOM.of("div")
        .appendChild(iframe)
        .addClass("grow margin flex");
}

/**
 * from https://github.com/phuocng/html-dom/blob/master/assets/demo/create-resizable-split-views/index.html
 */
function createDraggableResizeHandler(left, divider, right) {
    // The current position of mouse
    let x = 0;
    let leftWidth = 0;

    // Handle the mousedown event
    // that's triggered when user drags the divider
    const mouseDownHandler = function (e) {
        // Get the current mouse position
        x = e.clientX;
        leftWidth = left.getBoundingClientRect().width;

        // Attach the listeners to `document`
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - x;

        const newLeftWidth = ((leftWidth + dx) * 100) / divider.parentNode.getBoundingClientRect().width;
        left.style.width = `${newLeftWidth}%`;

        divider.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';

        left.style.userSelect = 'none';
        left.style.pointerEvents = 'none';

        right.style.userSelect = 'none';
        right.style.pointerEvents = 'none';
    };

    const mouseUpHandler = function () {
        divider.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        left.style.removeProperty('user-select');
        left.style.removeProperty('pointer-events');

        right.style.removeProperty('user-select');
        right.style.removeProperty('pointer-events');

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Attach the handler
    divider.addEventListener('mousedown', mouseDownHandler);
}

function onResize(container, input, output) {
    const style = container.build().style;
    if (window.innerWidth >= window.innerHeight) {
        style["flex-direction"] = "row";
        input.style(`width:${window.innerWidth / 2}px; height:${window.innerHeight * 0.79}px`);
        output.style(`width:${window.innerWidth / 2}px; height:${window.innerHeight * 0.79}px`);
    } else {
        style["flex-direction"] = "column";
        input.style(`width:${97}%; height:${window.innerHeight / 2}px`);
        output.style(`width:${97}%; height:${window.innerHeight / 2}px`);
    }
}

async function main() {
    const container = DOM.of("main")
        .addClass("flex spaced-items");
    const editor = (await input())
    const divider = DOM.of("div")
        .addClass("divider");
    const out = output();
    createDraggableResizeHandler(
        editor.build(),
        divider.build(),
        out.build()
    );
    onResize(
        container,
        editor,
        out
    );
    window.addEventListener(
        "resize",
        () => onResize(container, editor, out)
    );
    return container
        .appendChild(
            editor,
            divider,
            out
        )
}

function footer() {
    return DOM.of("footer")
        .appendChild(
            DOM.of("hr"),
            DOM.of("p")
                .addClass("center")
                .inner(`© ${new Date().getFullYear()} Pedroth`)
        )
}

async function renderUI() {
    return DOM.ofId("root")
        .appendChild(header())
        .appendChild(await main())
        .appendChild(footer())
        .addClass("loaded")
}

//========================================================================================
/*                                                                                      *
 *                                         MAIN                                         *
 *                                                                                      */
//========================================================================================

const examples = [
    {
        title: "Simple shader",
        path: "/test/web/simple_shader.js"
    },
    {
        title: "Flat earth shader",
        path: "/test/web/tex_shader.js"
    },
    {
        title: "Mandelbrot set shader",
        path: "/test/web/mandelbrot.js"
    },
    {
        title: "Simple animation shader",
        path: "/test/web/simple_animation.js"
    },
    {
        title: "Rotating grid shader",
        path: "/test/web/rotating_grid.js"
    },
    {
        title: "Amazing effects shader",
        path: "/test/web/amazing_shader.js"
    },
    {
        title: "Amazing effects shader 2",
        path: "/test/web/amazing_shader_2.js"
    },
    {
        title: "Parallel shader",
        path: "/test/web/parallel_shader.js"
    },
    {
        title: "Turing patterns",
        path: "/test/web/turing_pattern.js"
    },
    {
        title: "Wave equation",
        path: "/test/web/interactive_wave.js"
    },
    {
        title: "Elements",
        path: "/test/web/elements.js"
    },
    {
        title: "n points",
        path: "/test/web/n-points.js"
    },
    {
        title: "Point cloud bunny",
        path: "/test/web/bunny.js"
    },
    {
        title: "Bunny explodes",
        path: "/test/web/bunny_explode.js"
    },
    {
        title: "Wire frame spot",
        path: "/test/web/wireframe.js"
    },
    {
        title: "Earth",
        path: "/test/web/earth.js"
    },
    {
        title: "Summer forest",
        path: "/test/web/summer_forest.js"
    },
    {
        title: "SDF test",
        path: "/test/web/signed_distance.js"
    },
    {
        title: "bunny SDF test",
        path: "/test/web/signed_bunny.js"
    },
    {
        title: "Cornell box",
        path: "/test/web/cornell_box.js"
    },
    {
        title: "Glass bunny",
        path: "/test/web/glass.js"
    },
    {
        title: "spot spheres test",
        path: "/test/web/debug_normal_shot_test.js"
    },
    {
        title: "image to rgb space",
        path: "/test/web/image2rgb.js"
    },
    {
        title: "debug ray marching",
        path: "/test/web/debug_path_tracer.js"
    },
    {
        title: "debug distance to scene",
        path: "/test/web/debug_dist_func.js"
    },
    {
        title: "debug voronoi",
        path: "/test/web/debug_voronoi.js"
    }
];

const AppState = {
    editor: none(),
    lineDecorations: none(),
    outputIframe: none(),
}

function getExampleFromPath(path) {
    return fetch(SOURCE + path).then(f => f.text());
}

function execCode(code) {
    AppState
        .outputIframe
        .forEach(iframe => {
            AppState.lineDecorations.forEach(decorations => decorations.clear())
            DOM.of(iframe.element.contentDocument.body)
                .removeChildren()
                .inner(getIframeDefaultBody());
            // seems like the only way to run a script inside iframe
            const script = DOM.of("script").build();
            script.type = "module";
            script.textContent = `
            import {Path, Ray, Canvas, DOM, Color, Animation, Scene, KScene, BScene, Camera, Vec2, Vec3, Vec, Box, Point, Mesh, NaiveScene, RandomScene, VoxelScene, Line, Triangle, Diffuse, Metallic, Alpha, DiElectric, clamp} from "${SOURCE}/dist/web/index.js"
            ${toggleFullScreen.toString()}
            function requestAnimationFrame(lambda) {
                const id = window.requestAnimationFrame(lambda);
                window.globalAnimationIds.push(id);
            }
            window?.globalAnimationIds?.forEach(id => cancelAnimationFrame(id));
            window.globalAnimationIds = [];
            const canvasDOM = document.getElementsByTagName("canvas")[0];
            const canvas = Canvas.ofDOM(canvasDOM);
            document.getElementById("expandButton").addEventListener('click', () => {
                toggleFullScreen(canvasDOM);
            });
            const logger = {
                print: (message) => {
                    document.getElementById("logger").innerText = message;
                }, 
                log: (message) => {
                    document.getElementById("logger").innerText +=  \`\${message}\\n\`;
                }
            };
            (${code.replaceAll("/assets/", SOURCE + "/assets/")})(canvas, logger)
            `;
            iframe.element.contentDocument.body.appendChild(script);
        })
}

function getSelectedExample() {
    return TelaLocalStorage.getItem("selectedExample") || "Simple shader";
}

(async () => {
    await renderUI()
    AppState.editor.forEach(async editor => {
        const examplePath = examples.filter(({ title }) => getSelectedExample() === title)[0].path;
        const exampleTxt = TelaLocalStorage.getItem("input") || await getExampleFromPath(examplePath);
        editor.setValue(exampleTxt);
        setTimeout(() => execCode(exampleTxt), 100); // needs this for some unknown reason
    });
})()