export class SearchUI {
    constructor(callbacks) {
        this.pageSize = 60;
        this.callbacks = callbacks;

        this.grid = document.getElementById('card-grid');
        this.report = document.getElementById('search-report');

        this.pagination = {
            top: document.getElementById('pagination-top'),
            bottom: document.getElementById('pagination-bottom'),
            prevTop: document.getElementById('prev-page-top'),
            nextTop: document.getElementById('next-page-top'),
            prevBottom: document.getElementById('prev-page-bottom'),
            nextBottom: document.getElementById('next-page-bottom')
        };

        this.controls = {
            input: document.getElementById('on-page-search-input'),
            submit: document.getElementById('on-page-search-submit'),
            type: document.getElementById('search-type-select'),
            scope: document.getElementById('scope-select'),
            sort: document.getElementById('sort-order-select'),
            direction: document.getElementById('sort-direction-select')
        };

        this.bindEvents();
    }

    bindEvents() {
        if (this.controls.input) {
            this.controls.input.onkeydown = (e) => {
                if (e.key === 'Enter') this.callbacks.onSearch();
            };
        }
        if (this.controls.submit) {
            this.controls.submit.onclick = () => this.callbacks.onSearch();
        }

        const triggerSearch = () => this.callbacks.onSearch();
        ['type', 'scope', 'sort', 'direction'].forEach(key => {
            if (this.controls[key]) {
                this.controls[key].onchange = triggerSearch;
            }
        });

        const handlePrev = () => this.callbacks.onPageChange(-1);
        const handleNext = () => this.callbacks.onPageChange(1);

        if (this.pagination.prevTop) this.pagination.prevTop.onclick = handlePrev;
        if (this.pagination.nextTop) this.pagination.nextTop.onclick = handleNext;
        if (this.pagination.prevBottom) this.pagination.prevBottom.onclick = handlePrev;
        if (this.pagination.nextBottom) this.pagination.nextBottom.onclick = handleNext;
    }

    getControlValues() {
        return {
            query: this.controls.input?.value.trim() || '',
            type: this.controls.type?.value || 'draftable',
            scope: this.controls.scope?.value || 'all',
            sort: this.controls.sort?.value || 'name',
            direction: this.controls.direction?.value || 'auto'
        };
    }

    setControlValues(values) {
        if (this.controls.input) this.controls.input.value = values.query || '';
        if (this.controls.type) this.controls.type.value = values.type || 'draftable';
        if (this.controls.scope) this.controls.scope.value = values.scope || 'all';
        if (this.controls.sort) this.controls.sort.value = values.sort || 'name';
        if (this.controls.direction) this.controls.direction.value = values.direction || 'auto';
    }

    render(results, currentPage, query, thumbnails) {
        const total = results.length;
        const totalPages = Math.ceil(total / this.pageSize);

        this.updateMeta(total, currentPage, query);

        if (total === 0) {
            this.renderNoResults();
            return;
        }

        const start = (currentPage - 1) * this.pageSize;
        const pageResults = results.slice(start, start + this.pageSize);

        this.renderGrid(pageResults, thumbnails);
        this.updatePagination(currentPage, totalPages);
    }

    updateMeta(total, currentPage, query) {
        if (total === 0) {
            this.report.innerHTML = '';
            return;
        }

        const start = (currentPage - 1) * this.pageSize + 1;
        const end = Math.min(currentPage * this.pageSize, total);
        const countRange = total > this.pageSize ? `${start} – ${end} of ` : '';
        const cardsText = `${total} card${total === 1 ? '' : 's'}`;

        let html = `<strong>${countRange}${cardsText}</strong>`;
        if (query) {
            const escapedQuery = this.escapeHtml(query);
            html += ` <span class="query-display">found matching “${escapedQuery}”</span>`;
        }
        this.report.innerHTML = html;
    }

    renderNoResults() {
        this.grid.innerHTML = '<div class="no-results"><p>No cards found.</p></div>';
        this.togglePagination(false);
    }

    renderGrid(pageResults, thumbnails) {
        this.grid.innerHTML = pageResults.map(card => this.renderCard(card, thumbnails)).join('');
    }

    renderCard(card, thumbnails) {
        const setCode = card.setCode || 'unknown';
        const imageExportPath = card.imageExportPath || `sets/${setCode}/`;
        const collectorNumber = card.front.collectorNumber || card.front.autoCollectorNumber;
        const isToken = /\b(token|emblem)\b/i.test(card.front.superType || '');
        const escapedName = this.escapeHtml(card.front.name);
        const fullImageUrl = `${imageExportPath}${card.imageExports.front}`;

        const displayImageUrl = thumbnails.enabled
            ? `https://wsrv.nl/?url=${encodeURIComponent(fullImageUrl)}&w=${thumbnails.width || 300}&output=webp`
            : fullImageUrl;

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
                <img class="card-grid-image" src="${displayImageUrl}" alt="${escapedName}" loading="lazy" />
            </a>
        `;
    }

    updatePagination(currentPage, totalPages) {
        const hasPagination = totalPages > 1;
        this.togglePagination(hasPagination);

        if (hasPagination) {
            const isFirst = currentPage === 1;
            const isLast = currentPage === totalPages;

            [this.pagination.prevTop, this.pagination.prevBottom].forEach(btn => btn && (btn.disabled = isFirst));
            [this.pagination.nextTop, this.pagination.nextBottom].forEach(btn => btn && (btn.disabled = isLast));
        }
    }

    togglePagination(visible) {
        const display = visible ? 'flex' : 'none';
        if (this.pagination.top) this.pagination.top.style.display = display;
        if (this.pagination.bottom) this.pagination.bottom.style.display = display;
    }

    handleError(message) {
        this.grid.innerHTML = `<div class="no-results"><p>${message}</p></div>`;
        this.report.textContent = '';
        this.togglePagination(false);
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
