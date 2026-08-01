import CardSheet from './CardSheet.js';
import SearchEngine from '../search/SearchEngine.js';
import BaseCardSheet from './BaseCardSheet.js';

export default class SheetCollection {
    constructor(pool, cards) {
        this.sheets = [];
        this.maxSheets = 4;
        this.sheetProbability = 0.5;
        const engine = new SearchEngine();
        this.baseSheet = new BaseCardSheet();
        for (const entry of pool) {
            const matchingCards = engine.filter(cards, entry.expression);
            this.baseSheet.addCards(matchingCards, Number(entry.weight));
        }
    }

    get(index) {
        const [sheet] = this.sheets.splice(index - 1, 1);
        this.sheets.push(sheet);
        return sheet;
    }

    remove(sheet) {
        const index = this.sheets.indexOf(sheet);
        if (index === -1) return;
        this.sheets.splice(index, 1);
    }

    new() {
        const sheet = new CardSheet(this);
        sheet.addCards(this.baseSheet.cards);
        this.sheets.push(sheet);
        return sheet;
    }

    next() {
        for (let i = 1; i <= this.sheets.length; i++) {
            if (i === this.maxSheets) return this.sheets[i];
            if (Math.random() < this.sheetProbability)
                return this.get(i);
        }
        return this.new();
    }
}
