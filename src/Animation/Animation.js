import Stream from "../Stream/Stream.js";

export default class Animation {
  constructor(state, next, doWhile) {
    this.animation = new Stream(state, next);
    this.while = doWhile;
    this.requestAnimeId = null;
  }

  play(stream = this.animation) {
    const timeout = typeof window === "undefined" ? setTimeout : requestAnimationFrame; 
    this.requestAnimeId = timeout(() => {
      if (!this.while(stream.head)) return this.stop();
      this.play(stream.tail);
    });
    Animation.globalAnimationIds.push(this.requestAnimeId);
    return this;
  }

  stop() {
    const cancel = typeof window === "undefined" ? clearTimeout : cancelAnimationFrame; 
    cancel(this.requestAnimeId);
    return this;
  }

  static globalAnimationIds = [];

  static builder() {
    return new AnimationBuilder();
  }
}

class AnimationBuilder {
  constructor() {
    this._state = {};
    this._next = null;
    this._end = null;
  }

  initialState(state) {
    this._state = state;
    return this;
  }

  // next: currentState => NextState
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
    if (someAreEmpty) throw new Error("Animation properties are missing");
    return new Animation(this._state, this._next, this._end);
  }
}