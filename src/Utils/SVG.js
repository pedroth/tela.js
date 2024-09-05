import { Vec2 } from "../Vector/Vector.js";
import { cBezier, qBezier } from "./Math.js";

export default function parse(text) {
    const tokensStream = tokens(stream(text));
    const { left: SVG } = parseSVG(eatAllSpacesChars(tokensStream));
    return readSVGNode(SVG);
}


//========================================================================================
/*                                                                                      *
 *                                       TOKENIZER                                      *
 *                                                                                      */
//========================================================================================
const TOKEN_SYMBOLS = [
    "<!--",
    "-->",
    "\n",
    "\r",
    "\t",
    " ",
    "<?",
    "?>",
    "</",
    "/>",
    "<",
    ">",
    "=",
    '"',
    "'"
];

function tokens(charStream) {
    let s = charStream;
    const tokensList = [];
    while (!s.isEmpty()) {
        const maybeToken = parseToken(s);
        if (!maybeToken) break;
        const { token, nextStream } = maybeToken;
        tokensList.push(token);
        s = nextStream;
    }
    return stream(tokensList);
}

function streamIncludes(charStream, string) {
    let s = charStream;
    let i = 0;
    while (!s.isEmpty() && i < string.length) {
        if (string[i++] !== s.head()) return false;
        s = s.tail();
    }
    return true;
}

const defaultToken = (charStream) => {
    let s = charStream;
    let stringStack = [];
    while (!s.isEmpty()) {
        const char = s.head();
        if (TOKEN_SYMBOLS.some(symbol => streamIncludes(s, symbol))) break;
        stringStack.push(char);
        s = s.tail();
    }
    if (stringStack.length)
        return { token: { type: "text", text: stringStack.join("") }, nextStream: s };
    throw new Error("Fail to parse default token");
}

function parseToken(charStream) {
    const TOKENS_PARSER = TOKEN_SYMBOLS.map(s => () => symbolParser(s)(charStream))
    return or(...TOKENS_PARSER, () => defaultToken(charStream));
}

function symbolParser(symbol) {
    return charStream => {
        let s = charStream;
        let i = 0;
        while (!s.isEmpty() && i < symbol.length) {
            if (symbol[i] !== s.head()) throw new Error("Fail to parse symbol");
            s = s.tail();
            i++;
        }
        return { token: { type: symbol, text: symbol }, nextStream: s }
    }
}

//========================================================================================
/*                                                                                      *
 *                                        PARSER                                        *
 *                                                                                      */
//========================================================================================

/*
 SVG -> StartTag InnerSVG EndTag / EmptyTag / CommentTag (" " || "\n")* SVG / XMLTag (" " || "\n")* SVG
 InnerSVG -> SVGTypes InnerSVG / ε
 SVGTypes -> SVG / CommentTag / Value
 Value -> AnyBut(<)
 StartTag ->  < (" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")*>
 EmptyTag -> <(" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")* />
 Attrs -> Attr (" " || "\n")* Attrs / ε
 Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 EndTag -> </(" ")*AlphaNumName(" ")*>
 AlphaNumName -> [a-zA-z][a-zA-Z0-9]*
 CommentTag -> <!--AnyBut("-->")-->
 XMLTag -> <?AnyBut("?>")?>
*/
function parseSVG(stream) {
    return or(
        () => {
            const { left: StartTag, right: nextStream1 } = parseStartTag(stream);
            const { left: InnerSVG, right: nextStream2 } = parseInnerSVG(nextStream1);
            const { left: EndTag, right: nextStream3 } = parseEndTag(eatAllSpacesChars(nextStream2));
            return pair({ type: "svg", StartTag, InnerSVG, EndTag }, nextStream3);
        },
        () => {
            const { left: EmptyTag, right: nextStream } = parseEmptyTag(stream);
            return pair({ type: "svg", EmptyTag }, nextStream);
        },
        () => {
            const { right: nextStream } = parseCommentTag(stream);
            const { left: SVG, right: nextStream1 } = parseSVG(eatAllSpacesChars(nextStream));
            return pair({ type: "svg", ...SVG }, nextStream1);
        },
        () => {
            const { right: nextStream } = parseXMLTag(stream);
            const { left: SVG, right: nextStream1 } = parseSVG(eatAllSpacesChars(nextStream));
            return pair({ type: "svg", ...SVG }, nextStream1);
        }
    );
}

function parseValue(stream) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(t => t.type === "<" || t.type === "</")(eatAllSpacesChars(stream));
    return pair({ type: "value", text: AnyBut.text }, nextStream);
}

function parseSVGTypes(stream) {
    return or(
        () => {
            const cleanStream = eatAllSpacesChars(stream);
            const { left: SVG, right: nextStream } = parseSVG(cleanStream);
            return pair({ type: "svgTypes", SVG }, nextStream);
        },
        () => {
            const cleanStream = eatAllSpacesChars(stream);
            const { left: CommentTag, right: nextStream } = parseCommentTag(cleanStream);
            return pair({ type: "svgTypes", CommentTag }, nextStream);
        },
        () => {
            const { left: Value, right: nextStream } = parseValue(stream);
            if (Value.text === "") throw Error("Fail to parse SVGType")
            return pair({ type: "svgTypes", Value }, nextStream);
        }
    )
}

function parseInnerSVG(stream) {
    return or(
        () => {
            const { left: SVGTypes, right: nextStream } = parseSVGTypes(stream);
            const { left: InnerSVG, right: nextStream1 } = parseInnerSVG(nextStream);
            return pair({
                type: "innerSvg",
                innerSvgs: [SVGTypes, ...InnerSVG.innerSvgs]
            }, nextStream1)
        },
        () => {
            return pair({
                type: "innerSvg",
                innerSvgs: []
            }, stream)
        }
    );
}

function parseAnyBut(tokenPredicate) {
    return (stream) => {
        let nextStream = stream;
        const textArray = [];
        while (!nextStream.isEmpty() && !tokenPredicate(nextStream.head())) {
            textArray.push(nextStream.head().text);
            nextStream = nextStream.tail();
        }
        return pair(
            { type: "anyBut", text: textArray.join("") },
            nextStream
        );
    };
}

function parseEndTag(stream) {
    const filteredStream = eatAllSpacesChars(stream);
    const token = filteredStream.head();
    if ("</" === token.type) {
        const nextStream1 = eatSpaces(filteredStream.tail());
        const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
        const nextStream3 = eatSpaces(nextStream2);
        if (">" === nextStream3.head().type) {
            return pair({ type: "endTag", tag: tagName.text }, nextStream3.tail());
        }
    }
    throw new Error("Fail to parse End Tag")
}

function parseEmptyTag(stream) {
    const token = stream.head();
    if ("<" === token.type) {
        const nextStream1 = eatSpaces(stream.tail());
        const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
        const nextStream3 = eatAllSpacesChars(nextStream2);
        const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
        const nextStream5 = eatAllSpacesChars(nextStream4);
        if ("/>" === nextStream5.head().type) {
            return pair({ type: "emptyTag", tag: tagName.text, Attrs }, nextStream5.tail());
        }
    }
    throw new Error("Fail to parse EmptyTag")
}

function parseCommentTag(stream) {
    if ("<!--" === stream.head().type) {
        const nextStream = stream.tail();
        const { left: AnyBut, right: nextStream1 } = parseAnyBut(token => '-->' === token.type)(nextStream);
        if (AnyBut.text !== "") return pair({ type: "commentTag" }, nextStream1.tail());
    }
    throw new Error("Fail to parse CommentTag")
}

function parseXMLTag(stream) {
    if ("<?" === stream.head().type) {
        const nextStream = stream.tail();
        const { right: nextStream1 } = parseAnyBut(token => '?>' === token.type)(nextStream);
        return pair({ type: "xmlTag" }, eatAllSpacesChars(nextStream1.tail()));
    }
    throw new Error("Fail to parse XMLTag")
}

function parseStartTag(stream) {
    const token = stream.head();
    if ("<" === token.type) {
        const nextStream1 = eatSpaces(stream.tail());
        const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
        const nextStream3 = eatAllSpacesChars(nextStream2);
        const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
        const nextStream5 = eatAllSpacesChars(nextStream4);
        if (">" === nextStream5.head().type) {
            return pair({ type: "startTag", tag: tagName.text, Attrs }, nextStream5.tail());
        }
    }
    throw new Error("Fail to parse StartTag")
}

function parseAlphaNumName(stream) {
    const token = stream.head();
    if ("text" === token.type) return pair({ type: "alphaNumName", text: token.text }, stream.tail());
    throw new Error("Fail to parse AlphaNumName")
}

function parseAttr(stream) {
    return or(
        () => {
            const { left: AlphaNumName, right: nextStream1 } = parseAlphaNumName(stream);
            if (
                "=" === nextStream1.head().type &&
                ("\"" === nextStream1.tail().head().type || "'" === nextStream1.tail().head().type)
            ) {
                const tokenType = nextStream1.tail().head().type;
                const { left: AnyBut, right: nextStream2 } =
                    parseAnyBut(token => tokenType === token.type)(
                        nextStream1
                            .tail() // take =
                            .tail() // take " | '
                    );
                return pair({
                    type: "attr",
                    attributeName: AlphaNumName.text,
                    attributeValue: AnyBut.text
                },
                    nextStream2.tail() // take "
                )
            }
        },
        () => {
            const { left: AlphaNumName, right: nextStream1 } = parseAlphaNumName(stream);
            return pair({
                type: "attr",
                attributeName: AlphaNumName.text,
                attributeValue: '"true"'
            },
                nextStream1
            )
        }
    )
}

function parseAttrs(stream) {
    return or(
        () => {
            const { left: Attr, right: nextStream } = parseAttr(stream);
            const nextStreamNoSpaces = eatAllSpacesChars(nextStream);
            const { left: Attrs, right: nextStream1 } = parseAttrs(nextStreamNoSpaces);
            return pair({
                type: "attrs",
                attributes: [Attr, ...Attrs.attributes]
            }, nextStream1);
        },
        () => {
            return pair({
                type: "attrs",
                attributes: [],
            }, stream);
        }
    )
}

const eatSpaces = eatWhile(p => p.type === " ");
const eatAllSpacesChars = eatWhile(p => p.type === " " || p.type === "\t" || p.type === "\r" || p.type === "\n")

//========================================================================================
/*                                                                                      *
 *                                    PARSE SVG PATH                                    *
 *                                                                                      */
//========================================================================================


/**
 * 
 * path -> action path/ ε
 * action -> (" "* | "\n"* )letter(" "* | "\n"*)numbers / letter
 * letter -> [a...zA...Z]
 * numbers -> number(" "* | "\n"*  | ",")numbers / ε
 * number -> -D.D / D.D / -D / D
 * D -> [0-9]D / ε
 */
export function parseSvgPath(svgPath) {
    const { left: path, } = parsePath(stream(svgPath));
    return path;
}

function parsePath(iStream) {
    return or(
        () => {
            const { left: action, right: nStream } = parseAction(iStream);
            const { left: path, right: nStream2 } = parsePath(nStream);
            return pair({ type: "path", actions: [{ ...action }, ...path.actions] }, nStream2);
        },
        () => {
            return pair({ type: "path", actions: [] }, iStream)
        }
    )
}

function parseAction(iStream) {
    const nStream0 = eatWhile(p => p === " " || p === "\n")(iStream);
    const { left: letter, right: nStream } = parseLetter(nStream0);
    const nStream1 = eatWhile(p => p === " " || p === "\n")(nStream);
    const { left: numbers, right: nStream2 } = parseNumbers(nStream1);
    return pair({ type: "action", letter: letter.letter, numbers: numbers.numbers }, nStream2);
}


function parseLetter(iStream) {
    const char = iStream.head();
    if (/^[a-zA-Z]$/.test(char)) {
        return pair({ type: "letter", letter: char }, iStream.tail())
    }
    throw new Error("Caught exception in parsing letter");
}

function parseNumbers(iStream) {
    return or(
        () => {
            const { left: number, right: nStream } = parseNumber(iStream);
            const nStream2 = eatWhile(p => p === " " || p === "\n" || p === ",")(nStream);
            const { left: numbers, right: nStream3 } = parseNumbers(nStream2);
            return pair({ type: "numbers", numbers: [number.number, ...numbers.numbers] }, nStream3);
        },
        () => {
            return pair({ type: "numbers", numbers: [] }, iStream);
        }
    )

}

function parseNumber(iStream) {
    return or(
        () => {
            let nStream = iStream;
            if (nStream.head() === "-") {
                nStream = nStream.tail();
                const { left: D, right: nStream2 } = parseD(nStream);
                if (nStream2.head() === ".") {
                    const { left: D2, right: nStream3 } = parseD(nStream2.tail()); // remove .
                    return pair({ type: "number", number: Number.parseFloat(`-${D.d}.${D2.d}`) }, nStream3);
                }
            }
            throw new Error("fail to parse -D.D");
        },
        () => {
            const { left: D, right: nStream } = parseD(iStream);
            if (nStream.head() === ".") {
                const { left: D2, right: nStream2 } = parseD(nStream.tail()); // remove .
                return pair({ type: "number", number: Number.parseFloat(`${D.d}.${D2.d}`) }, nStream2);
            }
            throw new Error("fail to parse D.D");
        },
        () => {
            let nStream = iStream;
            if (nStream.head() === "-") {
                nStream = nStream.tail();
                const { left: D, right: nStream2 } = parseD(nStream);
                return pair({ type: "number", number: Number.parseFloat(`-${D.d}`) }, nStream2);
            }
            throw new Error("fail to parse -D");
        },
        () => {
            const { left: D, right: nStream } = parseD(iStream);
            if (D.d === "") throw new Error("fail to parse D");
            return pair({ type: "number", number: Number.parseFloat(`${D.d}`) }, nStream)
        }
    )
}

function parseD(iStream) {
    return or(
        () => {
            const char = iStream.head();
            if (/^[0-9]$/.test(char)) {
                const nStream = iStream.tail();
                const { left: D, right: nStream2 } = parseD(nStream);
                return pair({ type: "D", d: `${char}${D.d}` }, nStream2);
            }
            throw new Error("Caught exception in parsing D");
        },
        () => {
            return pair({ type: "D", d: "" }, iStream);
        }
    )

}

function eatWhile(predicate) {
    return iStream => {
        let s = iStream;
        while (!s.isEmpty() && predicate(s.head())) {
            s = s.tail();
        }
        return s;
    }
}

//========================================================================================
/*                                                                                      *
 *                                      SVG READER                                      *
 *                                                                                      */
//========================================================================================

function addFirstPointIfNeeded(currentPos, path, keyPointPath) {
    if (keyPointPath.length === 0) {
        path.push(currentPos);
        keyPointPath.push(currentPos);
    }
}

function readPath(svg, tagNode) {
    let path = [];
    let keyPointPath = [];
    const samples = 10;
    let currentPos = Vec2();
    const [svgPath] = tagNode.Attrs.attributes.filter(a => a.attributeName === "d");
    const [idObj] = tagNode.Attrs.attributes.filter(a => a.attributeName === "id");
    const id = idObj?.attributeValue ?? generateUniqueID(5);
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
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                path.push(vecs[j]);
                keyPointPath.push(vecs[j]);
                currentPos = path.at(-1);
            }
        },
        "l": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                path.push(currentPos.add(vecs[j]));
                keyPointPath.push(currentPos.add(vecs[j]));
                currentPos = path.at(-1);
            }
        },
        "V": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                const newP = Vec2(currentPos.x, vecs[j].y);
                path.push(newP);
                keyPointPath.push(newP);
                currentPos = path.at(-1);
            }
        },
        "v": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                path.push(currentPos.add(vecs[j]));
                keyPointPath.push(currentPos.add(vecs[j]));
                currentPos = path.at(-1);
            }
        },
        "H": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                const newP = Vec2(vecs[j].x, currentPos.y);
                path.push(newP);
                keyPointPath.push(newP);
                currentPos = path.at(-1);
            }
        },
        "h": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 1) {
                path.push(currentPos.add(vecs[j]));
                keyPointPath.push(currentPos.add(vecs[j]));
                currentPos = path.at(-1);
            }
        },
        "Q": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 2) {
                const qb = qBezier(currentPos, vecs[j], vecs[j + 1]);
                for (let i = 0; i < samples; i++) {
                    path.push(qb(i / (samples - 1)));
                }
                keyPointPath.push(currentPos, vecs[j], vecs[j + 1]);
                currentPos = path.at(-1);
            }
        },
        "q": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 2) {
                const qb = qBezier(currentPos, currentPos.add(vecs[j]), currentPos.add(vecs[j + 1]));
                for (let i = 0; i < samples; i++) {
                    path.push(qb(i / (samples - 1)));
                }
                keyPointPath.push(currentPos, currentPos.add(vecs[j]), currentPos.add(vecs[j + 1]));
                currentPos = path.at(-1);
            }
        },
        "T": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            const [end] = vecs;
            const prevKeyPoint = keyPointPath.at(-2) ? keyPointPath.at(-2) : keyPointPath.at(-1);
            const control = currentPos.scale(2).sub(prevKeyPoint); // reflection bla bla
            const qb = qBezier(currentPos, control, end);
            for (let i = 0; i < samples; i++) {
                path.push(qb(i / (samples - 1)));
            }
            keyPointPath.push(
                currentPos,
                control,
                end
            )
            currentPos = path.at(-1);
        },
        "t": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            const [end] = vecs;
            const prevKeyPoint = keyPointPath.at(-2) ? keyPointPath.at(-2) : keyPointPath.at(-1);
            const control = currentPos.scale(2).sub(prevKeyPoint); // reflection bla bla
            const qb = qBezier(currentPos, control, currentPos.add(end));
            for (let i = 0; i < samples; i++) {
                path.push(qb(i / (samples - 1)));
            }
            keyPointPath.push(
                currentPos,
                control,
                currentPos.add(end)
            )
            currentPos = path.at(-1);
        },
        "C": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 3) {
                const cb = cBezier(
                    currentPos,
                    vecs[j],
                    vecs[j + 1],
                    vecs[j + 2]
                );
                for (let i = 0; i < samples; i++) {
                    path.push(cb(i / (samples - 1)));
                }
                keyPointPath.push(
                    currentPos,
                    vecs[j],
                    vecs[j + 1],
                    vecs[j + 2]
                )
                currentPos = path.at(-1);
            }
        },
        "c": (vecs) => {
            addFirstPointIfNeeded(currentPos, path, keyPointPath);
            for (let j = 0; j < vecs.length; j += 3) {
                const cb = cBezier(
                    currentPos,
                    currentPos.add(vecs[j]),
                    currentPos.add(vecs[j + 1]),
                    currentPos.add(vecs[j + 2])
                );
                for (let i = 0; i < samples; i++) {
                    path.push(cb(i / (samples - 1)));
                }
                keyPointPath.push(
                    currentPos,
                    currentPos.add(vecs[j]),
                    currentPos.add(vecs[j + 1]),
                    currentPos.add(vecs[j + 2])
                )
                currentPos = path.at(-1);
            }
        },
        "Z": () => {
            if (keyPointPath.length === 0) return;
            path.push(keyPointPath[0]);
            keyPointPath.push(keyPointPath[0]);
            if (!svg.defPaths[id]) {
                svg.defPaths[id] = [];
                svg.defKeyPointPaths[id] = [];
            }
            svg.defPaths[id].push(path);
            svg.defKeyPointPaths[id].push(keyPointPath);
            path = [];
            keyPointPath = [];
        },
        "z": () => {
            if (keyPointPath.length === 0) return;
            path.push(keyPointPath[0]);
            keyPointPath.push(keyPointPath[0]);
            if (!svg.defPaths[id]) {
                svg.defPaths[id] = [];
                svg.defKeyPointPaths[id] = [];
            }
            svg.defPaths[id].push(path);
            svg.defKeyPointPaths[id].push(keyPointPath);
            path = [];
            keyPointPath = [];
        }
    }
    const { actions } = parseSvgPath(svgPath.attributeValue);
    const vectorizedActions = actions
        .map(({ letter, numbers }) => {
            const vectors = [];
            const l = letter.toLowerCase();
            if (l === "v" || l === "h") {
                for (let i = 0; i < numbers.length; i += 1) {
                    if (l === "v") vectors.push(Vec2(0, numbers[i]));
                    if (l === "h") vectors.push(Vec2(numbers[i], 0));
                }
            } else {
                for (let i = 0; i < numbers.length; i += 2) {
                    vectors.push(Vec2(numbers[i], numbers[i + 1]));
                }
            }
            return { letter, vectors };
        })
    vectorizedActions.forEach(({ letter, vectors }) => {
        return (letter2action?.[letter] ?? (() => { }))(vectors);
    });
    if (path.length > 0) {
        if (!svg.defPaths[id]) {
            svg.defPaths[id] = [];
            svg.defKeyPointPaths[id] = [];
        }
        svg.defPaths[id].push(path);
        svg.defKeyPointPaths[id].push(keyPointPath);
    }
}

const transformBuilder = (a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) => x => Vec2(a, b).scale(x.x).add(Vec2(c, d).scale(x.y)).add(Vec2(e, f));
const dot = (f, g) => x => f(g(x));

function readTransform(svg, transformNode, transform = transformBuilder()) {
    (transformNode?.StartTag ?? transformNode?.EmptyTag)
        ?.Attrs
        .attributes
        .filter(x => x.attributeName === "transform")
        .forEach(({ attributeValue }) => {
            const params = attributeValue.match(/-?\d+\.?\d*/g).map(Number);
            if (attributeValue.includes("matrix")) {
                transform = dot(transform, transformBuilder(...params));
            }
            if (attributeValue.includes("translate")) {
                transform = dot(transform, transformBuilder(1, 0, 0, 1, ...params))
            }
            if (attributeValue.includes("scale")) {
                transform = dot(transform, transformBuilder(params[0], 0, params[1], 0, 0, 0))
            }
        })
    const nodeStack = [...(transformNode?.InnerSVG?.innerSvgs?.map(x => x.SVG) ?? [])];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack.shift(); // dequeue
        const node = currentNode?.StartTag ?? currentNode?.EmptyTag;
        const tag = node?.tag;
        if (tag === "g") {
            readTransform(svg, currentNode, transform);
            continue;
        }
        if (tag === "use") {
            const useParams = {
                id: undefined,
                transform
            }
            node.Attrs?.attributes.forEach(({ attributeName, attributeValue }) => {
                if (attributeName === "xlink:href") {
                    useParams.id = attributeValue.slice(1);
                }
                if (attributeName === "transform") {
                    const params = attributeValue.match(/-?\d+\.?\d*/g).map(Number);
                    if (attributeValue.includes("scale")) {
                        useParams.transform = dot(useParams.transform, transformBuilder(params[0], 0, 0, params[0], 0, 0));
                    }
                }
                if (attributeName === "x") {
                    useParams.transform = dot(useParams.transform, transformBuilder(1, 0, 0, 1, Number(attributeValue), 0));
                }
                if (attributeName === "y") {
                    useParams.transform = dot(useParams.transform, transformBuilder(1, 0, 0, 1, 0, Number(attributeValue)));
                }
            });
            if (useParams.id && svg.defPaths[useParams.id]) {
                svg.paths.push(svg.defPaths[useParams.id].map(paths => paths.map(useParams.transform)));
                svg.keyPointPaths.push(svg.defKeyPointPaths[useParams.id].map(paths => paths.map(useParams.transform)));
            }
        }
        nodeStack.push(...(currentNode?.InnerSVG?.innerSvgs?.map(x => x.SVG) ?? []));
    }

}

function readSVGNode(svgNode) {
    const svg = {
        width: undefined,
        height: undefined,
        viewBox: {},
        defPaths: {},
        defKeyPointPaths: {},
        paths: [],
        keyPointPaths: []
    }
    const nodeStack = [svgNode];
    while (nodeStack.length > 0) {
        const currentNode = nodeStack.shift(); // dequeue
        const tag = currentNode?.StartTag?.tag ?? currentNode?.EmptyTag?.tag;
        if (tag === "svg") {
            currentNode
                .StartTag
                .Attrs
                .attributes
                .forEach(attr => {
                    if (attr.attributeName === "viewBox") {
                        const vb = attr.attributeValue;
                        const [x, y, w, h] = vb.split(" ").map(x => Number.parseFloat(x));
                        svg.viewBox.min = Vec2(x, y);
                        svg.viewBox.max = Vec2(x + w, y + h);
                    }
                    if (attr.attributeName === "width") {
                        svg.width = Number.parseInt(attr.attributeValue);
                    }
                    if (attr.attributeName === "height") {
                        svg.height = Number.parseInt(attr.attributeValue);
                    }
                })
        }
        if (tag === "defs") {
            const defNodes = (currentNode?.InnerSVG?.innerSvgs?.map(x => x.SVG) ?? []);
            defNodes.forEach(defNode => {
                const defTag = defNode?.StartTag?.tag ?? currentNode?.EmptyTag?.tag;
                if (defTag !== "path") return;
                readPath(svg, defNode.EmptyTag ?? defNode.StartTag);
            })
            continue;
        }
        if (tag === "g") {
            readTransform(svg, currentNode);
            continue;
        }
        if (tag === "path") {
            readPath(svg, currentNode.EmptyTag ?? currentNode.StartTag);
        }
        nodeStack.push(...(currentNode?.InnerSVG?.innerSvgs?.map(x => x.SVG) ?? []));
    }
    if(svg.paths.length === 0) {
        Object.values(svg.defPaths).forEach(paths => svg.paths.push(paths));
        Object.values(svg.defKeyPointPaths).forEach(paths => svg.keyPointPaths.push(paths));
    }
    return svg;
}


//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


function pair(a, b) {
    return { left: a, right: b };
}

function or(...rules) {
    let accError = null;
    for (let i = 0; i < rules.length; i++) {
        try {
            return rules[i]();
        } catch (error) {
            accError = error;
        }
    }
    throw accError;
}

function stream(stringOrArray) {
    // copy array or string to array
    const array = [...stringOrArray];
    return {
        head: () => array[0],
        tail: () => stream(array.slice(1)),
        take: (n) => stream(array.slice(n)),
        isEmpty: () => array.length === 0,
        toString: () =>
            array.map(s => (typeof s === "string" ? s : JSON.stringify(s))).join(""),
        filter: predicate => stream(array.filter(predicate)),
        log: () => {
            let s = stream(array);
            while (!s.isEmpty()) {
                console.log(s.head());
                s = s.tail();
            }
        }
    };
}

function generateUniqueID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    let randomID = '';

    for (let i = 0; i < length; i++) {
        randomID += characters[Math.floor(Math.random() * charactersLength)];
    }

    return randomID;
}