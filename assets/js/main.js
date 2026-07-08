import { initLenis } from './lenis-init.js';
import { initHeroAnimations } from './components/hero.js';
import { initShowcaseCarousel } from './components/carousel.js';
import { initServicesNav } from './components/services-ticker.js';
import { initServicesScroll } from './components/services-scroll.js';
import { initHowWeWork } from './components/how-we-work.js';
import { initWorkflowShowcase } from './components/workflow-showcase.js';
import { initFaq } from './components/faq.js';
import { initInsights } from './components/insights.js';
import { initScrollReveals } from './components/scroll-reveals.js';

document.addEventListener('DOMContentLoaded', () => {
    // Smooth-scroll instance first — every ScrollTrigger below reads scroll
    // position through it (see lenis-init.js).
    initLenis();

    initHeroAnimations();
    const carousel = initShowcaseCarousel('#showcaseCarousel');
    initServicesNav('#servicesTicker', carousel);
    initServicesScroll('#servicesScroll');
    initHowWeWork('.how-we-work');
    initWorkflowShowcase('.workflow-showcase');
    initFaq('.faq__accordion');
    initInsights('.insights');
    initScrollReveals();
});

/**
 * Animate service cards into view on scroll
 */
window.addEventListener('load', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
});
