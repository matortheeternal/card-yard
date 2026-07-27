function getSlug(card) {
    return card.baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function getColor(card) {
    const colors = [
        ...(card.front?.colors || []),
        ...(card.back?.colors || [])
    ]
    if (/\bland\b/i.test(card.front.superType)) return 'L';
    if (colors.length === 0) return 'C';
    if (colors.length === 1) return colors[0].char.toUpperCase();
    return 'M';
}

function getColors(card) {
    const colors = [
        ...(card.front?.colors || []),
        ...(card.back?.colors || [])
    ].map(c => c.char);
    return colors.sort().join('').toUpperCase();
}

function computeCmc(face) {
    if (!face || !face.manaCost || !Array.isArray(face.manaCost)) return 0;
    return face.manaCost.reduce((acc, symbol) => {
        if (typeof symbol === 'number') return acc + symbol;
        if (typeof symbol === 'string') {
            if (symbol.toLowerCase() === 'x') return acc;
            const num = parseInt(symbol);
            if (!isNaN(num)) return acc + num;
            return acc + 1;
        }
        return acc;
    }, 0);
}

export function transformCardData(sets) {
    for (const set of sets) {
        for (const card of set.cards) {
            card.slug = getSlug(card);
            card.color = getColor(card);
            card.colors = getColors(card);
            if (card.front) card.front.cmc = computeCmc(card.front);
            if (card.back) card.back.cmc = computeCmc(card.back);
        }
    }
}
