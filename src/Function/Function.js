export default class Function {
  #lambda;
  constructor(lambda) {
    this.#lambda = lambda;
  }

  get lambda() {
    return this.#lambda;
  }

  get f() {
    return this.#lambda;
  }

  dot = funcOrLambda => {
    return Function.of(x => this.#lambda(Function.of(funcOrLambda).eval(x)));
  };

  compose = this.dot;

  call = x => this.#lambda(x);
  eval = this.call;
  apply = this.call;

  static of(lambda) {
    if (typeof lambda === "function") return new Function(lambda);
    if (lambda instanceof Function) return lambda;
  }
}
