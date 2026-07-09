/**
 * Envizon Studio - Showcase Carousel
 * 5-card center-focused coverflow carousel driven by GSAP timelines.
 * Cards use transform-only properties (x, scale, opacity)
 * so the loop stays on the compositor and holds 60fps.
 */

const AUTOPLAY_MS = 3000;
const SWIPE_THRESHOLD = 40;

const LAYOUTS = {
    desktop: {
        levels: [
            { x: 0,   scale: 1,    opacity: 1, z: 50 },
            { x: 373, scale: 0.63, opacity: 1, z: 40 },
            { x: 637, scale: 0.45, opacity: 0, z: 30 },
            { x: 850, scale: 0.35, opacity: 0, z: 10 }
        ]
    },
    tablet: {
        levels: [
            { x: 0,   scale: 1,    opacity: 1, z: 50 },
            { x: 291, scale: 0.63, opacity: 1, z: 40 },
            { x: 500, scale: 0.45, opacity: 0, z: 20 },
            { x: 700, scale: 0.35, opacity: 0, z: 10 }
        ]
    },
    mobile: {
        levels: [
            { x: 0,   scale: 1,    opacity: 1, z: 50 },
            { x: 216, scale: 0.63, opacity: 1, z: 20 },
            { x: 380, scale: 0.45, opacity: 0, z: 10 },
            { x: 550, scale: 0.35, opacity: 0, z: 5 }
        ]
    }
};

function getOffset(index, active, total) {
    let diff = (index - active) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
}

function currentLayoutName() {
    if (window.matchMedia('(max-width: 640px)').matches) return 'mobile';
    if (window.matchMedia('(min-width: 641px) and (max-width: 1024px)').matches) return 'tablet';
    return 'desktop';
}

export class ShowcaseCarousel {
    constructor(root) {
        this.root = root;
        this.cards = Array.from(root.querySelectorAll('.showcase-card'));
        this.overlays = this.cards.map(card => card.querySelector('.showcase-card__overlay'));
        this.total = this.cards.length;
        this.active = 2; // Sets initial index to middle card
        this.autoplayId = null;
        this.listeners = new Set();

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.duration = reduceMotion ? 0.01 : 0.5;

        if (!this.total) return;

        this.handleBrokenImages();
        gsap.set(this.cards, { xPercent: -50, yPercent: 0, transformOrigin: '50% 100%', force3D: true });
        this.render(true);
        this.bindInteractions();
        this.startAutoplay();
    }

    handleBrokenImages() {
        this.root.querySelectorAll('.showcase-card__image').forEach(img => {
            img.addEventListener('error', () => img.classList.add('is-broken'), { once: true });
        });
    }

    render(immediate = false) {
        const layout = LAYOUTS[currentLayoutName()];
        const tl = gsap.timeline({
            defaults: { duration: immediate ? 0 : this.duration, ease: 'power4.inOut' }
        });

        this.cards.forEach((card, i) => {
            const offset = getOffset(i, this.active, this.total);
            const level = Math.min(Math.abs(offset), layout.levels.length - 1);
            const cfg = layout.levels[level];
            const sign = offset === 0 ? 0 : (offset < 0 ? -1 : 1);

            tl.set(card, { zIndex: cfg.z }, 0);
            tl.to(card, {
                x: cfg.x * sign,
                scale: cfg.scale,
                opacity: cfg.opacity,
                force3D: true
            }, 0);

            card.setAttribute('aria-current', i === this.active ? 'true' : 'false');
        });

        this.emit();
    }

    goTo(index) {
        this.active = ((index % this.total) + this.total) % this.total;
        this.render();
    }

    next() { this.goTo(this.active + 1); }
    prev() { this.goTo(this.active - 1); }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayId = setInterval(() => this.next(), AUTOPLAY_MS);
    }

    stopAutoplay() {
        if (this.autoplayId) clearInterval(this.autoplayId);
        this.autoplayId = null;
    }

    restartAutoplay() {
        this.startAutoplay();
    }

    bindInteractions() {
        const stage = this.root.querySelector('.showcase-carousel__stage');

        this.cards.forEach((card, i) => {
            card.addEventListener('click', () => { this.goTo(i); this.restartAutoplay(); });

            const img = card.querySelector('.showcase-card__image');
            if (img) {
                card.addEventListener('mouseenter', () => {
                    gsap.to(img, { scale: 1.08, duration: 0.6, ease: 'power3.out' });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(img, { scale: 1, duration: 0.6, ease: 'power3.out' });
                });
            }
        });

        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { this.next(); this.restartAutoplay(); }
            if (e.key === 'ArrowLeft') { this.prev(); this.restartAutoplay(); }
        });

        let startX = 0;
        let dragging = false;

        stage.addEventListener('pointerdown', (e) => {
            dragging = true;
            startX = e.clientX;
        });

        stage.addEventListener('pointerup', (e) => {
            if (!dragging) return;
            dragging = false;
            const delta = e.clientX - startX;
            if (Math.abs(delta) > SWIPE_THRESHOLD) {
                delta < 0 ? this.next() : this.prev();
                this.restartAutoplay();
            }
        });

        stage.addEventListener('pointercancel', () => { dragging = false; });

        this.root.addEventListener('pointerenter', () => this.stopAutoplay());
        this.root.addEventListener('pointerleave', () => this.startAutoplay());
        this.root.addEventListener('focusin', () => this.stopAutoplay());
        this.root.addEventListener('focusout', () => this.startAutoplay());

        window.addEventListener('resize', () => this.render(true));
    }

    onChange(callback) {
        this.listeners.add(callback);
        callback(this.active);
    }

    emit() {
        this.listeners.forEach(cb => cb(this.active));
    }

    destroy() {
        this.stopAutoplay();
    }
}

export function initShowcaseCarousel(selector = '#showcaseCarousel') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ShowcaseCarousel(root);
}
