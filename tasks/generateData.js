import path from 'path';
import { writeFile } from './helpers.js';

function buildSearchIndex(sets) {
    const cards = [];
    for (const set of sets) {
        for (const card of set.cards ?? []) {
            card.setCode = set.setCode;
            card.imageExportPath = set.imageExportPath;
            cards.push(card);
        }
    }
    return cards;
}

export function generateSearchIndex(siteConfig, sets) {
    writeFile(
        path.join(PATHS.dist, 'search-index.json'),
        JSON.stringify({
            thumbnails: siteConfig.thumbnails,
            cards: buildSearchIndex(sets)
        })
    );
}

export function generateSetManifest(sets) {
    const setData = sets.map(s => ({
        title: s.title,
        code: s.code,
        pack: s.pack,
    }));
    writeFile(
        path.join(PATHS.dist, 'sets.json'),
        JSON.stringify(setData)
    );
}
