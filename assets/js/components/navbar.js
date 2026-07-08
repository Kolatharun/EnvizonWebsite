/**
 * Envizon Studio - Navbar
 * Handles the accessible right-side off-canvas sidebar (mobile/tablet nav):
 * open/close, backdrop click, escape key, focus trap and body scroll lock.
 */

const STICKY_THRESHOLD = 16;

function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let ticking = false;

    const applyStickyState = () => {
        header.classList.toggle('is-sticky', window.scrollY > STICKY_THRESHOLD);
        ticking = false;
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(applyStickyState);
    };

    applyStickyState();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * GSAP-driven scroll behavior for the desktop pill navbar:
 *  - hides on scroll down, reveals on scroll up (classic "hide on scroll")
 *  - shrinks to a compact logo+icon pill once the user has scrolled well
 *    past the hero, then grows back to full width on the way up
 * Runs only on desktop widths — mobile/tablet keep the hamburger layout.
 */
function initScrollBehavior() {
    if (typeof gsap === 'undefined') return;

    const header = document.querySelector('.header');
    const wrapper = document.querySelector('.navbar-wrapper');
    const navLinks = document.querySelector('.nav-links');
    const ctaLabel = document.querySelector('.header-btn__label');
    const logoImg = document.querySelector('.logo img');
    if (!header || !wrapper) return;

    const REVEAL_ZONE = 24;   // always fully shown within this many px of the top
    const COMPACT_AT = 260;   // scroll distance before the pill shrinks
    const COMPACT_WIDTH = 200; // ~15-18% of the ~1225px full pill width
    const desktopQuery = window.matchMedia('(min-width: 1025px)');

    let expandedWidth = wrapper.getBoundingClientRect().width;
    let isCompact = false;
    let isHidden = false;
    let lastY = window.scrollY;

    const refreshExpandedWidth = () => {
        if (!isCompact) expandedWidth = wrapper.getBoundingClientRect().width;
    };
    window.addEventListener('resize', refreshExpandedWidth);

    const setCompact = (on) => {
        if (on === isCompact || !desktopQuery.matches) return;
        isCompact = on;
        /* only touch the "width" tween on wrapper — it also carries an
           independent yPercent/autoAlpha tween for the hide-on-scroll
           behavior that must not be interrupted here */
        gsap.killTweensOf(wrapper, 'width');
        gsap.killTweensOf(logoImg);
        const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
        const compactWidth = Math.max(850, Math.min(expandedWidth * 0.88, 1080));

        if (on) {
            wrapper.classList.add('is-compact');
            tl.to(logoImg, { width: 90, duration: .5 }, 0)
              .to(wrapper, { width: compactWidth, duration: .55 }, 0);
        } else {
            tl.to(wrapper, { width: expandedWidth, duration: .55 }, 0)
              .to(logoImg, { width: 108, duration: .5 }, 0)
              .call(() => wrapper.classList.remove('is-compact'));
        }
    };

    const setHidden = (on) => {
        if (on === isHidden) return;
        isHidden = on;
        /* animate the wrapper, not .header itself — .header carries the
           CSS translateX(-50%) centering transform under .is-sticky, and
           letting GSAP touch that same transform would bake the stale
           x-offset into an inline style once yPercent takes over */
        gsap.to(wrapper, {
            yPercent: on ? -220 : 0,
            autoAlpha: on ? 0 : 1,
            duration: on ? .5 : .55,
            ease: on ? 'power3.in' : 'power3.out',
            overwrite: 'auto'
        });
    };

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const goingDown = y > lastY;

            if (y <= REVEAL_ZONE) {
                setHidden(false);
                setCompact(false);
            } else {
                setHidden(desktopQuery.matches ? goingDown : goingDown && y > 80);
                setCompact(y > COMPACT_AT);
            }

            lastY = y;
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    desktopQuery.addEventListener('change', () => {
        setCompact(false);
        setHidden(false);
        refreshExpandedWidth();
    });
}

export function initNavbar() {
    initStickyHeader();
    initScrollBehavior();

    const toggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const closeBtn = document.querySelector('.sidebar-close');

    if (!toggle || !sidebar || !overlay) return;

    let lastFocused = null;

    const getFocusable = () =>
        Array.from(sidebar.querySelectorAll('a[href], button:not([disabled])'));

    const trapFocus = (e) => {
        if (e.key !== 'Tab') return;

        const focusable = getFocusable();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        } else {
            trapFocus(e);
        }
    };

    function openMenu() {
        lastFocused = document.activeElement;

        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('is-open');
        sidebar.setAttribute('aria-hidden', 'false');
        sidebar.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.classList.add('nav-open');

        const focusable = getFocusable();
        (closeBtn || focusable[0] || sidebar).focus();

        document.addEventListener('keydown', onKeydown);
    }

    function closeMenu() {
        if (!sidebar.classList.contains('is-open')) return;

        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-open');
        sidebar.setAttribute('aria-hidden', 'true');
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.classList.remove('nav-open');

        document.removeEventListener('keydown', onKeydown);

        if (lastFocused) lastFocused.focus();
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
    });

    closeBtn?.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            closeMenu();
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    const desktopNavLinks = document.querySelectorAll('.nav-links a');
    desktopNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}
