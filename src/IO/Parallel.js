export default class Parallel {
    constructor(
        numberOfStreams,
        inputStreamGenerator,
        partitionFunction,
        stateGenerator,
        dependencies,
        lazyInitialState
    ) {
        this.numberOfStreams = numberOfStreams;
        this.inputStreamGenerator = inputStreamGenerator;
        this.partitionFunction = partitionFunction;
        this.stateGenerator = stateGenerator;
        this.dependencies = dependencies;
        this.lazyInitialState = lazyInitialState;
    }

    getPartition() {
        return new Array(this.numberOfStreams)
            .fill()
            .map((_, i) => {
                return { ...this.inputStreamGenerator(i), __ite__: i };
            })
            .reduce((e, x, i) => {
                const value = this.partitionFunction(x, i);
                if (!(value in e)) {
                    e[value] = [];
                }
                e[value].push(x);
                return e;
            }, {})
    }

    static builder() {
        return new ParallelBuilder();
    }
}

class ParallelBuilder {
    constructor() {
        this._numberOfStreams;
        this._inputStreamGenerator;
        this._partitionFunction;
        this._stateGenerator;
        this._dependencies;
        this._lazyInitialState = () => { };
    }

    numberOfStreams(numberOfStreams) {
        this._numberOfStreams = numberOfStreams;
        return this;
    }

    inputStreamGenerator(inputStreamGenerator) {
        this._inputStreamGenerator = inputStreamGenerator;
        return this;
    }

    partitionFunction(partitionFunction) {
        this._partitionFunction = partitionFunction;
        return this;
    }

    stateGenerator(stateGenerator, dependencies = []) {
        this._stateGenerator = stateGenerator;
        this._dependencies = dependencies;
        return this;
    }

    lazyInitialState(lazyInitialState) {
        this._lazyInitialState = lazyInitialState;
        return this;
    }

    build() {
        const attrs = [
            this._numberOfStreams,
            this._inputStreamGenerator,
            this._partitionFunction,
            this._stateGenerator,
            this._dependencies,
            this._lazyInitialState
        ]
        if (attrs.some((x) => x === undefined)) {
            throw new Error("Parallel is incomplete");
        }
        return new Parallel(...attrs);
    }
}
