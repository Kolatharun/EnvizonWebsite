/**
 * Envizon Studio - About Page: Communication section
 * Switches the active pill and its matching feature panel (same layout,
 * swappable content/graphic per tab).
 */

export function initAboutCommunication(root = '.about-communication') {
    const section = document.querySelector(root);
    if (!section) return;

    const tabs = Array.from(section.querySelectorAll('.pill-item'));
    const panels = Array.from(section.querySelectorAll('.feature-panel'));

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => {
                const isActive = t === tab;
                t.classList.toggle('is-active', isActive);
                t.setAttribute('aria-selected', String(isActive));
            });

            panels.forEach(panel => {
                const isActive = panel.dataset.panel === target;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        });
    });
}
