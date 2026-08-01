import { SearchEngine } from '../search/SearchEngine.js';
import groupCardsByColor from './groupCardsByColor.js';
import BaseCardSheet from './BaseCardSheet.js';
import LoopingSheet from './LoopingSheet.js';

export default class SequentialRun {
    constructor(pool, cards, count = 10) {
        this.count = count;
        this.aCount = Math.round(count * 0.6);
        this.cursor = 0;
        const baseSheets = this.createRunSheets(pool, cards);
        this.sheets = baseSheets.map(b => new LoopingSheet(b));
    }

    getExtraCards(cardsByColor) {
        const extraCards = Object.values(cardsByColor[0]).flat().slice();
        for (let i = 2; i <= 5; i++)
            extraCards.push(...Object.values(cardsByColor[i]));
        return extraCards;
    }

    cardsBySheet(cardPool) {
        const cardsByColor = groupCardsByColor(cardPool);
        const firstSheetMonoColorCount = Math.round(
            (this.aCount * cardPool.length) /
            (5 * this.count)
        );
        return Object.values(cardsByColor[1]).reduce((acc, cards) => {
            acc.a.push(cards.slice(0, firstSheetMonoColorCount));
            acc.b.push(cards.slice(firstSheetMonoColorCount));
            return acc;
        }, {
            a: [],
            b: this.getExtraCards(cardsByColor)
        });
    }

    createRunSheets(pool, cards) {
        const engine = new SearchEngine();
        const cardPool = [];
        for (const entry of pool)
            cardPool.push(...engine.filter(cards, entry.expression));
        const cardsBySheet = this.cardsBySheet(cardPool);
        const sheetA = new BaseCardSheet();
        const sheetB = new BaseCardSheet();
        sheetA.addCards(cardsBySheet.a.flat(), 2);
        sheetB.addCards(cardsBySheet.b.flat(), 2);
        return [sheetA, sheetB];
    }

    next() {
        const useSecondSheet = (this.cursor++ % this.count) >= this.aCount;
        const sheetToUse = this.sheets[useSecondSheet ? 1 : 0];
        return sheetToUse.next();
    }
}
