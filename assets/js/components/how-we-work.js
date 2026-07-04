/**
 * Envizon Studio - How We Work
 * Five-stage process cards. Desktop: hovering a card expands it and marks it
 * active (previous active card collapses). Touch/tablet: tap sets the active
 * card; swiping the native scroll-snap track keeps the active state synced to
 * whichever card sits at the leading edge. No scroll hijacking or pinning.
 */

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const SYNC_QUERY = '(max-width: 1024px)';

export class HowWeWork {
    constructor(root) {
        this.root = root;
        this.track = root.querySelector('.stage-cards');
        this.cards = Array.from(root.querySelectorAll('.stage-card'));

        if (!this.track || !this.cards.length) return;

        this.bindInteractions();
        this.setupScrollSync();
    }

    setActive(card) {
        if (!card || card.classList.contains('is-active')) return;

        this.cards.forEach(c => {
            const active = c === card;
            c.classList.toggle('is-active', active);
            c.setAttribute('aria-selected', active ? 'true' : 'false');
            c.setAttribute('tabindex', active ? '0' : '-1');
        });

        this.track.classList.add('has-active');
    }

    bindInteractions() {
        const canHover = () => window.matchMedia(HOVER_QUERY).matches;

        this.cards.forEach((card, i) => {
            card.addEventListener('mouseenter', () => {
                if (canHover()) this.setActive(card);
            });

            card.addEventListener('click', () => this.setActive(card));

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setActive(card);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.cards[Math.min(i + 1, this.cards.length - 1)].focus();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.cards[Math.max(i - 1, 0)].focus();
                }
            });
        });
    }

    setupScrollSync() {
        let ticking = false;

        const onScroll = () => {
            if (!window.matchMedia(SYNC_QUERY).matches) return;
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                ticking = false;

                const trackLeft = this.track.getBoundingClientRect().left;
                let closest = null;
                let closestDist = Infinity;

                this.cards.forEach(card => {
                    const dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = card;
                    }
                });

                if (closest) this.setActive(closest);
            });
        };

        this.track.addEventListener('scroll', onScroll, { passive: true });
    }
}

export function initHowWeWork(selector = '.how-we-work') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new HowWeWork(root);
}
