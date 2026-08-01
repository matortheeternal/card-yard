import SequentialRun from './SequentialRun.js';

export default class RunsManager {
    constructor() {
        this.runs = new Map();
    }

    initializeRun(pool, cards, count) {
        this.runs.set(pool, new SequentialRun(pool, cards, count));
    }

    getNextCard(pool, cards, count) {
        if (!this.runs.has(pool))
            this.initializeRun(pool, cards, count);
        const run = this.runs.get(pool);
        const sheet = run.next();
        return sheet.next();
    }
}
