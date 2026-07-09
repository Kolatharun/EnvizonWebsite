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

    const toggleBtn = section.querySelector('.workflow-showcase__toggle');
    const toggleKnob = section.querySelector('.workflow-showcase__toggle-knob');
    const toolsText = section.querySelector('.workflow-showcase__text-item--tools');
    const worksText = section.querySelector('.workflow-showcase__text-item--works');
    const heading = section.querySelector('.workflow-showcase__heading');

    if (toggleBtn && toggleKnob && toolsText && worksText && heading) {
        // Set initial state for works text (tools is visible by default in DOM)
        gsap.set(worksText, { y: 20, opacity: 0 });

        let isToggled = false;
        let isAnimating = false;

        const handleToggle = (forceState) => {
            if (isAnimating) return;

            const nextState = (typeof forceState === 'boolean') ? forceState : !isToggled;
            if (nextState === isToggled) return;

            isAnimating = true;
            isToggled = nextState;
            toggleBtn.setAttribute('aria-pressed', isToggled ? 'true' : 'false');

            const tl = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                }
            });

            // 1. Move knob (translateX the knob by 0.813em)
            tl.to(toggleKnob, {
                x: isToggled ? '0.813em' : 0,
                duration: 0.5,
                ease: 'power3.inOut'
            }, 0);

            // 2. Change section background and text colors
            tl.to(section, {
                backgroundColor: isToggled ? '#F9F8F8' : '#111111',
                duration: 0.6,
                ease: 'power2.inOut'
            }, 0);

            tl.to(heading, {
                color: isToggled ? '#111111' : '#ffffff',
                duration: 0.6,
                ease: 'power2.inOut'
            }, 0);

            // 3. Text swap animation (Tools <-> Works)
            if (isToggled) {
                // Tools out (slides up & fades), Works in (slides up from below & fades in)
                tl.to(toolsText, {
                    y: -20,
                    opacity: 0,
                    duration: 0.45,
                    ease: 'power2.inOut'
                }, 0);
                
                tl.fromTo(worksText, 
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
                    0.05
                );
            } else {
                // Works out (slides up & fades), Tools in (slides up from below & fades in)
                tl.to(worksText, {
                    y: -20,
                    opacity: 0,
                    duration: 0.45,
                    ease: 'power2.inOut'
                }, 0);

                tl.fromTo(toolsText,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
                    0.05
                );
            }
        };

        toggleBtn.addEventListener('click', () => handleToggle());
        
        // Add keyboard interaction for accessibility
        toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleToggle();
            }
        });

        // Automatically trigger toggle to light mode (State B) the first time scrolling down to the section
        ScrollTrigger.create({
            trigger: container,
            start: 'top 65%',
            once: true,
            onEnter: () => {
                gsap.delayedCall(0.5, () => {
                    handleToggle(true);
                });
            }
        });
    }

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
