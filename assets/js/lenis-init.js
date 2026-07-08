/**
 * Envizon Studio - Lenis smooth scroll
 * Single Lenis instance driving the whole page; every GSAP ScrollTrigger in
 * the site reads scroll position through it (lenis "scroll" -> ScrollTrigger
 * .update) and its own internal raf is driven by gsap.ticker so both stay on
 * the same frame clock instead of racing two separate rAF loops.
 */
export function initLenis() {
    if (typeof window.Lenis === 'undefined' || typeof gsap === 'undefined') return null;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return null;

    const lenis = new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
    });

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
    }

    // Drive Lenis off GSAP's own ticker (gsap.ticker time is seconds; Lenis wants ms)
    // so smoothing and every ScrollTrigger-scrubbed tween update on the exact same frame.
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;
    return lenis;
}
