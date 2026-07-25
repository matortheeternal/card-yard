import { SearchEngine } from './SearchEngine.js';
import { ResultSorter } from './ResultSorter.js';
import { SearchUI } from './SearchUI.js';
import { CardZoom } from '../CardZoom.js';

export class SearchManager {
    constructor() {
        this.engine = new SearchEngine();
        this.sorter = new ResultSorter();
        this.zoom = new CardZoom();
        this.ui = new SearchUI({
            onSearch: () => this.handleSearchTrigger(),
            onPageChange: (delta) => this.handlePageChange(delta)
        });

        this.cards = [];
        this.thumbnails = { enabled: false, width: 300 };
        this.results = [];
        this.state = {
            query: '',
            currentPage: 1,
            type: 'draftable',
            scope: 'all',
            sort: 'name',
            direction: 'auto'
        };

        this.init();
        this.bindPopState();
    }

    bindPopState() {
        window.onpopstate = () => {
            this.parseUrlParams();
            this.ui.setControlValues(this.state);
            this.performSearch();
        };
    }

    async init() {
        this.parseUrlParams();
        this.ui.setControlValues(this.state);

        try {
            await this.loadSearchIndex();
            this.performSearch();
        } catch (err) {
            console.error('Failed to load search index:', err);
            this.ui.handleError('Error loading search index.');
        }
    }

    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        this.state = {
            query: params.get('q') || '',
            currentPage: parseInt(params.get('page')) || 1,
            type: params.get('type') || 'draftable',
            scope: params.get('set') || 'all',
            sort: params.get('sort') || 'name',
            direction: params.get('order') || 'auto'
        };
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

    handleSearchTrigger() {
        const values = this.ui.getControlValues();
        this.state = {
            ...this.state,
            ...values,
            currentPage: 1
        };

        this.updateUrl();
        this.performSearch();
    }

    handlePageChange(delta) {
        const newPage = this.state.currentPage + delta;
        const totalPages = Math.ceil(this.results.length / this.ui.pageSize);

        if (newPage >= 1 && newPage <= totalPages) {
            this.state.currentPage = newPage;
            this.updateUrl();
            this.ui.render(this.results, this.state.currentPage, this.state.query, this.thumbnails);
            window.scrollTo(0, 0);
        }
    }

    updateUrl() {
        const url = new URL(window.location);
        url.searchParams.set('q', this.state.query);
        url.searchParams.set('page', this.state.currentPage);

        this.setParam(url, 'type', this.state.type, 'draftable');
        this.setParam(url, 'set', this.state.scope, 'all');
        this.setParam(url, 'sort', this.state.sort, 'name');
        this.setParam(url, 'order', this.state.direction, 'auto');

        window.history.pushState({}, '', url);
    }

    setParam(url, key, value, defaultValue) {
        if (value && value !== defaultValue) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    }

    performSearch() {
        try {
            const filtered = this.engine.filter(
                this.cards,
                this.state.query,
                this.state.type,
                this.state.scope
            );

            this.results = this.sorter.sort(
                filtered,
                this.state.sort,
                this.state.direction
            );

            this.ui.render(
                this.results,
                this.state.currentPage,
                this.state.query,
                this.thumbnails
            );
        } catch (err) {
            console.error('Search error:', err);
            this.ui.handleError(`Invalid search query: ${err.message}`);
        }
    }
}
