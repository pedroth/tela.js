import { Color, Vec2, Window, cBezier, parseSVG, parseSvgPath, qBezier } from "../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const window = new Window(width, height).onResizeWindow(() => window.paint());
const svgNode = parseSVG(readFileSync("./assets/share.svg", { encoding: "utf-8" }));

function addFirstPointIfNeeded(currentPos, paths, debugPaths) {
    if (debugPaths.length === 0) {
        paths.push(currentPos);
        debugPaths.push(currentPos);
    }
}

function readSVGNode(node) {
    let viewBox = {};
    let paths = [];
    let debugPaths = [];
    const nodeStack = [node];
    
    while (nodeStack.length > 0) {
        const currentNode = nodeStack.pop();
        const tag = currentNode?.StartTag?.tag ?? currentNode?.EmptyTag?.tag;
        if (tag === "svg") {
            const vb = currentNode.StartTag.Attrs.attributes.filter(x => x.attributeName === "viewBox")[0].attributeValue;
            const [x, y, w, h] = vb.split(" ").map(x => Number.parseFloat(x));
            viewBox.min = Vec2(x, y);
            viewBox.max = Vec2(x + w, y + h);
        }
        if (tag === "path") {
            const samples = 100;
            let currentPos = Vec2();
            const [path] = currentNode.EmptyTag.Attrs.attributes.filter(a => a.attributeName === "d");
            
            const letter2action = {
                "M": (vecs) => {
                    const [p] = vecs;
                    currentPos = p;
                },
                "m": (vecs) => {
                    const [p] = vecs;
                    currentPos = currentPos.add(p);
                },
                "L": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 1) {
                        paths.push(vecs[j]);
                        currentPos = paths.at(-1);
                    }
                },
                "l": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 1) {
                        paths.push(currentPos.add(vecs[j]));
                        currentPos = paths.at(-1);
                    }
                },
                "Q": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 2) {
                        const qb = qBezier(currentPos, vecs[j], vecs[j + 1]);
                        for (let i = 0; i < samples; i++) {
                            paths.push(qb(i / (samples - 1)));
                        }
                        debugPaths.push(currentPos, vecs[j], vecs[j + 1]);
                        currentPos = paths.at(-1);
                    }
                },
                "q": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 2) {
                        const qb = qBezier(currentPos, currentPos.add(vecs[j]), currentPos.add(vecs[j + 1]));
                        for (let i = 0; i < samples; i++) {
                            paths.push(qb(i / (samples - 1)));
                        }
                        debugPaths.push(currentPos, currentPos.add(vecs[j]), currentPos.add(vecs[j + 1]));
                        currentPos = paths.at(-1);
                    }
                },
                "T": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    const [end] = vecs;
                    const control = currentPos.scale(2).sub(debugPaths.at(-2)); // reflection bla bla
                    const qb = qBezier(currentPos, control, end);
                    for (let i = 0; i < samples; i++) {
                        paths.push(qb(i / (samples - 1)));
                    }
                    debugPaths.push(
                        currentPos,
                        control,
                        end
                    )
                    currentPos = paths.at(-1);
                },
                "t": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    const [end] = vecs;
                    const control = currentPos.scale(2).sub(debugPaths.at(-2)); // reflection bla bla
                    const qb = qBezier(currentPos, control, currentPos.add(end));
                    for (let i = 0; i < samples; i++) {
                        paths.push(qb(i / (samples - 1)));
                    }
                    debugPaths.push(
                        currentPos,
                        control,
                        currentPos.add(end)
                    )
                    currentPos = paths.at(-1);
                },
                "C": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 3) {
                        const cb = cBezier(
                            currentPos,
                            vecs[j],
                            vecs[j + 1],
                            vecs[j + 2]
                        );
                        for (let i = 0; i < samples; i++) {
                            paths.push(cb(i / (samples - 1)));
                        }
                        debugPaths.push(
                            currentPos,
                            vecs[j],
                            vecs[j + 1],
                            vecs[j + 2]
                        )
                        currentPos = paths.at(-1);
                    }
                },
                "c": (vecs) => {
                    addFirstPointIfNeeded(currentPos, paths, debugPaths);
                    for (let j = 0; j < vecs.length; j += 3) {
                        const cb = cBezier(
                            currentPos,
                            currentPos.add(vecs[j]),
                            currentPos.add(vecs[j + 1]),
                            currentPos.add(vecs[j + 2])
                        );
                        for (let i = 0; i < samples; i++) {
                            paths.push(cb(i / (samples - 1)));
                        }
                        debugPaths.push(
                            currentPos,
                            currentPos.add(vecs[j]),
                            currentPos.add(vecs[j + 1]),
                            currentPos.add(vecs[j + 2])
                        )
                        currentPos = paths.at(-1);
                    }
                },
                "Z": () => {
                    paths.push(debugPaths[0]);
                    debugPaths.push(debugPaths[0]);
                },
                "z": () => {
                    paths.push(debugPaths[0]);
                    debugPaths.push(debugPaths[0]);
                }

            }
            const { actions } = parseSvgPath(path.attributeValue);
            const vectorizedActions = actions
                .map(({ letter, numbers }) => {
                    const vectors = [];
                    for (let i = 0; i < numbers.length; i += 2) {
                        vectors.push(Vec2(numbers[i], numbers[i + 1]));
                    }
                    return { letter, vectors };
                })
            console.log("$$$", vectorizedActions.map(({ letter, vectors }) => letter + " " + vectors.map(v => v.toString()).join("")));
            vectorizedActions
                .forEach(({ letter, vectors }) => {
                    return (letter2action?.[letter] ?? (() => { }))(vectors)
                });
        }
        nodeStack.push(...(currentNode?.InnerSVG?.innerSvgs?.map(x => x.SVG) ?? []));
    }
    return [viewBox, paths, debugPaths];
}

function drawSVGData(viewBox, path, debugPath, tela) {
    const coordTransform = (x) => {
        const { min, max } = viewBox;
        const diagonal = max.sub(min);
        let p = x.sub(min).div(diagonal);
        p = Vec2(p.x, -p.y).add(Vec2(0, 1))
        p = p.mul(Vec2(width, height)).map(Math.floor);
        return p;
    }
    let transformedPath = path.map(coordTransform);
    for (let i = 0; i < path.length - 1; i++) {
        tela.drawLine(transformedPath[i], transformedPath[i + 1], () => Color.RED);
    }
    transformedPath = debugPath.map(coordTransform);
    // for (let i = 0; i < debugPath.length - 1; i++) {
    //     tela.drawLine(transformedPath[i], transformedPath[i + 1], () => Color.BLUE);
    // }
    tela.paint();
    return;
}

drawSVGData(...readSVGNode(svgNode), window);