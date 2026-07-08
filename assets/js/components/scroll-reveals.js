/**
 * Envizon Studio - Section scroll reveals
 * GSAP + ScrollTrigger entrance animations for every section that didn't
 * already own a bespoke scroll interaction (hero, workflow-showcase,
 * services-scroll and the how-we-work hover/tap logic all handle themselves
 * elsewhere). Everything here is transform/opacity only, `once: true` so it
 * never re-costs a repaint on the way back up, and skipped entirely under
 * prefers-reduced-motion.
 */

const REDUCE_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const READY = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

/**
 * Shared fade-up-and-stagger reveal used by most of the sections below.
 * Sets a hidden starting state only right before animating it in, and clears
 * the inline transform afterwards so any CSS :hover transform on the same
 * element (card lift, etc.) isn't left fighting a leftover inline style.
 */
function revealUp(targets, { trigger, y = 32, stagger = 0.08, start = 'top 82%', duration = 0.8 } = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;

    gsap.set(els, { opacity: 0, y, willChange: 'transform, opacity' });

    gsap.to(els, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        clearProps: 'transform,willChange',
        scrollTrigger: {
            trigger: trigger || els[0],
            start,
            once: true,
        },
    });
}

/** Craft That Converts — eyebrow/heading/CTA/copy rise in together */
function initCraftHeaderReveal() {
    const section = document.querySelector('.craft-header');
    if (!section) return;
    revealUp([section.querySelector('.craft-header__left'), section.querySelector('.craft-header__right')], {
        trigger: section,
        y: 28,
        stagger: 0.12,
    });
}

/** Stats Highlight — count the percentages up, then reveal the cards */
function initStatsHighlight() {
    const section = document.querySelector('.stats-highlight');
    if (!section) return;

    const cards = gsap.utils.toArray(section.querySelectorAll('.stats-highlight__card'));
    if (!cards.length) return;

    revealUp(cards, { trigger: section.querySelector('.stats-highlight__grid'), y: 40, stagger: 0.12 });

    cards.forEach((card) => {
        const percentEl = card.querySelector('.stats-highlight__percent');
        if (!percentEl) return;

        const raw = percentEl.textContent.trim();
        const target = parseFloat(raw);
        if (Number.isNaN(target)) return;
        const suffix = raw.replace(/[\d.]/g, '');
        const counter = { value: 0 };

        gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
            onUpdate: () => {
                percentEl.textContent = `${Math.round(counter.value)}${suffix}`;
            },
        });
    });
}

/** Integrations — tool icons fade in with a stagger */
function initIntegrationsReveal() {
    const grid = document.querySelector('.integrations__grid');
    if (!grid) return;
    revealUp(grid.querySelectorAll('.integrations__item'), { trigger: grid, y: 24, stagger: 0.06 });
}

/** How We Work — header copy + the stage-card row rise in on entry */
function initHowWeWorkReveal() {
    const section = document.querySelector('.how-we-work');
    if (!section) return;

    revealUp(
        [section.querySelector('.how-we-work__heading'), section.querySelector('.how-we-work__aside')],
        { trigger: section.querySelector('.how-we-work__header'), y: 24, stagger: 0.1 }
    );

    revealUp(section.querySelectorAll('.stage-card'), {
        trigger: section.querySelector('.stage-cards'),
        y: 36,
        stagger: 0.08,
        start: 'top 88%',
    });
}

/** Testimonials — cards rise in; hover-lift is already handled in CSS */
function initTestimonialsReveal() {
    const grid = document.querySelector('.testimonials__grid');
    if (!grid) return;
    revealUp(grid.querySelectorAll('.testimonial-card'), { trigger: grid, y: 36, stagger: 0.12 });
}

/** FAQ — accordion rows rise in; open/close logic is untouched */
function initFaqReveal() {
    const accordion = document.querySelector('.faq__accordion');
    if (!accordion) return;
    revealUp(accordion.querySelectorAll('.faq-item'), { trigger: accordion, y: 24, stagger: 0.07 });
}

/** Global CTA — final fade-up before the footer */
function initGlobalCtaReveal() {
    const content = document.querySelector('.call-to-action-content');
    if (!content) return;
    revealUp(content, { trigger: content, y: 40, start: 'top 85%' });
}

/**
 * Services category bar — subtle momentum drift.
 * Reads the page's scroll velocity every frame (via a passive, pin-less
 * ScrollTrigger) and nudges the ticker track opposite the scroll direction,
 * easing back to rest the moment scrolling settles — the classic "text/row
 * drags behind the scroll" feel, layered on top of (not replacing) the
 * existing click-to-select / active-centering behavior in services-ticker.js.
 */
function initServicesBarMomentum() {
    const track = document.querySelector('#servicesTicker');
    if (!track) return;

    const xTo = gsap.quickTo(track, 'x', { duration: 0.7, ease: 'power3.out' });

    ScrollTrigger.create({
        trigger: document.body,
        start: 0,
        end: 'max',
        onUpdate(self) {
            const velocity = gsap.utils.clamp(-40, 40, self.getVelocity() / 300);
            xTo(velocity);
        },
    });

    // Ease the drift back to rest the moment scrolling actually stops.
    ScrollTrigger.addEventListener('scrollEnd', () => xTo(0));
}

export function initScrollReveals() {
    if (!READY() || REDUCE_MOTION()) return;

    gsap.registerPlugin(ScrollTrigger);

    initCraftHeaderReveal();
    initStatsHighlight();
    initIntegrationsReveal();
    initHowWeWorkReveal();
    initTestimonialsReveal();
    initFaqReveal();
    initGlobalCtaReveal();
    initServicesBarMomentum();
}

/** Footer reveal is triggered separately, after its markup is fetched in. */
export function revealFooter(footerEl) {
    if (!footerEl || !READY() || REDUCE_MOTION()) return;
    revealUp(footerEl, { trigger: footerEl, y: 48, start: 'top 90%' });
}
