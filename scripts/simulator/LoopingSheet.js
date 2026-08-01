import CardSheet from './CardSheet.js';

export default class LoopingSheet extends CardSheet {
    constructor() {
        super(null);
    }

    next() {
        const card = this.cards[this.position];
        this.position = (this.position + 1) % this.cards.length;
        return card;
    }
}
