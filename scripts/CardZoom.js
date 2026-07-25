const ZOOM_DEFAULT = 360;
const ZOOM_MIN = 200;
const ZOOM_MAX = 700;
const ZOOM_STEP = 40;
const HINT_DELAY = 3000;

export class CardZoom {
    constructor() {
        this.overlay = document.getElementById('card-zoom-overlay');
        this.zoomImg = document.getElementById('card-zoom-image');
        this.hint = document.getElementById('zoom-hint');

        if (!this.overlay || !this.zoomImg) return;

        this.zoomSize = ZOOM_DEFAULT;
        this.shiftDown = false;
        this.activeCard = null;
        this.hoveredCard = null;
        this.currentLoadUrl = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', e => {
            if (e.key !== 'Shift') return;
            this.shiftDown = true;
            this.showHint();

            if (this.hoveredCard) {
                this.activeCard = this.hoveredCard;
                this.showZoom(this.hoveredCard, { clientX: this.lastMouseX, clientY: this.lastMouseY });
            }
        });

        document.addEventListener('keyup', e => {
            if (e.key !== 'Shift') return;
            this.shiftDown = false;
            this.hideZoom();
        });

        document.addEventListener('mousemove', e => {
            if (!e.target) return;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;

            const card = e.target.closest('.card-grid-item');
            this.hoveredCard = card;

            if (!this.shiftDown) return;
            if (!card) { this.hideZoom(); return; }
            this.activeCard = card;
            this.showZoom(card, e);
        });

        document.addEventListener('wheel', e => {
            if (!this.shiftDown || !this.overlay.classList.contains('visible')) return;
            e.preventDefault();
            this.zoomSize = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
                this.zoomSize + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
            ));
            this.overlay.style.setProperty('--zoom-size', `${this.zoomSize}px`);
            if (this.activeCard) this.positionOverlay(e);
        }, { passive: false });

        window.addEventListener('blur', () => this.hideZoom());
    }

    showHint() {
        if (!this.hint) return;
        this.hint.classList.remove('hidden');
        setTimeout(() => this.hint.classList.add('hidden'), HINT_DELAY);
    }

    positionOverlay(e) {
        let x = e.clientX - (this.zoomSize / 2);
        let y = e.clientY - (this.zoomSize / 2);

        this.overlay.style.left = `${x}px`;
        this.overlay.style.top = `${y}px`;
    }

    showZoom(card, e) {
        const img = card.querySelector('.card-grid-image');
        if (!img) return;

        const fullSrc = card.dataset.imageFull;
        const thumbSrc = img.src;

        this.zoomImg.src = thumbSrc;
        this.zoomImg.alt = img.alt;
        this.zoomImg.classList.add('loading');

        if (fullSrc && fullSrc !== thumbSrc) {
            this.currentLoadUrl = fullSrc;
            const loader = new Image();
            loader.onload = () => {
                if (this.currentLoadUrl === fullSrc) {
                    this.zoomImg.src = fullSrc;
                    this.zoomImg.classList.remove('loading');
                }
            };
            loader.src = fullSrc;
        } else {
            this.zoomImg.classList.remove('loading');
        }

        this.overlay.style.setProperty('--zoom-size', `${this.zoomSize}px`);
        this.overlay.classList.add('visible');
        this.positionOverlay(e);
    }

    hideZoom() {
        this.overlay.classList.remove('visible');
        this.activeCard = null;
        this.currentLoadUrl = null;
    }
}
