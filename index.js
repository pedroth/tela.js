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

function codeErrorAlert(message) {
    AppState.errorBoundary.forEach(errorBoundary => {
        errorBoundary.inner(message);
    })
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
            AppState.errorBoundary.forEach(errorBoundary => errorBoundary.inner(""));
            const newInput = editor.getValue();
            TelaLocalStorage.setItem("input", newInput);
            execCode(newInput);
        })
    );
    AppState.editor = some(editor);

    const errorBoundary = DOM.of("p").style("color: red;font-size:medium;margin: auto 1rem; position: relative; bottom: 2rem");
    container.appendChild(errorBoundary);
    AppState.errorBoundary = some(errorBoundary);
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            errorBoundary.element.style.width = entry.contentRect.width + "px";
        }
    });
    resizeObserver.observe(container.build());
    return container;
}

function output() {
    const canvasDOM = DOM.of("canvas")
        .attr(`width`, 640)
        .attr(`height`, 480)
        .style("margin: auto; width: 71%")
        .event("click", () => {
            toggleFullScreen(canvasDOM.build());
        })
    const log = DOM.of("pre")
        .style("background-color: rgba(0,0,0, 0.75); border-radius: 0.25rem;")
        .addClass("y-overflow grow")
    AppState.logger = some(createLogger(log));
    AppState.canvas = some(canvasDOM);
    return DOM.of("div")
        .addClass("flex column y-overflow")
        .appendChild(
            DOM.of("div")
                .addClass("grow center flex")
                .appendChild(canvasDOM),
            log
        )
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
        .addClass("grow margin");
    const divider = DOM.of("div")
        .addClass("divider");
    const out = output()
        .addClass("grow margin");

    createDraggableResizeHandler(editor.build(), divider.build(), out.build());
    onResize(container, editor, out);
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
    logger: none(),
    canvas: none(),
    errorBoundary: none()
}

function getExampleFromPath(path) {
    return fetch(SOURCE + path).then(f => f.text());
}

function execCode(code) {
    try {
        AppState.canvas.forEach(
            canvas =>
                AppState.logger.forEach(logger => {
                    eval(code)(Canvas.ofDOM(canvas.build()), logger);
                })
        )
    } catch (e) {
        codeErrorAlert(`Caught exception while running playground: ${e.message}`);
    }
}

function getSelectedExample() {
    return TelaLocalStorage.getItem("selectedExample") || "Simple shader";
}

function createLogger(logDOM) {
    return {
        log: message => {
            let log = logDOM.element.innerText;
            log = [log, message].join("\n");
            logDOM.inner(log);
        },
        print: (message) => {
            logDOM.inner(message);
        }
    }
}

(async () => {
    await renderUI()
    AppState.editor.forEach(async editor => {
        const examplePath = examples.filter(({ title }) => getSelectedExample() === title)[0].path;
        const exampleTxt = TelaLocalStorage.getItem("input") || await getExampleFromPath(examplePath);
        editor.setValue(exampleTxt)
    });
})()