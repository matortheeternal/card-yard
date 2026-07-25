import { ResultSorter } from './search/ResultSorter.js';
import { CardZoom } from './CardZoom.js';

new CardZoom();

const sortSelect  = document.getElementById('sort-select');
const orderSelect = document.getElementById('order-select');
const grid        = document.getElementById('card-grid');
const sorter      = new ResultSorter();

function sortCards(keyOverride = null, directionOverride = null) {
    const key   = keyOverride || sortSelect.value;
    const order = directionOverride || orderSelect.value;
    const items = [...grid.querySelectorAll('.card-grid-item')];

    const cards = items.map(item => ({
        front: {
            name: item.dataset.name,
            rarity: item.dataset.rarity,
            cmc: parseFloat(item.dataset.cmc) || 0,
            collectorNumber: item.dataset.number,
            superType: item.hasAttribute('data-is-token') ? 'token' : ''
        },
        color: item.dataset.color,
        setCode: '',
        element: item
    }));

    const sortedCards = sorter.sort(cards, key, order, { sortTokensLast: true });

    sortedCards.forEach(c => grid.appendChild(c.element));
}

document.addEventListener('DOMContentLoaded', function() {
    if (!sortSelect || !orderSelect) return;
    sortSelect.addEventListener('change', () => sortCards());
    orderSelect.addEventListener('change', () => sortCards());
    sortCards('color', 'asc');
});
