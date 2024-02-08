export default class PQueue {
    constructor(comparator = (a, b) => a - b) {
        this.data = [];
        this.comparator = comparator;
    }

    get length() {
        return this.data.length;
    }

    push(element) {
        this.data.push(element);
        if (this.data.length <= 1) return this;
        let i = this.data.length - 1;
        while (i > 0) {
            const parentIndex = i % 2 !== 0 ? Math.floor(i / 2) : i / 2 - 1;
            if (this.comparator(this.data[parentIndex], this.data[i]) <= 0) break;
            const temp = this.data[parentIndex];
            this.data[parentIndex] = this.data[i];
            this.data[i] = temp;
            i = parentIndex;
        }
        return this;
    }

    /**
     * Extracts min or max
     */
    pop() {
        if (!this.data.length) return;
        const v = this.data[0];
        this.data = this.data.slice(1);
        if (!this.data.length <= 1) return v;
        // the last element is by default a max/min heap, since it is a leaf
        // exchange first with last
        const temp = this.data[0];
        this.data[0] = this.data.at(-1);
        this.data[this.data.length - 1] = temp;
        this.data = heapifyBuilder(this.data, this.comparator)(0);
        return v;
    }

    static ofArray(array, comparator) {
        const queue = new PQueue(comparator);
        for (let i = 0; i < array.length; i++) {
            queue.push(array[i]);
        }
        return queue;
    }
}


function heapifyBuilder(data, comparator) {
    return rootIndex => {
        const leftIndex = 2 * rootIndex + 1;
        const rightIndex = 2 * rootIndex + 2;
        let minIndex = rootIndex;
        if (comparator(data[leftIndex], data[rootIndex]) <= 0) {
            minIndex = leftIndex;
        }
        if (comparator(data[rightIndex], data[minIndex]) <= 0) {
            minIndex = rightIndex;
        }
        if (minIndex !== rootIndex) {
            const temp = data[rootIndex];
            data[rootIndex] = data[minIndex];
            data[minIndex] = temp;
            return heapifyBuilder(data, comparator)(minIndex);
        }
        return data;
    }
}