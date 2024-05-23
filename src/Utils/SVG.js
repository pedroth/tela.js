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

(() => {
    console.log(parse(`
<svg xmlns="http://www.w3.org/2000/svg" width="640px" height="480px" viewBox="0 -880.4 3807.6 962.4" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" style="">
  <defs>
    <path id="MJX-12-TEX-I-1D452" d="M39 168Q39 225 58 272T107 350T174 402T244 433T307 442H310Q355 442 388 420T421 355Q421 265 310 237Q261 224 176 223Q139 223 138 221Q138 219 132 186T125 128Q125 81 146 54T209 26T302 45T394 111Q403 121 406 121Q410 121 419 112T429 98T420 82T390 55T344 24T281 -1T205 -11Q126 -11 83 42T39 168ZM373 353Q367 405 305 405Q272 405 244 391T199 357T170 316T154 280T149 261Q149 260 169 260Q282 260 327 284T373 353Z"/>
    <path id="MJX-12-TEX-I-1D456" d="M184 600Q184 624 203 642T247 661Q265 661 277 649T290 619Q290 596 270 577T226 557Q211 557 198 567T184 600ZM21 287Q21 295 30 318T54 369T98 420T158 442Q197 442 223 419T250 357Q250 340 236 301T196 196T154 83Q149 61 149 51Q149 26 166 26Q175 26 185 29T208 43T235 78T260 137Q263 149 265 151T282 153Q302 153 302 143Q302 135 293 112T268 61T223 11T161 -11Q129 -11 102 10T74 74Q74 91 79 106T122 220Q160 321 166 341T173 380Q173 404 156 404H154Q124 404 99 371T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Z"/>
    <path id="MJX-12-TEX-I-1D70B" d="M132 -11Q98 -11 98 22V33L111 61Q186 219 220 334L228 358H196Q158 358 142 355T103 336Q92 329 81 318T62 297T53 285Q51 284 38 284Q19 284 19 294Q19 300 38 329T93 391T164 429Q171 431 389 431Q549 431 553 430Q573 423 573 402Q573 371 541 360Q535 358 472 358H408L405 341Q393 269 393 222Q393 170 402 129T421 65T431 37Q431 20 417 5T381 -10Q370 -10 363 -7T347 17T331 77Q330 86 330 121Q330 170 339 226T357 318T367 358H269L268 354Q268 351 249 275T206 114T175 17Q164 -11 132 -11Z"/>
    <path id="MJX-12-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"/>
    <path id="MJX-12-TEX-N-2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"/>
    <path id="MJX-12-TEX-N-31" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q149 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T201 52T207 57T213 61V578Z"/>
  </defs>
  <g stroke="#000000" fill="#000000" stroke-width="0" transform="scale(1,-1)">
    <g data-mml-node="math">
      <g data-mml-node="msup">
        <g data-mml-node="mi">
          <use data-c="1D452" xlink:href="#MJX-12-TEX-I-1D452"/>
        </g>
        <g data-mml-node="TeXAtom" transform="translate(499,413) scale(0.707)" data-mjx-texclass="ORD">
          <g data-mml-node="mi">
            <use data-c="1D456" xlink:href="#MJX-12-TEX-I-1D456"/>
          </g>
          <g data-mml-node="mi" transform="translate(345,0)">
            <use data-c="1D70B" xlink:href="#MJX-12-TEX-I-1D70B"/>
          </g>
        </g>
      </g>
      <g data-mml-node="mo" transform="translate(1473.8,0)">
        <use data-c="3D" xlink:href="#MJX-12-TEX-N-3D"/>
      </g>
      <g data-mml-node="mo" transform="translate(2529.6,0)">
        <use data-c="2212" xlink:href="#MJX-12-TEX-N-2212"/>
      </g>
      <g data-mml-node="mn" transform="translate(3307.6,0)">
        <use data-c="31" xlink:href="#MJX-12-TEX-N-31"/>
      </g>
    </g>
  </g>
</svg>
    `));
})()

