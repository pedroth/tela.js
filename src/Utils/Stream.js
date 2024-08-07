const ID = x => x;
const TRUE = () => true;

export default class Stream {
    constructor(initialState, updateStateFunction, options = {}) {
        this._head = initialState;
        this._tail = updateStateFunction;
        this._pred = options?.predicate ?? TRUE;
        this._map = options?.map ?? ID;
    }

    get head() { return this._map(this._head); }

    get tail() {
        return (async () => {
            let state = this.head;
            while (!this._pred(this._tail(state))) {
                state = await this._tail(state);
            }
            return new Stream(await this._tail(state), this._tail, this._pred);
        })();
    }

    map(lambda) {
        return new Stream(this._head, this._tail, { predicate: this._pred, map: x => lambda(this._map(x)) })
    }

    filter(predicate = () => true) {
        return new Stream(this._head, this._tail, { predicate: (x) => this._pred(x) && predicate(x), map: this._map });
    }
}