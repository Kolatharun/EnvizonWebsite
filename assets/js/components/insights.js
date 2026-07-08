/**
 * Envizon Studio - Insights / blog cards
 * Reveals each card on scroll via GSAP ScrollTrigger, staggering the
 * animation delay per card so they cascade in rather than pop together.
 * Still drives the same `.is-visible` class + CSS keyframe (insights.css)
 * as before — only the trigger source changed.
 */
export function initInsights(selector = '.insights') {
    const section = document.querySelector(selector);
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.insight-card'));
    if (!cards.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        cards.forEach(card => card.classList.add('is-visible'));
        return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        cards.forEach(card => card.classList.add('is-visible'));
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    cards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                card.style.animationDelay = `${index * 100}ms`;
                card.classList.add('is-visible');
            },
        });
    });
}
