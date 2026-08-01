export default class CardSheet {
    constructor(collection) {
        this.collection = collection;
        this.position = 0;
    }

    addCards(cards) {
        const startIndex = Math.floor(Math.random() * cards.length);
        this.cards = Array.prototype.concat(
            cards.slice(startIndex),
            cards.slice(0, startIndex)
        );
    }

    next() {
        const card = this.cards[this.position++];
        if (this.position === this.cards.length)
            this.collection.remove(this);
        return card;
    }
}
