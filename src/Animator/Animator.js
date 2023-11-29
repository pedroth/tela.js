export default class Animator {
  constructor(state, next, doWhile) {
    this.state = state;
    this.next = next;
    this.while = doWhile;
    this.requestAnimeId = null;
  }

  play() {
    this.requestAnimeId = requestAnimationFrame(() => {
      if (!this.while(this.state)) return this.stop();
      this.state = this.next(this.state);
      this.play();
    });
    return this;
  }

  run() {
    while (this.while(this.state)) {
      this.state = this.next(this.state);
    }
    return this;
  }

  stop() {
    cancelAnimationFrame(this.requestAnimeId);
    return this;
  }

  static builder() {
    return new AnimatorBuilder();
  }
}

class AnimatorBuilder {
  constructor() {
    this._state = null;
    this._next = null;
    this._end = null;
  }

  initialState(state) {
    this._state = state;
    return this;
  }

  nextState(next) {
    this._next = next;
    return this;
  }

  while(end) {
    this._end = end;
    return this;
  }

  build() {
    const someAreEmpty = [this._state, this._next, this._end].some(
      (x) => x === null || x === undefined
    );
    if (someAreEmpty) throw new Error("Animator properties are missing");
    return new Animator(this._state, this._next, this._end);
  }
}
