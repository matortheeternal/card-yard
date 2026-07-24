/**
 * simulator.js — Client-side logic for the Simulator
 */

let simulatorData = null;

async function loadSimulatorData() {
    try {
        const response = await fetch('simulator-data.json');
        simulatorData = await response.json();
    } catch (error) {
        console.error('Failed to load simulator data:', error);
    }
}

function getRandomElements(array, count) {
    const elements = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * array.length);
        elements.push(array[randomIndex]);
    }
    return elements;
}

function groupCardsByRarity(cards) {
    const commons = [];
    const uncommons = [];
    const rares = [];
    for (const card of cards) {
        const rarity = card.rarity.toLowerCase();
        if (rarity === 'common') commons.push(card);
        if (rarity === 'uncommon') uncommons.push(card);
        if (rarity === 'rare' || rarity === 'mythic')
            rares.push(card);
    }
    return { commons, uncommons, rares };
}

function simulatePack(setCode) {
    if (!simulatorData) return null;

    const setData = simulatorData.find(s => s.code === setCode);
    if (!setData) return null;

    const cards = setData.cards.filter(c => {
        return !/\b(token|emblem|basic land)\b/i.test(c.superType || '');
    });

    const { commons, uncommons, rares } = groupCardsByRarity(cards);

    if (commons.length < 9 || uncommons.length < 5 || rares.length < 1) {
        alert('Not enough cards in this set to simulate a pack with the current distribution (9C, 5U, 1R/M).');
        return null;
    }

    const pack = [
        ...getRandomElements(commons, 9),
        ...getRandomElements(uncommons, 5),
        ...getRandomElements(rares, 1)
    ];

    return { pack, imageExportPath: setData.imageExportPath };
}

function renderPack(packData) {
    const resultsContainer = document.getElementById('pack-results');
    resultsContainer.innerHTML = '';

    const { pack, imageExportPath } = packData;

    pack.forEach(card => {
        const cardLink = document.createElement('a');
        cardLink.className = 'card-grid-item';
        cardLink.href = `sets/${document.getElementById('set-select').value}/${card.slug}`;

        const img = document.createElement('img');
        img.className = 'card-grid-image';
        img.src = `${imageExportPath}${card.image}`;
        img.alt = card.name;
        img.loading = 'lazy';

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
