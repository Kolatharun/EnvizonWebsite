/**
 * Envizon Studio - Workflow showcase (Better Tools / Smooth Workflow / AI Tools)
 * Heading/content fade-rise in once via the existing CSS `.is-visible` hook
 * (now toggled by ScrollTrigger instead of an IntersectionObserver). The four
 * floating cards scale+fade in with a stagger, then drift at different
 * parallax depths for as long as the section is in view. Idle bob stays a
 * pure CSS loop (workflow-showcase.css) and runs independently of both.
 */

// Parallax depth (px of travel) per card while scrolling through the section —
// small, alternating directions so the cluster reads as floating at different depths.
const PARALLAX_DEPTH = [-36, 28, 22, -30];

export function initWorkflowShowcase(selector = '.workflow-showcase') {
    const section = document.querySelector(selector);
    if (!section) return;

    const container = section.querySelector('.workflow-showcase__container');
    if (!container) return;

    const cards = Array.from(section.querySelectorAll('.workflow-showcase__card'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        container.classList.add('is-visible');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Heading/content: same CSS-driven fade-rise as before, just triggered on scroll.
    ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        once: true,
        onEnter: () => container.classList.add('is-visible'),
    });

    if (!cards.length) return;

    // Cards: scale + fade in with a stagger the moment the cluster comes into view.
    gsap.set(cards, { opacity: 0, scale: 0.6, willChange: 'transform, opacity' });
    gsap.to(cards, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out(1.6)',
        stagger: 0.12,
        scrollTrigger: { trigger: container, start: 'top 75%', once: true },
        onComplete: () => gsap.set(cards, { willChange: 'auto' }),
    });

    // Then, independent of the entrance: each card drifts at its own depth
    // for the whole time the section is on screen (transform-only, scrubbed).
    cards.forEach((card, i) => {
        gsap.to(card, {
            y: PARALLAX_DEPTH[i % PARALLAX_DEPTH.length],
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    });
}
