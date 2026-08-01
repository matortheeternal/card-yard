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
        const filteredCards = this.applySetFilter(
            this.applyTypeFilter(cards, type),
            setCode
        );
        return query.trim()
            ? this.sifter.filter(filteredCards, query)
            : filteredCards;
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
