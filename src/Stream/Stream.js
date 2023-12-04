export default class Stream {
    constructor(initialState, updateStateFunction) {
        this._head = initialState;
        this._tail = updateStateFunction;
    }

    get head() { return this._head; }

    get tail() { return new Stream(this._tail(this._head), this._tail); }
}