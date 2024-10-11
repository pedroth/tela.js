export default class Anima {
    constructor(sequenceOfBehaviors = []) {
        let acc = 0;
        this.sequence = sequenceOfBehaviors.map(b => {
            const ans = { ...b, start: acc, end: acc + b.duration };
            acc = ans.end;
            return ans;
        });
    }

    anime(t, dt) {
        let s = 0;
        let i = 0;
        while (s < t && i < this.sequence.length) {
            s += this.sequence[i].duration;
            i++;
        }
        const index = Math.max(0, i - 1);
        const prevBehavior = this.sequence[index];
        let tau = t - prevBehavior.start;
        if (i >= this.sequence.length) tau = Math.min(tau, prevBehavior.duration); // end animation
        if (Math.abs(tau - prevBehavior.duration) < dt) {
            tau = prevBehavior.duration
        }
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

    static wait(duration) {
        return { behavior: () => { }, duration };
    }

    static list(...args) {
        return new Anima(args);
    }
}

