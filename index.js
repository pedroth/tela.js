const isGithub = window.location.host === "pedroth.github.io";
const SOURCE = isGithub ? "/tela.js" : ""
// eslint-disable-next-line no-unused-vars
const { DOM, Canvas, Animator, Color } = await import(SOURCE + "/dist/web/index.js")
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

const MAGIC_CODE_LINE_NUMBER_OFFSET = toggleFullScreen.toString().split("\n").length + 10;

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

export function some(x) {
    return {
        map: f => maybe(f(x)),
        orElse: () => x,
        forEach: (f) => f(x),
        flatMap: f => f(x)
    }
}

export function none() {
    return {
        map: () => none(),
        orElse: f => f(),
        forEach: () => { },
        flatMap: () => none()
    }
}

export function maybe(x) {
    if (x) {
        return some(x);
    }
    return none(x)
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
        width: 89%;
    }

    #canvas {
        flex-grow: 1;
    }

    #logger {
        background-color: rgba(0,0,0, 0.75);
        border-radius: 0.25rem;
        max-height: 10rem;
        overflow-y: auto;
    }
</style>
<div id="root">
    <div id="canvasContainer">
        <canvas id="canvas"></canvas>
    </div>
    <p id="logger"></p>
</div>
`;

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
        })
    });
    return DOM.of("div")
        .addClass("margin flex")
        .appendChild(
            DOM.of("span")
                .inner("Example:"),
            select
        )
}

function headerTools() {
    return DOM.of("div")
        .appendChild(
            exampleSelector(),
        );
}

function header() {
    return DOM.of("header")
        .appendChild(
            DOM.of("h2").inner("Tela.js playground"),
            headerTools()
        )
}

async function input() {
    const container = DOM.of("div");
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
            execCode(newInput);
        })
    );
    AppState.editor = some(editor);
    return container.addClass("grow margin");
}

function output() {
    const iframe = DOM.of("iframe")
        .addClass("margin")
        .style("height:inherit;width:89%;border:none;");
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
                .inner("© 2023 Pedroth")
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
        path: "/test/test0.js"
    },
    {
        title: "Simple animation shader",
        path: "/test/test1.js"
    },
    {
        title: "Rotating grid shader",
        path: "/test/test2.js"
    },
    {
        title: "Amazing effects shader",
        path: "/test/test3.js"
    },
    {
        title: "Wave simulation",
        path: "/test/test4.js"
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
            import {Canvas, DOM, Color, Animator} from "/dist/web/index.js"
            Animator.globalAnimationIds.forEach(id => {
                window.cancelAnimationFrame(id)
            });
            ${toggleFullScreen.toString()}
            const canvasDOM = document.getElementsByTagName("canvas")[0];
            const canvas = Canvas.ofDOM(canvasDOM);
            canvasDOM.addEventListener('click', () => {
                toggleFullScreen(canvasDOM);
            });
            (${code})(
                canvas, 
                {
                    print: (message) => {
                        document.getElementById("logger").innerText = message
                    }, 
                    log: (message) => {
                        document.getElementById("logger").innerText +=  \`\${message}\\n\`
                    }
                }
            )
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
        editor.setValue(exampleTxt)
    });
})()