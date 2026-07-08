export function initVideoBanner(sectionSelector = '.video-banner') {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const steps = Array.from(section.querySelectorAll('.video-banner__step-btn'));
    const descItems = Array.from(section.querySelectorAll('.video-banner__desc-item'));
    const visualItems = Array.from(section.querySelectorAll('.video-banner__visual-item'));
    const cursor = section.querySelector('.video-banner__cursor');
    const cursorFill = section.querySelector('.video-banner__cursor-fill');
    const lineProgress = section.querySelector('.video-banner__timeline-line-progress');

    if (!steps.length) return;

    let currentState = 0;
    const totalStates = steps.length;
    const STATE_DURATION = 3000; // 3 seconds per state
    let progressStartTime = 0;
    let animFrameId = null;

    const positions = [16.6, 50, 83.3]; // percentage positions for timeline stages

    function setCircleProgress(percentage) {
        if (!cursorFill) return;
        const maxOffset = 100.5;
        const offset = maxOffset - (percentage * maxOffset);
        cursorFill.style.strokeDashoffset = offset;
    }

    function updateState(index) {
        currentState = index;

        // Update active classes on steps
        steps.forEach((btn, idx) => {
            btn.classList.toggle('is-active', idx === index);
        });

        // Update active descriptions
        descItems.forEach((item, idx) => {
            item.classList.toggle('is-active', idx === index);
        });

        // Update active visual animations
        visualItems.forEach((item, idx) => {
            item.classList.toggle('is-active', idx === index);
        });

        // Update timeline gold line width
        if (lineProgress) {
            // State 0: 0%, State 1: 33.3%, State 2: 66.7% of the total parent container width
            // Since the timeline line bg runs from 16.6% to 83.3%, the total span is 66.7%.
            const progressWidths = [0, 33.3, 66.7];
            lineProgress.style.width = `${progressWidths[index]}%`;
        }

        // Move active circular cursor
        if (cursor) {
            cursor.style.left = `${positions[index]}%`;
        }

        // Reset timer progress
        progressStartTime = Date.now();
    }

    function tick() {
        const elapsed = Date.now() - progressStartTime;
        const ratio = Math.min(elapsed / STATE_DURATION, 1);
        
        setCircleProgress(ratio);

        if (elapsed >= STATE_DURATION) {
            // Move to next state
            const nextState = (currentState + 1) % totalStates;
            updateState(nextState);
        }

        animFrameId = requestAnimationFrame(tick);
    }

    function startLoop() {
        progressStartTime = Date.now();
        animFrameId = requestAnimationFrame(tick);
    }

    function resetLoop() {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        startLoop();
    }

    // Step button click handlers for interactivity
    steps.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            updateState(idx);
            resetLoop();
        });
    });

    // Initialize first state and start the progress loop
    updateState(currentState);
    startLoop();

    // Return cleanup handle
    return () => {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
    };
}
