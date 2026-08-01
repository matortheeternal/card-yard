import { interleave, mergeByInterleave } from './interleave.js';
import groupCardsByColor from './groupCardsByColor.js';

export default class BaseCardSheet {
    interleaveByColor(cards) {
        const cardsByColor = groupCardsByColor(cards);
        return mergeByInterleave(
            cardsByColor.map(group => mergeByInterleave(Object.values(group)))
        );
    }

    addCards(cards, weight = 1) {
        const orderedCards = this.interleaveByColor(cards);
        const weightedCards = Array(weight).fill(orderedCards).flat();
        this.cards = this.cards
            ? interleave(this.cards, weightedCards)
            : weightedCards;
    }
}
