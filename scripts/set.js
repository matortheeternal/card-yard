import { ResultSorter } from './ResultSorter.js';
import { CardZoom } from './CardZoom.js';
import { ShowcaseOrder } from './showcase/ShowcaseOrder.js';

new CardZoom();

const sortSelect  = document.getElementById('sort-select');
const orderSelect = document.getElementById('order-select');
const grid        = document.getElementById('card-grid');
const sorter      = new ResultSorter();
const showcase    = new ShowcaseOrder();

if (sortSelect && !Array.from(sortSelect.options).some(o => o.value === 'showcase')) {
    const option = document.createElement('option');
    option.value = 'showcase';
    option.textContent = 'Showcase';
    sortSelect.insertBefore(option, sortSelect.firstChild);
}

function sortCards(keyOverride = null, directionOverride = null) {
    const key   = keyOverride || sortSelect.value;
    const order = directionOverride || orderSelect.value;
    const items = Array.from(document.querySelectorAll('.card-grid-item'))

    const cards = items.map(item => ({
        front: {
            name: item.dataset.name,
            rarity: item.dataset.rarity,
            cmc: parseFloat(item.dataset.cmc) || 0,
            collectorNumber: item.dataset.number,
            superType: item.dataset.type || ''
        },
        color: (item.dataset.color || '').split('').sort().join(''),
        setCode: '',
        element: item
    }));

    if (key === 'showcase') {
        const structuredData = showcase.build(cards);
        grid.innerHTML = showcase.render(structuredData);
        grid.classList.add('is-showcase');
        return;
    }

    grid.classList.remove('is-showcase');
    const sortedCards = sorter.sort(cards, key, order, { sortTokensLast: true });

    grid.innerHTML = '';
    sortedCards.forEach(c => grid.appendChild(c.element));
}

document.addEventListener('DOMContentLoaded', function() {
    if (!sortSelect || !orderSelect) return;
    sortSelect.addEventListener('change', () => sortCards());
    orderSelect.addEventListener('change', () => sortCards());
    sortCards('showcase', 'asc');
});
