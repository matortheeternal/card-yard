import path from 'path';
import {
    ensureDir,
    renderTemplate,
    writeFile
} from './helpers.js';
import { renderFlavorText, renderOracleText } from './renderCardText.js';
import { transformCardData } from './transformCardData.js';
import { generateSearchIndex, generateSetManifest } from './generateData.js';
import { renderMarkdownTemplate } from './renderMarkdown.js';

function buildSetCardPages(siteConfig, set) {
    const cardsPath = path.join(PATHS.dist, 'sets', set.setCode, 'cards');
    const html = renderTemplate('set', {
        site: siteConfig,
        set,
    });
    writeFile(path.join(cardsPath, 'index.html'), html);

    for (const card of set.cards ?? []) {
        const html = renderTemplate('card', {
            site: siteConfig,
            set,
            card,
            renderOracleText,
            renderFlavorText
        });
        writeFile(path.join(cardsPath, card.slug, 'index.html'), html);
    }
}

async function buildSetSupplementalPages(siteConfig, set) {
    const setPath = path.join(PATHS.dist, 'sets', set.setCode);
    for (const page of set.pages || []) {
        const html = await renderMarkdownTemplate(page, {
            site: siteConfig,
            set
        });
        writeFile(path.join(setPath, page.name, 'index.html'), html);
    }
}

async function buildSetPages(siteConfig, sets) {
    for (const set of sets) {
        console.log(`  Rendering set page: ${set.setCode}`);
        await buildSetSupplementalPages(siteConfig, set);
        buildSetCardPages(siteConfig, set);
    }
}

function buildSearchPage(siteConfig, sets) {
    console.log('  Rendering search.html');
    const html = renderTemplate('search', {
        site: siteConfig,
        sets: sets.map(s => ({
            code: s.setCode,
            name: s.title
        }))
    });
    writeFile(path.join(PATHS.dist, 'search', 'index.html'), html);
}

function buildDeckbuilderPage(siteConfig) {
    console.log('  Rendering deckbuilder.html');
    const html = renderTemplate('deckbuilder', {
        site: siteConfig,
    });
    writeFile(path.join(PATHS.dist, 'deckbuilder', 'index.html'), html);
}

function buildSetsIndexPage(siteConfig, sets) {
    console.log(`  Rendering sets index page`);
    const html = renderTemplate('sets', {
        site: siteConfig,
        sets,
    });
    writeFile(path.join(PATHS.dist, 'sets', 'index.html'), html);
}

function buildIndex(siteConfig, sets) {
    console.log('  Rendering index.html');
    const html = renderTemplate('index', {
        site: siteConfig,
        sets: sets.map(s => ({
            code: s.setCode,
            name: s.title,
            symbol: s.symbol,
        })),
    });
    writeFile(path.join(PATHS.dist, 'index.html'), html);
}

function buildSimulatorPage(siteConfig, sets) {
    console.log('  Rendering simulator.html');
    const html = renderTemplate('simulator', {
        site: siteConfig,
        sets: sets.map(s => ({
            code: s.setCode,
            name: s.title,
        })),
    });
    ensureDir(path.join(PATHS.dist, 'simulator'));
    writeFile(path.join(PATHS.dist, 'simulator', 'index.html'), html);
}

function buildRandomPage(siteConfig) {
    console.log('  Rendering random.html');
    const html = renderTemplate('random', {
        site: siteConfig,
    });
    ensureDir(path.join(PATHS.dist, 'random'));
    writeFile(path.join(PATHS.dist, 'random', 'index.html'), html);
}

export async function buildPages(config, sets) {
    ensureDir(PATHS.dist);
    transformCardData(sets);
    generateSearchIndex(config, sets);
    generateSetManifest(sets);
    buildIndex(config, sets);
    buildSetsIndexPage(config, sets);
    await buildSetPages(config, sets);
    buildSearchPage(config, sets);
    buildDeckbuilderPage(config);
    buildSimulatorPage(config, sets);
    buildRandomPage(config);
}
