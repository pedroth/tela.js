/*
 SVG -> StartTag InnerSVG EndTag / EmptyTag / CommentTag
 InnerSVG -> SVGTypes InnerSVG / ε
 SVGTypes -> SVG / Value
 Value -> AnyBut(<)
 StartTag ->  < (" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")*>
 EmptyTag -> <(" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")* />
 Attrs -> Attr (" " || "\n")* Attrs / ε
 Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 EndTag -> </(" ")*AlphaNumName(" ")*>
 AlphaNumName -> [a-zA-z][a-zA-Z0-9]*
*/
export default function parse(text) {
    const { left: SVG } = parseSVG(eatSpacesTabsAndNewLines(tokens(stream(text))));
    // TODO create triangulation
    return SVG;
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
    "\t",
    " ",
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


function parseSVG(stream) {
    return or(
        () => {
            const { left: StartTag, right: nextStream1 } = parseStartTag(stream);
            const { left: InnerSVG, right: nextStream2 } = parseInnerSVG(nextStream1);
            const { left: EndTag, right: nextStream3 } = parseEndTag(eatSpacesTabsAndNewLines(nextStream2));
            return pair({ type: "svg", StartTag, InnerSVG, EndTag }, nextStream3);
        },
        () => {
            const { left: EmptyTag, right: nextStream } = parseEmptyTag(stream);
            return pair({ type: "svg", EmptyTag }, nextStream);
        },
        () => {
            const { left: CommentTag, right: nextStream } = parseCommentTag(stream);
            return pair({ type: "svg", CommentTag }, nextStream);
        }
    );
}

function parseValue(stream) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(t => t.type === "<" || t.type === "</")(eatSpacesTabsAndNewLines(stream));
    return pair({ type: "value", text: AnyBut.text }, nextStream);
}

function parseSVGTypes(stream) {
    return or(
        () => {
            const cleanStream = eatSpacesTabsAndNewLines(stream);
            const { left: SVG, right: nextStream } = parseSVG(cleanStream);
            return pair({ type: "svgTypes", SVG }, nextStream);
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
    const filteredStream = eatSpacesTabsAndNewLines(stream);
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
        const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
        const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
        const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
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

function parseStartTag(stream) {
    const token = stream.head();
    if ("<" === token.type) {
        const nextStream1 = eatSpaces(stream.tail());
        const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
        const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
        const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
        const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
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
            const nextStreamNoSpaces = eatSpacesTabsAndNewLines(nextStream);
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

function eatSpaces(stream) {
    let s = stream;
    while (!s.isEmpty()) {
        if (s.head().type !== " ") break;
        s = s.tail();
    }
    return s;
}
function eatSpacesTabsAndNewLines(stream) {
    let s = stream;
    while (!s.isEmpty()) {
        const symbol = s.head().type;
        if (symbol !== " " && symbol !== "\t" && symbol !== "\n") break;
        s = s.tail();
    }
    return s;
}

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
    const nStream0 = eatWhile(iStream, p => p === " " || p === "\n");
    const { left: letter, right: nStream } = parseLetter(nStream0);
    const nStream1 = eatWhile(nStream, p => p === " " || p === "\n");
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
            const nStream2 = eatWhile(nStream, p => p === " " || p === "\n" || p === ",");
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

function eatWhile(iStream, predicate) {
    let s = iStream;
    while (!s.isEmpty() && predicate(s.head())) {
        s = s.tail();
    }
    return s;
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
