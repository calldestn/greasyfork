// ==UserScript==
// @name         SMS Guard: Z-Shield (Accessibility Professional)
// @namespace    https://github.com/calldestn
// @version      1.6.0
// @description  Accessibility & Safety Overlay: Provides high-visibility alerts and font magnification for users with visual impairments to prevent SMS errors.
// @author       callme
// @match        https://*.3cx.cloud/*
// @license      AGPL-3.0-or-later
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/568472/SMS%20Guard%3A%20Z-Shield%20%28Accessibility%20Professional%29.user.js
// @updateURL https://update.greasyfork.org/scripts/568472/SMS%20Guard%3A%20Z-Shield%20%28Accessibility%20Professional%29.meta.js
// ==/UserScript==

(function() {
    'use strict';
    const SMS_MAX = 160;

    let inputScale = parseFloat(localStorage.getItem('cx-input-scale')) || 1.0;
    let chatScale = parseFloat(localStorage.getItem('cx-chat-scale')) || 1.0;

    const injectStyles = () => {
        const oldStyle = document.getElementById('cx-zshield-styles');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = 'cx-zshield-styles';
        style.innerHTML = `
            #cx-safety-shield {
                position: absolute !important; right: 0 !important; top: 0 !important;
                height: 100% !important; width: 0%; background-color: var(--error) !important;
                color: white !important; z-index: 10000 !important; display: flex !important;
                justify-content: center !important; align-items: center !important;
                overflow: hidden !important; transition: width 0.3s ease !important;
                pointer-events: all !important; cursor: not-allowed !important; border-radius: 8px 0 0 8px !important;
            }
            #cx-safety-shield.active { width: 140px !important; box-shadow: -5px 0 15px rgba(0,0,0,0.2) !important; }

            #cx-safety-shield .cx-shield-label {
                white-space: nowrap !important;
                opacity: 0 !important;
                transition: opacity 0.2s ease !important;
                transition-delay: 0s !important;
                pointer-events: none !important;
            }
            #cx-safety-shield.active .cx-shield-label {
                opacity: 1 !important;
                transition-delay: 0.25s !important;
                font-size: 1.2rem;
                font-weight: bold;
            }

            .cx-mag-btn { display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 0 10px !important; min-width: 44px !important; cursor: pointer; color: inherit; }
            .cx-mag-btn svg { width: 18px; height: 18px; fill: currentColor; }
            .cx-mag-btn .zoom-text { font-size: 9px; margin-left: 2px; font-weight: bold; }

            /* Zone 1: Input Box */
            div[data-qa="input_restriction"] {
                display: block !important;
                font-size: ${16 * inputScale}px !important;
                line-height: 1.5 !important;
                min-height: ${36 * inputScale}px !important;
                height: auto !important;
                padding: 1px 1px 12px 1px !important;
                text-align: left !important;
                position: relative !important;
                width: 100% !important;
                background: transparent !important;
            }


            .message-input-wrap {
                flex: 1 !important;
                display: block !important;
                min-width: 50px !important;
            }

            #sendMessageBtn {
                width: ${44 * inputScale}px !important;
                height: ${44 * inputScale}px !important;
                flex-shrink: 0 !important;
            }

            /* Zone 2: Chat History */
            .message-text-internal, .message-text-internal span, .message-time-info {
                font-size: ${14 * chatScale}px !important;
                line-height: 1.5 !important;
            }
            .message-inner { max-width: ${85 * chatScale}% !important; }

            /* Footer Bar */
            #chat-form-controls {
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                justify-content: flex-end !important;
                height: auto !important;
                min-height: 50px !important;
                overflow: visible !important;
                padding: 5px 10px !important;
            }
        `;
        document.head.appendChild(style);
    };

    const createMagButton = (id, type) => {
        const btn = document.createElement('button');
        btn.id = id; btn.type = 'button'; btn.className = 'btn btn-plain cx-mag-btn';
        const currentVal = type === 'input' ? inputScale : chatScale;
        const zone = type === 'input' ? 'Input Text' : 'Chat History';

        const getLabel = (scale) => `Zoom ${zone}: ${(scale * 100).toFixed(0)}% (click to increase)`;

        btn.title = getLabel(currentVal);
        btn.setAttribute('aria-label', getLabel(currentVal));
        btn.innerHTML = `<svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg><span class="zoom-text" aria-live="polite">${(currentVal * 100).toFixed(0)}%</span>`;
        btn.onclick = (e) => {
            e.preventDefault();
            if (type === 'input') { inputScale = inputScale >= 2.0 ? 1.0 : inputScale + 0.25; localStorage.setItem('cx-input-scale', inputScale); }
            else { chatScale = chatScale >= 2.0 ? 1.0 : chatScale + 0.25; localStorage.setItem('cx-chat-scale', chatScale); }
            injectStyles();
            const newScale = type === 'input' ? inputScale : chatScale;
            btn.querySelector('.zoom-text').innerText = `${(newScale * 100).toFixed(0)}%`;
            btn.title = getLabel(newScale);
            btn.setAttribute('aria-label', getLabel(newScale));
        };
        return btn;
    };

    const runSafetyCheck = () => {
        const input = document.querySelector('div[data-qa="input_restriction"]');
        const footer = document.getElementById('chat-form-controls');
        const headerCallBtn = document.getElementById('chatInfoCallBtn');
        const footerTempBtn = document.getElementById('templateSelector');
        if (!input || !footer) return;

        if (footerTempBtn && !document.getElementById('cx-mag-input')) { footerTempBtn.parentNode.insertBefore(createMagButton('cx-mag-input', 'input'), footerTempBtn); }
        if (headerCallBtn && !document.getElementById('cx-mag-history')) { headerCallBtn.parentNode.insertBefore(createMagButton('cx-mag-history', 'history'), headerCallBtn); }

        let shield = document.getElementById('cx-safety-shield');
        if (!shield) {
            shield = document.createElement('div');
            shield.id = 'cx-safety-shield';
            shield.innerHTML = '<span class="cx-shield-label">⚠️ SMS LIMIT</span>';
            footer.appendChild(shield);
        }
        shield.classList.toggle('active', (input.textContent || "").length > SMS_MAX);
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const input = document.querySelector('div[data-qa="input_restriction"]');
            if (input && input.contains(e.target) && input.textContent.length > SMS_MAX) { e.preventDefault(); e.stopImmediatePropagation(); }
        }
    }, true);

    injectStyles();
    const observer = new MutationObserver(() => runSafetyCheck());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    // ── Bundled Helper: Character Progress Bar ─────────────────────────────────
    (() => {
        const LIMIT = 160;

        const getBarColor = (len) => {
            if (len <= 140) return '#27ae60';
            if (len <= 150) return '#f1c40f';
            if (len <= 160) return '#e67e22';
            return '#e74c3c';
        };

        const getStatusText = (len) => {
            if (len <= 140) return 'OK';
            if (len <= 150) return 'Caution';
            if (len <= 160) return 'Warning';
            return 'Over limit';
        };

        const getLabel = (len) => `SMS character count: ${len} of ${LIMIT} — ${getStatusText(len)}`;

        const validateAndRender = () => {
            const inputField = document.querySelector('div[data-qa="input_restriction"]');
            const inputRestriction = document.querySelector('.input-restriction');
            const sendBtn = document.querySelector('#sendMessageBtn');

            if (!inputField || !inputRestriction || !sendBtn) {
                window.requestAnimationFrame(validateAndRender);
                return;
            }

            const msgText = inputField.innerText || "";
            const len = msgText.length;
            const pct = Math.min((len / LIMIT) * 100, 100);
            const color = getBarColor(len);
            const label = getLabel(len);

            // Apply the bar to .input-restriction (the wrapper) via borderBottom
            // This is the same element the working reference used, just with color
            inputRestriction.style.borderBottom = `5px solid ${color}`;
            inputRestriction.style.backgroundImage = `linear-gradient(to right, ${color} ${pct}%, rgba(0,0,0,0.08) ${pct}%)`;
            inputRestriction.style.backgroundSize = `100% 5px`;
            inputRestriction.style.backgroundRepeat = `no-repeat`;
            inputRestriction.style.backgroundPosition = `bottom`;
            inputRestriction.style.borderBottom = `none`;

            // Aria + hover on the wrapper
            inputRestriction.title = label;
            inputRestriction.setAttribute('aria-label', label);
            inputRestriction.setAttribute('role', 'progressbar');
            inputRestriction.setAttribute('aria-valuenow', String(len));
            inputRestriction.setAttribute('aria-valuemin', '0');
            inputRestriction.setAttribute('aria-valuemax', String(LIMIT));

            // Send button gating
            const isOver = len > LIMIT;
            sendBtn.style.opacity = isOver ? "0.2" : "1";
            sendBtn.style.pointerEvents = isOver ? "none" : "auto";

            setTimeout(() => window.requestAnimationFrame(validateAndRender), 500);
        };

        setTimeout(validateAndRender, 4000);
    })();
    // ── End Bundled Helper ─────────────────────────────────────────────────────

})();
