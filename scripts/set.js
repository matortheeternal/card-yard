// set.js — sort controls and alt+hover zoom for the set page

const ZOOM_DEFAULT = 360;
const ZOOM_MIN = 200;
const ZOOM_MAX = 700;
const ZOOM_STEP = 40;
const OFFSET_X = 20;
const OFFSET_Y = 20;
const HINT_DELAY = 3000;

const overlay = document.getElementById('card-zoom-overlay');
const zoomImg = document.getElementById('card-zoom-image');
const hint    = document.getElementById('zoom-hint');

let zoomSize = ZOOM_DEFAULT;
let shiftDown  = false;
let activeCard = null;

function showHint() {
    hint.classList.remove('hidden');
    setTimeout(() => hint.classList.add('hidden'), HINT_DELAY);
}

function positionOverlay(e) {
    let x = e.clientX - (zoomSize / 2);
    let y = e.clientY - (zoomSize / 2);

    overlay.style.left = `${x}px`;
    overlay.style.top  = `${y}px`;
}

function showZoom(card, e) {
    const img = card.querySelector('.card-grid-image');
    if (!img) return;
    zoomImg.src = img.src;
    zoomImg.alt = img.alt;
    overlay.style.setProperty('--zoom-size', `${zoomSize}px`);
    overlay.classList.add('visible');
    positionOverlay(e);
}

function hideZoom() {
    overlay.classList.remove('visible');
    activeCard = null;
}

document.addEventListener('keydown', e => {
    if (e.key !== 'Shift') return;
    shiftDown = true;
    showHint();
});

document.addEventListener('keyup', e => {
    if (e.key !== 'Shift') return;
    shiftDown = false;
    hideZoom();
});

document.addEventListener('mousemove', e => {
    if (!shiftDown) return;
    const card = e.target.closest('.card-grid-item');
    if (!card) { hideZoom(); return; }
    activeCard = card;
    showZoom(card, e);
});

document.addEventListener('wheel', e => {
    if (!shiftDown || !overlay.classList.contains('visible')) return;
    e.preventDefault();
    zoomSize = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
        zoomSize + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    ));
    overlay.style.setProperty('--zoom-size', `${zoomSize}px`);
    if (activeCard) positionOverlay(e);
}, { passive: false });

// hide zoom if alt+tab away
window.addEventListener('blur', hideZoom);

const RARITY_ORDER = { mythic: 0, rare: 1, uncommon: 2, common: 3, basic: 4 };
const COLOR_ORDER  = { W: 0, U: 1, B: 2, R: 3, G: 4, M: 5, C: 6, L: 7 };

const sortSelect  = document.getElementById('sort-select');
const orderSelect = document.getElementById('order-select');
const grid        = document.getElementById('card-grid');

function isToken(card) {
    return card.hasAttribute('data-is-token');
}

function getSortValue(card, key) {
    switch (key) {
        case 'name':   return card.dataset.name.toLowerCase();
        case 'rarity': return RARITY_ORDER[card.dataset.rarity] ?? 99;
        case 'color':  return COLOR_ORDER[card.dataset.color] ?? 99;
        case 'cmc':    return parseFloat(card.dataset.cmc) || 0;
        case 'number': return card.dataset.number || '0';
        default:       return 0;
    }
}

function sortCards(keyOverride = null, directionOverride = null) {
    const key   = keyOverride || sortSelect.value;
    const asc   = directionOverride || orderSelect.value === 'asc';
    const cards = [...grid.querySelectorAll('.card-grid-item')];

    cards.sort((a, b) => {
        const aToken = isToken(a);
        const bToken = isToken(b);
        if (aToken && !bToken) return 1;
        if (!aToken && bToken) return -1;
        const av = getSortValue(a, key);
        const bv = getSortValue(b, key);
        if (av < bv) return asc ? -1 : 1;
        if (av > bv) return asc ? 1 : -1;
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

sortSelect.addEventListener('change', () => sortCards());
orderSelect.addEventListener('change', () => sortCards());

document.addEventListener('DOMContentLoaded', function() {
    sortCards('rarity', 'asc');
    sortCards('color', 'asc');
});
