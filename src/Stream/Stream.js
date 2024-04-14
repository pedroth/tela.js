export default class Stream {
    constructor(initialState, updateStateFunction, pred = () => true) {
        this._head = initialState;
        this._tail = updateStateFunction;
        this._pred = pred;
    }

    get head() { return this._head; }

    get tail() {
        let state = this.head;
        while (!this._pred(this._tail(state))) {
            state = this._tail(state);
        }
        return new Stream(this._tail(state), this._tail, this._pred);
    }

    filter(predicate = () => true) {
        return new Stream(this._head, this._tail, (x) => this._pred(x) && predicate(x));
    }
}