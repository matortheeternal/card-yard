const RARITY_ORDER = {
    special: 0,
    mythic: 1,
    rare: 2,
    uncommon: 3,
    common: 4
};

export const MONO_COLORS = ['W', 'U', 'B', 'R', 'G'];
export const ALLY_COLOR_PAIRS = ['UW', 'BU', 'BR', 'GR', 'GW'];
export const ENEMY_COLOR_PAIRS = ['BW', 'RU', 'BG', 'RW', 'GU'];

export function isLand(card) {
    return /\bland\b/i.test(card.front.superType || '');
}

export function isCreature(card) {
    return /\bcreature\b/i.test(card.front.superType || '');
}

export function isArtifact(card) {
    return /\bartifact\b/i.test(card.front.superType || '');
}

export function isEnchantment(card) {
    return /\benchantment\b/i.test(card.front.superType || '');
}

export function isBasicLand(card) {
    return /\bbasic land\b/i.test(card.front.superType || '');
}

export function isTokenOrEmblem(card) {
    return /\b(token|emblem)\b/i.test(card.front.superType || '');
}

export function getColors(card) {
    return card.color || '';
}

function compareBoolean(a, b, test) {
    const av = test(a);
    const bv = test(b);
    if (av && !bv) return -1;
    if (!av && bv) return 1;
    return 0;
}

function compareNumber(a, b, getValue, reversed = false) {
    const av = getValue(a);
    const bv = getValue(b);
    return reversed ? bv - av : av - bv;
}

export function sortCards(cards) {
    return cards.sort((a, b) => {
        return compareNumber(a, b, c => {
                return RARITY_ORDER[c.front.rarity || 'common'] ?? 99;
            })
            || compareBoolean(a, b, isCreature)
            || compareBoolean(a, b, isArtifact)
            || compareBoolean(a, b, isEnchantment)
            || compareNumber(a, b, c => c.front.cmc || 0, true)
            || (a.front.name || '').localeCompare(b.front.name || '');
    });
}

export function sortByNumber(cards) {
    return cards.sort((a, b) => {
        return compareNumber(a, b, c => c.front.collectorNumber);
    });
}
