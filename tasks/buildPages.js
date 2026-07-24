import path from 'path';
import { ensureDir, renderTemplate, writeFile } from './helpers.js';
import { renderFlavorText, renderOracleText } from './renderCardText.js';

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

async function buildSetPages(siteConfig, sets) {
    for (const set of sets) {
        console.log(`  Rendering set page: ${set.setCode}`);
        const html = await renderTemplate('set', {
            site: siteConfig,
            set,
        });
        writeFile(path.join(PATHS.dist, 'sets', set.setCode, 'index.html'), html);

        for (const card of set.cards ?? []) {
            const html = await renderTemplate('card', {
                site: siteConfig,
                set,
                card,
                renderOracleText,
                renderFlavorText
            });
            writeFile(path.join(PATHS.dist, 'sets', set.setCode, card.slug, 'index.html'), html);
        }
    }
}

async function buildSearchPage(siteConfig, sets) {
    console.log('  Rendering search.html');
    const index = buildSearchIndex(sets);
    writeFile(
        path.join(PATHS.dist, 'search-index.json'),
        JSON.stringify({
            thumbnails: siteConfig.thumbnails,
            cards: index
        })
    );
    // Also write a full index with set code for the simulator
    writeFile(
        path.join(PATHS.dist, 'simulator-data.json'),
        JSON.stringify(sets.map(s => ({
            code: s.setCode,
            imageExportPath: s.imageExportPath,
            cards: s.cards.map(c => ({
                name: c.front.name,
                rarity: c.front.rarity,
                image: c.imageExports.front,
                slug: c.slug,
                superType: c.front.superType
            }))
        })))
    );
    const html = await renderTemplate('search', {
        site: siteConfig,
        sets: sets.map(s => ({
            code: s.setCode,
            name: s.title
        }))
    });
    writeFile(path.join(PATHS.dist, 'search', 'index.html'), html);
}

async function buildDeckbuilderPage(siteConfig) {
    console.log('  Rendering deckbuilder.html');
    const html = await renderTemplate('deckbuilder', {
        site: siteConfig,
    });
    writeFile(path.join(PATHS.dist, 'deckbuilder', 'index.html'), html);
}

async function buildSetsIndexPage(siteConfig, sets) {
    console.log(`  Rendering sets index page`);
    const html = await renderTemplate('sets', {
        site: siteConfig,
        sets,
    });
    writeFile(path.join(PATHS.dist, 'sets', 'index.html'), html);
}

async function buildIndex(siteConfig, sets) {
    console.log('  Rendering index.html');
    const html = await renderTemplate('index', {
        site: siteConfig,
        sets: sets.map(s => ({
            code:   s.setCode,
            name:   s.title,
            symbol: s.symbol,
        })),
    });
    writeFile(path.join(PATHS.dist, 'index.html'), html);
}

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

function transformCardData(sets) {
    for (const set of sets) {
        for (const card of set.cards) {
            card.slug = getSlug(card);
            card.color = getColor(card);
        }
    }
}

async function buildSimulatorPage(siteConfig, sets) {
    console.log('  Rendering simulator.html');
    const html = await renderTemplate('simulator', {
        site: siteConfig,
        sets: sets.map(s => ({
            code:   s.setCode,
            name:   s.title,
        })),
    });
    ensureDir(path.join(PATHS.dist, 'simulator'));
    writeFile(path.join(PATHS.dist, 'simulator', 'index.html'), html);
}

export async function buildPages(config, sets) {
    ensureDir(PATHS.dist);
    transformCardData(sets);
    await buildIndex(config, sets);
    await buildSetsIndexPage(config, sets);
    await buildSetPages(config, sets);
    await buildSearchPage(config, sets);
    await buildDeckbuilderPage(config);
    await buildSimulatorPage(config, sets);
}
