import SheetCollection from './SheetCollection.js';

export default class SheetManager {
    constructor() {
        this.collections = new Map();
    }

    initializeCollection(pool, cards) {
        this.collections.set(pool, new SheetCollection(pool, cards));
    }

    getNextCard(pool, cards) {
        if (!this.collections.has(pool))
            this.initializeCollection(pool, cards);
        const collection = this.collections.get(pool);
        const sheet = collection.next();
        return sheet.next();
    }
}
