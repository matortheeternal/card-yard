import showcaseSections from './showcaseSections.js';
import Section from './ShowcaseSection.js';

export class ShowcaseOrder {
    constructor() {
        this.sections = showcaseSections;
    }

    build(cards) {
        let remainingCards = [...cards];
        const activeSections = [];

        for (const section of this.sections) {
            const { remainingGlobal } = section.process(remainingCards);
            remainingCards = remainingGlobal;
            if (section.hasContent())
                activeSections.push(section);
        }

        if (remainingCards.length > 0) {
            const other = new Section('Other', () => true, null, true);
            other.process(remainingCards);
            activeSections.push(other);
        }

        return activeSections;
    }

    render(activeSections) {
        return activeSections.map(s => s.render()).join('');
    }
}
