export default class Anima {
    constructor(sequenceOfBehaviors = []) {
        let acc = 0;
        this.sequence = sequenceOfBehaviors.map(b => {
            const ans = { ...b, start: acc, end: acc + b.duration };
            acc = ans.end;
            return ans;
        });
    }


    static list(...args) {
        return new Anima(args);
    }

    anime(t, dt) {
        let s = 0;
        let i = 0;
        while (s < t && i < this.sequence.length) {
            s += this.sequence[i].duration;
            i++;
        }
        const prevBehavior = this.sequence[Math.max(0, i - 1)];
        let tau = t - prevBehavior.start;
        if(i >= this.sequence.length) tau = Math.min(tau, prevBehavior.duration);
        return prevBehavior.behavior(tau, dt);
    }

    /**
     * 
     * @param {(t, dt) => any} lambda 
     * @param {time in seconds} duration 
     */
    static behavior(lambda, duration) {
        return { behavior: lambda, duration };
    }
}

