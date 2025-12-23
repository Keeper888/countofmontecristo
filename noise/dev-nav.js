(function() {
    // DEV NAVIGATION - User Journey Steps

    const DEV_NAV_STYLES = `
        #dev-nav-indicator {
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 99999;
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            font-size: 12px;
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 6px 12px;
            letter-spacing: 1px;
            user-select: none;
        }

        #dev-nav-steps {
            position: fixed;
            top: 15px;
            right: 15px;
            z-index: 99999;
            display: flex;
            gap: 8px;
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            user-select: none;
        }

        .dev-nav-step-box {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #00ff00;
            color: #00ff00;
            font-size: 12px;
            cursor: pointer;
            background: transparent;
            transition: all 0.15s;
        }

        .dev-nav-step-box:hover {
            background: rgba(0, 255, 0, 0.15);
        }

        .dev-nav-step-box.active {
            background: #00ff00;
            color: #000;
        }
    `;

    // User journey steps (the actual flow through the ARG)
    const journeySteps = [
        { num: 1, file: 'landing-one.html', action: 'showDisclaimer', label: 'Disclaimer' },
        { num: 2, file: 'landing-one.html', action: 'showContent', label: 'Signal Intercepted' },
        { num: 3, file: 'landing.html', phase: 'sigil', label: 'Sigil' },
        { num: 4, file: 'landing.html', phase: 'briefing', label: 'Briefing' },
        { num: 5, file: 'landing.html', phase: 'test', label: 'Test/Cipher' },
        { num: 6, file: 'landing.html', phase: 'reveal', label: 'Reveal' },
        { num: 7, file: 'landing.html', phase: 'channel', label: 'Channel' },
        { num: 8, file: 'landing.html', phase: 'calibration', label: 'Calibration' },
        { num: 9, file: 'landing.html', phase: 'deployment', label: 'Deployment' }
    ];

    // Detect current page and step
    const currentFile = window.location.pathname.includes('landing-one') ? 'landing-one.html' : 'landing.html';
    let currentStep = 1;

    // Determine current step based on page state
    function detectCurrentStep() {
        if (currentFile === 'landing-one.html') {
            const disclaimer = document.getElementById('disclaimer-overlay');
            if (disclaimer && !disclaimer.classList.contains('hidden')) {
                return 1;
            }
            return 2;
        } else {
            // landing.html - check which phase is visible
            const phases = ['sigil', 'briefing', 'test', 'reveal', 'channel', 'calibration', 'deployment'];
            for (let i = 0; i < phases.length; i++) {
                const el = document.getElementById('phase-' + phases[i]);
                if (el && !el.classList.contains('hidden')) {
                    return 3 + i; // Steps 3-9
                }
            }
            return 3;
        }
    }

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = DEV_NAV_STYLES;
    document.head.appendChild(styleEl);

    // Build overlay
    function buildOverlay() {
        currentStep = detectCurrentStep();

        // Step indicator (left)
        const indicator = document.createElement('div');
        indicator.id = 'dev-nav-indicator';
        indicator.innerHTML = `STEP: <span id="dev-nav-current">${currentStep}</span>`;
        document.body.appendChild(indicator);

        // Step boxes (right)
        const stepsContainer = document.createElement('div');
        stepsContainer.id = 'dev-nav-steps';

        journeySteps.forEach(step => {
            const box = document.createElement('div');
            box.className = 'dev-nav-step-box';
            if (step.num === currentStep) box.classList.add('active');
            box.dataset.num = step.num;
            box.textContent = step.num;
            box.title = step.label;

            box.addEventListener('click', () => navigateToStep(step));
            stepsContainer.appendChild(box);
        });

        document.body.appendChild(stepsContainer);

        // Update indicator periodically
        setInterval(() => {
            const newStep = detectCurrentStep();
            if (newStep !== currentStep) {
                currentStep = newStep;
                updateActiveStep(currentStep);
            }
        }, 300);
    }

    function navigateToStep(step) {
        // If different file, navigate there
        if (step.file !== currentFile) {
            // Add hash to indicate which step to show
            window.location.href = step.file + '#step' + step.num;
            return;
        }

        // Same file - handle navigation
        if (currentFile === 'landing-one.html') {
            const disclaimer = document.getElementById('disclaimer-overlay');
            if (step.num === 1) {
                // Show disclaimer
                if (disclaimer) disclaimer.classList.remove('hidden');
            } else if (step.num === 2) {
                // Hide disclaimer, show content
                if (disclaimer) disclaimer.classList.add('hidden');
            }
        } else {
            // landing.html - show the correct phase
            const phases = {
                sigil: document.getElementById('phase-sigil'),
                briefing: document.getElementById('phase-briefing'),
                test: document.getElementById('phase-test'),
                reveal: document.getElementById('phase-reveal'),
                channel: document.getElementById('phase-channel'),
                calibration: document.getElementById('phase-calibration'),
                deployment: document.getElementById('phase-deployment')
            };

            // Hide all phases
            Object.values(phases).forEach(p => {
                if (p) p.classList.add('hidden');
            });

            // Show target phase
            if (step.phase && phases[step.phase]) {
                phases[step.phase].classList.remove('hidden');
            }
        }

        updateActiveStep(step.num);
    }

    function updateActiveStep(num) {
        currentStep = num;
        const indicator = document.getElementById('dev-nav-current');
        if (indicator) indicator.textContent = num;

        document.querySelectorAll('.dev-nav-step-box').forEach(box => {
            box.classList.toggle('active', parseInt(box.dataset.num) === num);
        });
    }

    // Handle incoming navigation from other page
    function handleIncomingNav() {
        const hash = window.location.hash;
        if (hash.startsWith('#step')) {
            const stepNum = parseInt(hash.replace('#step', ''));
            const step = journeySteps.find(s => s.num === stepNum);
            if (step && step.file === currentFile) {
                setTimeout(() => navigateToStep(step), 100);
            }
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            buildOverlay();
            handleIncomingNav();
        });
    } else {
        buildOverlay();
        handleIncomingNav();
    }
})();
