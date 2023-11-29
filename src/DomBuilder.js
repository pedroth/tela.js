const SVG_URL = "http://www.w3.org/2000/svg";
const SVG_TAGS = [
  "svg",
  "g",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
];


class DomBuilder {
  constructor(element) {
    this.element = element;
  }

  attr(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  style(styleStr) {
    this.element.setAttribute("style", styleStr);
    return this;
  }
  /**
   *
   * @param {Array<DOM | DOMBuilder>} element
   */
  appendChild(...elements) {
    elements.forEach(e => {
      if (isElement(e)) {
        this.element.appendChild(e);
      } else if (isPromise(e)) {
        e.then(actualElem => this.appendChild(actualElem));
      } else {
        this.element.appendChild(e.build());
      }
    })
    return this;
  }

  /**
   * 
   * @param {String || Promise<String>} value 
   * @returns DOMBuilder
   */
  inner(value) {
    if (isPromise(value)) {
      value.then(v => this.element.innerHTML = v);
    } else {
      this.element.innerHTML = value;
    }
    return this;
  }

  removeChildren() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.lastChild);
    }
    return this;
  }

  html(value) {
    return this.inner(value);
  }

  event(eventName, lambda) {
    this.element.addEventListener(eventName, lambda);
    return this;
  }

  build() {
    return this.element;
  }

  addClass(className) {
    if (!className || className === "") return this;
    this.element.classList.add(...className.split(" "));
    return this;
  }

  removeClass(className) {
    this.element.classList.remove(className);
    return this;
  }


  /**
   * @param {String | DOM} elem
   */
  static of(elem) {
    if (isElement(elem)) {
      return new DomBuilder(elem);
    }
    const isSvg = SVG_TAGS.includes(elem);
    const element = isSvg ?
      document.createElementNS(SVG_URL, elem) :
      document.createElement(elem);
    // if (isSvg) element.setAttribute("xmlns", SVG_URL);
    return new DomBuilder(element);
  }

  static ofId(id) {
    return new DomBuilder(document.getElementById(id));
  }
}

//Returns true if it is a DOM element
function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement //DOM2
    : o &&
    typeof o === "object" &&
    o !== null &&
    o.nodeType === 1 &&
    typeof o.nodeName === "string";
}

function isPromise(o) {
  return o instanceof Promise;
}

export default DomBuilder;
