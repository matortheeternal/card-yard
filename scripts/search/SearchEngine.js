import Sifter from 'sigil-sifter';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';

export class SearchEngine {
    constructor() {
        this.sifter = new Sifter();
        Magic(this.sifter);
        CardMagicianMagic(this.sifter);
    }

    filter(cards, query, type, setCode) {
        let filteredCards = cards;

        filteredCards = this.applyTypeFilter(filteredCards, type);
        filteredCards = this.applySetFilter(filteredCards, setCode);

        if (!query.trim()) {
            return filteredCards;
        }

        return this.sifter.filter(filteredCards, query);
    }

    applyTypeFilter(cards, type) {
        if (type !== 'draftable') return cards;

        return cards.filter(c => {
            const superType = c.front.superType || '';
            return !/\b(basic land|token|emblem)\b/i.test(superType);
        });
    }

    applySetFilter(cards, setCode) {
        if (!setCode || setCode === 'all') return cards;
        return cards.filter(c => c.setCode === setCode);
    }
}
