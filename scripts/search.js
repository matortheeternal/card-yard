import Sifter from 'sigil-sifter';
import Magic from '@sigil-sifter/magic';
import CardMagicianMagic from '@sigil-sifter/magic-cm';

const PAGE_SIZE = 60;

class SearchManager {
    constructor() {
        this.sifter = new Sifter();
        Magic(this.sifter);
        CardMagicianMagic(this.sifter);

        this.cards = [];
        this.thumbnails = { enabled: false, width: 300 };
        this.results = [];
        this.currentPage = 1;
        this.query = '';

        this.grid = document.getElementById('card-grid');
        this.report = document.getElementById('search-report');

        this.paginationTop = document.getElementById('pagination-top');
        this.prevBtnTop = document.getElementById('prev-page-top');
        this.nextBtnTop = document.getElementById('next-page-top');

        this.paginationBottom = document.getElementById('pagination-bottom');
        this.prevBtnBottom = document.getElementById('prev-page-bottom');
        this.nextBtnBottom = document.getElementById('next-page-bottom');

        this.onPageInput = document.getElementById('on-page-search-input');
        this.onPageSubmit = document.getElementById('on-page-search-submit');
        this.typeSelect = document.getElementById('search-type-select');
        this.scopeSelect = document.getElementById('scope-select');
        this.sortSelect = document.getElementById('sort-order-select');
        this.directionSelect = document.getElementById('sort-direction-select');

        if (this.onPageInput) {
            this.onPageInput.onkeydown = (e) => {
                if (e.key === 'Enter') this.triggerSearch();
            };
        }
        if (this.onPageSubmit) {
            this.onPageSubmit.onclick = () => this.triggerSearch();
        }
        if (this.typeSelect) {
            this.typeSelect.onchange = () => this.triggerSearch();
        }
        if (this.scopeSelect) {
            this.scopeSelect.onchange = () => this.triggerSearch();
        }
        if (this.sortSelect) {
            this.sortSelect.onchange = () => this.triggerSearch();
        }
        if (this.directionSelect) {
            this.directionSelect.onchange = () => this.triggerSearch();
        }

        const handlePrev = () => this.goToPage(this.currentPage - 1);
        const handleNext = () => this.goToPage(this.currentPage + 1);

        this.prevBtnTop.onclick = handlePrev;
        this.nextBtnTop.onclick = handleNext;
        this.prevBtnBottom.onclick = handlePrev;
        this.nextBtnBottom.onclick = handleNext;

        this.init();
    }

    triggerSearch() {
        const query = this.onPageInput.value.trim();
        const type = this.typeSelect ? this.typeSelect.value : 'draftable';
        const scope = this.scopeSelect ? this.scopeSelect.value : 'all';
        const sort = this.sortSelect ? this.sortSelect.value : 'name';
        const order = this.directionSelect ? this.directionSelect.value : 'auto';

        const url = new URL(window.location);
        url.searchParams.set('q', query);
        url.searchParams.set('page', '1');

        if (type && type !== 'draftable') {
            url.searchParams.set('type', type);
        } else {
            url.searchParams.delete('type');
        }

        if (scope && scope !== 'all') {
            url.searchParams.set('set', scope);
        } else {
            url.searchParams.delete('set');
        }

        if (sort && sort !== 'name') {
            url.searchParams.set('sort', sort);
        } else {
            url.searchParams.delete('sort');
        }

        if (order && order !== 'auto') {
            url.searchParams.set('order', order);
        } else {
            url.searchParams.delete('order');
        }

        window.history.pushState({}, '', url);
        this.query = query;
        this.currentPage = 1;
        this.currentType = type;
        this.currentSet = scope;
        this.currentSort = sort;
        this.currentOrder = order;
        this.performSearch();
    }

    async init() {
        this.parseUrlParams();

        try {
            await this.loadSearchIndex();
            this.performSearch();
        } catch (err) {
            this.handleLoadError(err);
        }
    }

    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.query = params.get('q') || '';
        this.currentPage = parseInt(params.get('page')) || 1;
        this.currentType = params.get('type') || 'draftable';
        this.currentSet = params.get('set') || 'all';
        this.currentSort = params.get('sort') || 'name';
        this.currentOrder = params.get('order') || 'auto';

        if (this.onPageInput) {
            this.onPageInput.value = this.query;
        }
        if (this.typeSelect) {
            this.typeSelect.value = this.currentType;
        }
        if (this.scopeSelect) {
            this.scopeSelect.value = this.currentSet;
        }
        if (this.sortSelect) {
            this.sortSelect.value = this.currentSort;
        }
        if (this.directionSelect) {
            this.directionSelect.value = this.currentOrder;
        }
    }

    async loadSearchIndex() {
        const response = await fetch('search-index.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        this.cards = data.cards;
        if (data.thumbnails) {
            this.thumbnails = data.thumbnails;
        }
    }

    handleLoadError(err) {
        console.error('Failed to load search index:', err);
        this.grid.innerHTML = '<div class="no-results"><p>Error loading search index.</p></div>';
    }

    performSearch() {
        let cards = this.cards;

        // Filter by draftable if applicable
        if (this.currentType === 'draftable') {
            cards = cards.filter(c => {
                const superType = c.front.superType || '';
                return !/\b(basic land|token|emblem)\b/i.test(superType);
            });
        }

        // Filter by set if applicable
        if (this.currentSet && this.currentSet !== 'all') {
            cards = cards.filter(c => c.setCode === this.currentSet);
        }

        if (!this.query.trim()) {
            this.results = this.sortResults(cards);
            this.render();
            return;
        }

        try {
            const searchResults = this.sifter.filter(cards, this.query);
            this.results = this.sortResults(searchResults);
            this.render();
        } catch (err) {
            this.handleSearchError(err);
        }
    }

    sortResults(cards) {
        const sort = this.currentSort || 'name';
        const order = this.currentOrder || 'auto';

        // Scryfall's "Auto" depends on the sort type.
        // For name, auto is asc. For mana value, power, toughness, etc., it's usually desc or depends.
        // Let's keep it simple: asc unless it's rarity or mana value or power or toughness, or explicitly desc.
        let isAsc = order === 'asc' || order === 'auto';
        if (order === 'auto') {
            if (['rarity', 'cmc', 'power', 'toughness'].includes(sort)) {
                isAsc = false;
            }
        }

        const RARITY_ORDER = { mythic: 0, rare: 1, uncommon: 2, common: 3, basic: 4, special: 5, bonus: 6 };
        const COLOR_ORDER = { W: 0, U: 1, B: 2, R: 3, G: 4, M: 5, C: 6, L: 7 };

        return [...cards].sort((a, b) => {
            let va, vb;
            switch (sort) {
                case 'number':
                    va = parseInt(a.front.collectorNumber || a.front.autoCollectorNumber || '0');
                    vb = parseInt(b.front.collectorNumber || b.front.autoCollectorNumber || '0');
                    if (va === vb) {
                        va = a.setCode;
                        vb = b.setCode;
                    }
                    break;
                case 'rarity':
                    va = RARITY_ORDER[a.front.rarity?.toLowerCase()] ?? 99;
                    vb = RARITY_ORDER[b.front.rarity?.toLowerCase()] ?? 99;
                    break;
                case 'color':
                    va = COLOR_ORDER[a.color] ?? 99;
                    vb = COLOR_ORDER[b.color] ?? 99;
                    break;
                case 'cmc':
                    va = a.front.manaCost?.cmc || 0;
                    vb = b.front.manaCost?.cmc || 0;
                    break;
                case 'power':
                    va = parseInt(a.front.power) || 0;
                    vb = parseInt(b.front.power) || 0;
                    break;
                case 'toughness':
                    va = parseInt(a.front.toughness) || 0;
                    vb = parseInt(b.front.toughness) || 0;
                    break;
                case 'artist':
                    va = (a.front.illustrator || '').toLowerCase();
                    vb = (b.front.illustrator || '').toLowerCase();
                    break;
                case 'name':
                default:
                    va = a.front.name.toLowerCase();
                    vb = b.front.name.toLowerCase();
                    break;
            }

            if (va < vb) return isAsc ? -1 : 1;
            if (va > vb) return isAsc ? 1 : -1;

            // Tie-breaker: name
            if (sort !== 'name') {
                const na = a.front.name.toLowerCase();
                const nb = b.front.name.toLowerCase();
                if (na < nb) return -1;
                if (na > nb) return 1;
            }
            return 0;
        });
    }

    handleSearchError(err) {
        console.error('Search error:', err);
        this.grid.innerHTML = `<div class="no-results"><p>Invalid search query: ${err.message}</p></div>`;
        this.report.textContent = '';
        this.paginationTop.style.display = 'none';
        this.paginationBottom.style.display = 'none';
    }

    render() {
        this.clampCurrentPage();
        const pageResults = this.getCurrentPageResults();

        this.updateMeta();

        if (this.results.length === 0) {
            this.renderNoResults();
            return;
        }

        this.renderGrid(pageResults);
        this.updatePagination();

        // Re-initialize zoom if set.js is loaded and has that functionality
        if (window.initZoom) window.initZoom();
    }

    clampCurrentPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) this.currentPage = 1;
    }

    getTotalPages() {
        return Math.ceil(this.results.length / PAGE_SIZE);
    }

    getCurrentPageResults() {
        const start = (this.currentPage - 1) * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, this.results.length);
        return this.results.slice(start, end);
    }

    updateMeta() {
        const total = this.results.length;
        if (total === 0) {
            this.report.innerHTML = '';
            return;
        }

        const start = (this.currentPage - 1) * PAGE_SIZE + 1;
        const end = Math.min(this.currentPage * PAGE_SIZE, total);
        const countRange = total > PAGE_SIZE ? `${start} – ${end} of ` : '';
        const cardsText = `${total} card${total === 1 ? '' : 's'}`;

        let html = `<strong>${countRange}${cardsText}</strong>`;
        if (this.query) {
            const escapedQuery = this.query
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            html += ` <span class="query-display">found matching “${escapedQuery}”</span>`;
        }
        this.report.innerHTML = html;
    }

    renderNoResults() {
        this.grid.innerHTML = '<div class="no-results"><p>No cards found.</p></div>';
        this.paginationTop.style.display = 'none';
        this.paginationBottom.style.display = 'none';
    }

    renderGrid(pageResults) {
        this.grid.innerHTML = pageResults.map(card => this.renderCard(card)).join('');
    }

    renderCard(card) {
        const setCode = card.setCode || 'unknown';
        const imageExportPath = card.imageExportPath || `sets/${setCode}/`;
        const collectorNumber = card.front.collectorNumber || card.front.autoCollectorNumber;
        const isToken = /\b(token|emblem)\b/i.test(card.front.superType || '');
        const escapedName = card.front.name.replace(/"/g, '&quot;');
        const fullImageUrl = `${imageExportPath}${card.imageExports.front}`;

        let displayImageUrl = fullImageUrl;
        if (this.thumbnails.enabled) {
            const width = this.thumbnails.width || 300;
            displayImageUrl = `https://wsrv.nl/?url=${encodeURIComponent(fullImageUrl)}&w=${width}&output=webp`;
        }

        return `
            <a class="card-grid-item"
               href="sets/${setCode}/${card.slug}"
               data-name="${escapedName}"
               data-color="${card.color}"
               data-rarity="${card.front.rarity}"
               data-cost="${card.front.manaCost?.join?.('') || ''}"
               data-number="${collectorNumber}"
               data-image-full="${fullImageUrl}"
               ${isToken ? 'data-is-token' : ''} >
                <img
                    class="card-grid-image"
                    src="${displayImageUrl}"
                    alt="${escapedName}"
                    loading="lazy"
                />
            </a>
        `;
    }

    updatePagination() {
        const totalPages = this.getTotalPages();
        const hasPagination = totalPages > 1;

        this.paginationTop.style.display = hasPagination ? 'flex' : 'none';
        this.paginationBottom.style.display = hasPagination ? 'flex' : 'none';

        if (hasPagination) {
            const isFirst = this.currentPage === 1;
            const isLast = this.currentPage === totalPages;

            this.prevBtnTop.disabled = isFirst;
            this.nextBtnTop.disabled = isLast;
            this.prevBtnBottom.disabled = isFirst;
            this.nextBtnBottom.disabled = isLast;
        }
    }

    goToPage(page) {
        this.currentPage = page;
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
        this.render();
        window.scrollTo(0, 0);
    }
}

new SearchManager();
