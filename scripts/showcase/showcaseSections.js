import {
    isBasicLand,
    isLand,
    isExtraCard,
    MONO_COLORS, ALLY_COLOR_PAIRS, ENEMY_COLOR_PAIRS
} from './helpers.js';
import Section from './ShowcaseSection.js';

export default [
    new Section('Mono-color',
        c => !isLand(c)
            && !isExtraCard(c)
            && c.color.length === 1
            && MONO_COLORS.includes(c.color),
        ['W', 'U', 'B', 'R', 'G']
    ),

    new Section('Multicolor Pairs (Ally)',
        c => !isLand(c)
            && !isExtraCard(c)
            && c.color.length === 2
            && ALLY_COLOR_PAIRS.includes(c.color),
        ALLY_COLOR_PAIRS
    ),

    new Section('Multicolor Pairs (Enemy)',
        c => !isLand(c)
            && !isExtraCard(c)
            && c.color.length === 2
            && ENEMY_COLOR_PAIRS.includes(c.color),
        ENEMY_COLOR_PAIRS
    ),

    new Section('Multicolor (3+ colors)',
        c => !isLand(c)
            && !isExtraCard(c)
            && c.color.length >= 3,
        null, true
    ),

    new Section('Colorless',
        c => !isLand(c)
            && !isExtraCard(c)
            && c.color.length === 0,
        null, true
    ),

    new Section('Mono-color Lands',
        c => isLand(c)
            && !isBasicLand(c)
            && c.color.length === 1
            && MONO_COLORS.includes(c.color),
        ['W', 'U', 'B', 'R', 'G']
    ),

    new Section('Multicolor Lands (Ally)',
        c => isLand(c)
            && !isBasicLand(c)
            && c.color.length === 2
            && ALLY_COLOR_PAIRS.includes(c.color),
        ALLY_COLOR_PAIRS
    ),

    new Section('Multicolor Lands (Enemy)',
        c => isLand(c)
            && !isBasicLand(c)
            && c.color.length === 2
            && ENEMY_COLOR_PAIRS.includes(c.color),
        ENEMY_COLOR_PAIRS
    ),

    new Section('Other Lands',
        c => isLand(c)
            && !isBasicLand(c)
            && (c.color.length >= 3 || c.color.length === 0),
        null, true
    ),

    new Section('Basic Lands',
        c => isBasicLand(c) && !isExtraCard(c),
        ['W', 'U', 'B', 'R', 'G']
    ),

    new Section('Tokens and Extras',
        c => isExtraCard(c),
        null, true
    )
];
