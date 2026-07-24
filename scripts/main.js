class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <button type="button" class="search-toggle-text" aria-label="Open search">
                Search
            </button>
        `;

        // Create modal element if it doesn't exist
        if (!document.getElementById('global-search-modal')) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'global-search-modal';
            this.modalContainer.innerHTML = `
                <div class="search-modal" aria-hidden="true">
                    <div class="search-modal-backdrop"></div>
                    <div class="search-modal-content">
                        <input type="text" class="search-modal-input" placeholder="Search cards..." aria-label="Search cards">
                        <div class="search-modal-hint">
                            <p>Press Enter to search, Esc to close</p>
                            <p>This search supports
                                <a href="https://scryfall.com/docs/syntax">Scryfall syntax</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.modalContainer);
        } else {
            this.modalContainer = document.getElementById('global-search-modal');
        }

        this.toggle = this.querySelector('.search-toggle-text');
        this.modal = this.modalContainer.querySelector('.search-modal');
        this.backdrop = this.modalContainer.querySelector('.search-modal-backdrop');
        this.input = this.modalContainer.querySelector('.search-modal-input');

        this.toggle.onclick = () => this.open();
        this.backdrop.onclick = () => this.close();

        this.input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const query = this.input.value.trim();
                if (query) {
                    window.location.href = `search/?q=${encodeURIComponent(query)}`;
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        };
    }

    open() {
        this.modal.classList.add('visible');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.input.focus(), 10);
    }

    close() {
        this.modal.classList.remove('visible');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

customElements.define('ca-search-bar', SearchBar);
