const RARITY_ORDER = {
    mythic: 0, rare: 1, uncommon: 2, common: 3, basic: 4, special: 5, bonus: 6
};
const COLOR_ORDER = { W: 0, U: 1, B: 2, R: 3, G: 4, M: 5, C: 6, L: 7 };

const compareNames = function(a, b) {
    const na = a.front.name.toLowerCase();
    const nb = b.front.name.toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
}

const STRATEGIES = {
    name: {
        id: 'name',
        getValue: c => c.front.name.toLowerCase(),
        autoAsc: true
    },
    number: {
        id: 'number',
        autoAsc: true,
        compare: (a, b, isAsc) => {
            // Sort by setCode first
            if (a.setCode < b.setCode) return isAsc ? -1 : 1;
            if (a.setCode > b.setCode) return isAsc ? 1 : -1;

            // Then by collectorNumber
            const na = a.front.collectorNumber || a.front.autoCollectorNumber || '0';
            const nb = b.front.collectorNumber || b.front.autoCollectorNumber || '0';

            const numA = parseInt(na);
            const numB = parseInt(nb);
            const isNumA = !isNaN(numA) && numA.toString() === na.trim();
            const isNumB = !isNaN(numB) && numB.toString() === nb.trim();

            if (!isNumA && isNumB) return isAsc ? -1 : 1;
            if (isNumA && !isNumB) return isAsc ? 1 : -1;

            if (!isNumA && !isNumB) {
                if (na < nb) return isAsc ? -1 : 1;
                if (na > nb) return isAsc ? 1 : -1;
            } else {
                if (numA < numB) return isAsc ? -1 : 1;
                if (numA > numB) return isAsc ? 1 : -1;
            }

            return compareNames(a, b);
        }
    },
    rarity: {
        id: 'rarity',
        getValue: c => RARITY_ORDER[c.front.rarity?.toLowerCase()] ?? 99,
        autoAsc: false
    },
    color: {
        id: 'color',
        getValue: c => COLOR_ORDER[c.color] ?? 99,
        autoAsc: true
    },
    cmc: {
        id: 'cmc',
        getValue: c => c.front.cmc || 0,
        autoAsc: false
    },
    power: {
        id: 'power',
        getValue: c => {
            if (!c.front.hasOwnProperty('power')) return -1;
            return parseInt(c.front.power) || 0;
        },
        autoAsc: false
    },
    toughness: {
        id: 'toughness',
        getValue: c => {
            if (!c.front.hasOwnProperty('toughness')) return -1;
            return parseInt(c.front.toughness) || 0;
        },
        autoAsc: false
    },
    artist: {
        id: 'artist',
        getValue: c => (c.front.illustrator || '').toLowerCase(),
        autoAsc: true
    }
};

export class ResultSorter {
    compareValues(va, vb, isAsc) {
        if (va < vb) return isAsc ? -1 : 1;
        if (va > vb) return isAsc ? 1 : -1;
        return 0;
    }

    sort(cards, sortType, order) {
        const strategy = STRATEGIES[sortType] || STRATEGIES['name'];
        const isAsc = order === 'auto' ? strategy.autoAsc : order === 'asc';

        return cards.slice().sort((a, b) => {
            if (strategy.compare)
                return strategy.compare(a, b, isAsc);

            return this.compareValues(
                strategy.getValue(a),
                strategy.getValue(b),
                isAsc
            ) || compareNames(a, b);
        });
    }
}
