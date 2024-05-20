/*
 SVG -> StartTag InnerSVG EndTag / EmptyTag / CommentTag
 InnerSVG -> SVG InnerSVG / ε
 StartTag ->  < (" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")*>
 EmptyTag -> <(" ")* AlphaNumName (" " || "\n")* Attrs (" " || "\n")* />
 Attrs -> Attr (" " || "\n")* Attrs / ε
 Attr -> AlphaNumName="AnyBut(")" / AlphaNumName='AnyBut(')'
 EndTag -> </(" ")*AlphaNumName(" ")*>
 AlphaNumName -> [a-zA-z][a-zA-Z0-9]*
*/
export default function parse(text) {
    return parseSVG(tokens(stream(text)));
}

//========================================================================================
/*                                                                                      *
 *                                       TOKENIZER                                      *
 *                                                                                      */
//========================================================================================


function tokens(charStream) {
    let s = charStream;
    const tokensList = [];
    while (!s.isEmpty()) {
        const maybeToken = parseToken(s);
        if (!maybeToken) break;
        const { symbol: token, nextStream } = maybeToken;
        tokensList.push(token);
        s = nextStream;
    }
    return stream(tokensList);
}

function parseToken(charStream) {
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
    const TOKENS_PARSER = TOKEN_SYMBOLS.map(s => () => symbolParser(s)(charStream))
    const defaultToken = (charStream) => {
        let s = charStream;
        let stringStack = [];
        while (!s.isEmpty()) {
            const char = s.head();
            if (TOKEN_SYMBOLS.includes(char)) break;
            stringStack.push(char);
            s = s.tail();
        }
        return stringStack.length ? { symbol: stringStack.join(""), nextStream: s } : undefined;
    }
    return or(...TOKENS_PARSER, () => defaultToken(charStream));
}

function symbolParser(symbol) {
    return charStream => {
        let s = charStream;
        let i = 0;
        while (!s.isEmpty() && i < symbol.length) {
            if (symbol[i] !== s.head()) return;
            s = s.tail();
            i++;
        }
        return { symbol, nextStream: s }
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
            // small hack to parse script and style tags
            const { left: InnerSVG, right: nextStream2 } = parseInnerSVG(nextStream1);

            const { left: EndTag, right: nextStream3 } = parseEndTag(nextStream2);
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

function parseInnerSVG(stream) {
    const { left: AnyBut, right: nextStream } = parseAnyBut(token => token === "</")(stream);
    const text = AnyBut.textArray.join("");
    return pair({
        type: "innerSVG",
        innerSVG: [{
            type: "innerSVG",
            text: text
        }]
    },
        nextStream
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
            { type: "anyBut", textArray },
            nextStream
        );
    };
}

function parseEndTag(stream) {

}

function parseEmptyTag(stream) {

}

function parseCommentTag(stream) {

}

function parseStartTag(stream) {
    const token = stream.head();
    if ("<" === token) {
        const nextStream1 = eatSpaces(stream.tail());
        const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1)
        const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
        const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
        const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
        if (">" === nextStream5.head()) {
            return pair({ type: "startTag", tag: tagName.text, Attrs }, nextStream5.tail());
        }
    }
    throw new Error(`Error occurred while parsing StartTag,`);
}

function parseAlphaNumName(stream) {

}

function parseAttrs(stream) {

}

function eatSpaces(stream) {
    let s = stream;
    while (!s.isEmpty()) {
        if (s.head() !== " ") break;
        s = s.tail();
    }
    return s;
}
function eatSpacesTabsAndNewLines(stream) {
    let s = stream;
    while (!s.isEmpty()) {
        const symbol = s.head();
        if (symbol === " " || symbol === "\t" || symbol === "\n") break;
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
    for (let i = 0; i < rules.length; i++) {
        const value = rules[i]();
        if (value) return value;
    }
    return
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
    tokens(stream(`<div id="test" > Hello world </div>`)).log();
})()

