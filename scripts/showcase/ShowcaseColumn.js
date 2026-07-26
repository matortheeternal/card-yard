import { sortByNumber, sortCards } from './helpers.js';

export default class Column {
    constructor(colors, isGrid = false) {
        this.colors = colors;
        this.isGrid = isGrid;
        this.cards = [];
        this.test = colors && colors.length > 0
            ? c => (c.color || '') === colors
            : () => true;
    }

    addCards(cards) {
        const matched = cards.filter(c => this.test(c));
        this.cards = this.isGrid
            ? sortByNumber(matched)
            : sortCards(matched);
        return cards.filter(c => !this.test(c));
    }

    render() {
        if (this.cards.length === 0) return '';
        const cardsHtml = this.cards.map(c => c.element.outerHTML).join('');
        return `
            <div class="showcase-column">
                <div class="showcase-grid ${this.isGrid ? 'full-grid' : ''}">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }
}
