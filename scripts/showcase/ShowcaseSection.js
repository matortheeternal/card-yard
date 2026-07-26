import Column from './ShowcaseColumn.js';

export default class Section {
    constructor(name, test, columnConfigs = null, isGrid = false) {
        this.name = name;
        this.test = test;
        this.columns = [];
        this.isGrid = isGrid;

        this.columns = columnConfigs
            ? columnConfigs.map(config => new Column(config))
            : [new Column(null, isGrid)];
    }

    process(cards) {
        const sectionCards = cards.filter(c => this.test(c));
        const remainingGlobal = cards.filter(c => !this.test(c));

        if (sectionCards.length === 0)
            return { sectionCards: [], remainingGlobal };

        let remainingSection = [...sectionCards];
        for (const col of this.columns)
            remainingSection = col.addCards(remainingSection);

        return { sectionCards, remainingGlobal };
    }

    hasContent() {
        return this.columns.some(col => col.cards.length > 0);
    }

    render() {
        if (!this.hasContent()) return '';
        const hasColumns = this.columns.filter(c => c.cards.length > 0).length > 1;
        const columnsHtml = this.columns.map(col => col.render()).join('');

        return `
            <section class="showcase-section">
                <div class="showcase-section-content ${hasColumns ? 'has-columns' : ''}">
                    ${columnsHtml}
                </div>
            </section>
        `;
    }
}
