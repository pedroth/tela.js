window.globalAnimationIds = []
export default class Animation {
  constructor(state, next, doWhile) {
    this.state = state;
    this.next = next;
    this.while = doWhile;
    this.requestAnimeId = null;
    this.isStopping = false;
  }

  play() {
    const timeout = typeof window === "undefined" ? setTimeout : requestAnimationFrame;
    if (this.isStopping) {
      this.isStopping = false;
      return this;
    }
    this.requestAnimeId = timeout(() => {
      if (!this.while(this.state)) return this.stop();
      this.state = this.next(this.state);
      this.play();
    });
    window.globalAnimationIds.push(this.requestAnimeId);
    return this;
  }

  stop() {
    const cancel = typeof window === "undefined" ? clearTimeout : cancelAnimationFrame;
    cancel(this.requestAnimeId);
    this.isStopping = true;
    return this;
  }

  /**
   * 
   * @param lambda: ({time, dt} => {}) 
   * @returns 
   */
  static loop(lambda) {
    return Animation
      .builder()
      .initialState({ time: 0, oldTime: new Date().getTime() })
      .nextState(({ time, oldTime }) => {
        const newTime = new Date().getTime();
        const dt = (newTime - oldTime) * 1e-3;
        lambda({ time, dt });
        return { time: time + dt, oldTime: newTime };
      })
      .build();
  }

  static builder() {
    return new AnimationBuilder();
  }
}

class AnimationBuilder {
  constructor() {
    this._state = {};
    this._next = null;
    this._end = () => true;
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