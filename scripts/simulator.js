import { CardZoom } from './CardZoom.js';
import { SearchEngine } from './search/SearchEngine.js';
import SheetManager from './simulator/SheetManager.js';
import RunsManager from './simulator/RunsManager.js';

let sets = null;
let cardData = null;
new CardZoom();
const engine = new SearchEngine();
const manager = new SheetManager();
const runs = new RunsManager();

async function loadSimulatorData() {
    try {
        const searchData = await fetch('search-index.json');
        const setData = await fetch('sets.json');
        cardData = await searchData.json();
        sets = await setData.json();
    } catch (error) {
        console.error('Failed to load simulator data:', error);
    }
}

const collationStrategies = {
    random: function(pack, count, poolEntries, cards) {
        let pool = [];
        poolEntries.forEach(entry => {
            const matchingCards = engine.filter(cards, entry.expression);
            for (let i = 0; i < entry.weight; i++)
                pool.push(matchingCards);
        });
        pool = pool.flat();
        for (let i = 0; i < count; i++) {
            let index = Math.floor(Math.random() * pool.length);
            pack.push(pool[index]);
        }
    },
    uniqueRandom: function(pack, count, pool, cards) {},
    sheet: function(pack, count, pool, cards) {
        for (let i = 0; i < count; i++) {
            const card = manager.getNextCard(pool, cards);
            pack.push(card);
        }
    },
    runs: function(pack, count, pool, cards) {
        for (let i = 0; i < count; i++) {
            const card = runs.getNextCard(pool, cards, count);
            pack.push(card);
        }
    },
};

function simulatePack(setCode) {
    if (!sets || !cardData) return null;
    const pack = [];
    const set = sets.find(set => set.code === setCode);
    const cards = cardData.cards.filter(c => c.setCode === setCode);
    set.pack.forEach(slot => {
        const strategy = collationStrategies[slot.strategy];
        strategy(pack, Number(slot.count), slot.pool, cards);
    });
    return pack;
}

function renderPack(pack) {
    const resultsContainer = document.getElementById('pack-results');
    resultsContainer.innerHTML = '';

    pack.forEach(card => {
        const cardLink = document.createElement('a');
        cardLink.className = 'card-grid-item';
        cardLink.href = `sets/${document.getElementById('set-select').value}/${card.slug}`;

        const img = document.createElement('img');
        img.className = 'card-grid-image';
        img.src = `${card.imageExportPath}${card.image}`;
        img.alt = card.name;
        img.loading = 'lazy';

        cardLink.dataset.imageFull = `${imageExportPath}${card.image}`;

        cardLink.appendChild(img);
        resultsContainer.appendChild(cardLink);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSimulatorData();

    const openPackBtn = document.getElementById('open-pack-btn');
    const setSelect = document.getElementById('set-select');

    openPackBtn.addEventListener('click', () => {
        const setCode = setSelect.value;
        if (!setCode) {
            alert('Please select a set first.');
            return;
        }

        const packData = simulatePack(setCode);
        if (packData) {
            renderPack(packData);
        }
    });
});
