// ==UserScript==
// @name         SMS Guard: Z-Shield (Accessibility Professional)
// @namespace    https://github.com/calldestn
// @version      1.7.0
// @description  Accessibility & Safety Overlay: Provides high-visibility alerts and font magnification for users with visual impairments to prevent SMS errors.
// @author       callme
// @match        https://*.3cx.cloud/*
// @license      AGPL-3.0-or-later
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/568472/SMS%20Guard%3A%20Z-Shield%20%28Accessibility%20Professional%29.user.js
// @updateURL https://update.greasyfork.org/scripts/568472/SMS%20Guard%3A%20Z-Shield%20%28Accessibility%20Professional%29.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // ── Dynamic identifiers
    const _id = (tag) => tag + '-' + Math.random().toString(36).slice(2, 9);
    const IDS = {
        styles:     _id('s'),
        shield:     _id('s'),
        shieldHost: _id('s'),
        magInput:   _id('s'),
        magHistory: _id('s'),
        magHostInput:   _id('s'),
        magHostHistory: _id('s'),
    };

    // ── localStorage keys ──────────────────────────────────────────
    const STORE = {
        inputScale: '_ui_config_scale_a',
        chatScale:  '_ui_config_scale_b',
    };

    const SMS_MAX = 160;
    let inputScale = parseFloat(localStorage.getItem(STORE.inputScale)) || 1.0;
    let chatScale = parseFloat(localStorage.getItem(STORE.chatScale)) || 1.0;

    // ── Global CSS  ──────────────────────────────
    const injectStyles = () => {
        const old = document.getElementById(IDS.styles);
        if (old) old.remove();
        const style = document.createElement('style');
        style.id = IDS.styles;
        style.innerHTML = `
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

    const createShadowHost = (hostId, innerHTML, innerCSS) => {
        const host = document.createElement('span');
        host.id = hostId;
        // Closed mode: shadow root reference is never exposed to the page
        const shadow = host.attachShadow({ mode: 'closed' });
        if (innerCSS) {
            const s = document.createElement('style');
            s.textContent = innerCSS;
            shadow.appendChild(s);
        }
        const wrapper = document.createElement('span');
        wrapper.innerHTML = innerHTML;
        shadow.appendChild(wrapper);
        return { host, shadow, wrapper };
    };

    // ── Shield ────────────────────────────────────────────
    let shieldShadowWrapper = null;

    const ensureShield = (footer) => {
        if (document.getElementById(IDS.shieldHost)) return;

        const css = `
            .shield {
                position: absolute; right: 0; top: 0;
                height: 100%; width: 0;
                background-color: #d32f2f;
                color: white; z-index: 10000;
                display: flex; justify-content: center; align-items: center;
                overflow: hidden; transition: width 0.3s ease;
                pointer-events: all; cursor: not-allowed;
                border-radius: 8px 0 0 8px;
            }
            .shield.active {
                width: 140px;
                box-shadow: -5px 0 15px rgba(0,0,0,0.2);
            }
            .label {
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease;
                transition-delay: 0s;
                pointer-events: none;
                font-size: 1.2rem;
                font-weight: bold;
            }
            .shield.active .label {
                opacity: 1;
                transition-delay: 0.25s;
            }
        `;

        const { host, shadow, wrapper } = createShadowHost(
            IDS.shieldHost,
            `<div class="shield"><span class="label">⚠️ SMS LIMIT</span></div>`,
            css
        );

        host.style.cssText = 'position:absolute;right:0;top:0;height:100%;width:0;pointer-events:none;';
        footer.style.position = 'relative';
        footer.appendChild(host);

        shieldShadowWrapper = shadow.querySelector('.shield');
    };

    const updateShield = (isOver) => {
        if (!shieldShadowWrapper) return;
        shieldShadowWrapper.classList.toggle('active', isOver);
    };

    // ── Magnification button ────────────────────────────────────
    const createMagButton = (hostId, type) => {
        const currentVal = type === 'input' ? inputScale : chatScale;
        const zone = type === 'input' ? 'Input Text' : 'Chat History';
        const getLabel = (scale) => `Zoom ${zone}: ${(scale * 100).toFixed(0)}% (click to increase)`;

        const css = `
            button {
                display: inline-flex; align-items: center; justify-content: center;
                padding: 0 10px; min-width: 44px; cursor: pointer;
                color: inherit; background: none; border: none;
                font-family: inherit;
            }
            svg { width: 18px; height: 18px; fill: currentColor; }
            .zoom-text { font-size: 9px; margin-left: 2px; font-weight: bold; }
        `;

        const svgPath = `M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z`;

        const { host, shadow } = createShadowHost(
            hostId,
            `<button type="button" title="${getLabel(currentVal)}" aria-label="${getLabel(currentVal)}">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path d="${svgPath}"/></svg>
                <span class="zoom-text" aria-live="polite">${(currentVal * 100).toFixed(0)}%</span>
            </button>`,
            css
        );

        const btn = shadow.querySelector('button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (type === 'input') {
                inputScale = inputScale >= 2.0 ? 1.0 : inputScale + 0.25;
                localStorage.setItem(STORE.inputScale, inputScale);
            } else {
                chatScale = chatScale >= 2.0 ? 1.0 : chatScale + 0.25;
                localStorage.setItem(STORE.chatScale, chatScale);
            }
            injectStyles();
            const newScale = type === 'input' ? inputScale : chatScale;
            const label = getLabel(newScale);
            shadow.querySelector('.zoom-text').textContent = `${(newScale * 100).toFixed(0)}%`;
            btn.title = label;
            btn.setAttribute('aria-label', label);
        });

        return host;
    };

    // ── Safety check ────────────────────
    const runSafetyCheck = () => {
        const input = document.querySelector('div[data-qa="input_restriction"]');
        const footer = document.getElementById('chat-form-controls');
        const headerCallBtn = document.getElementById('chatInfoCallBtn');
        const footerTempBtn = document.getElementById('templateSelector');
        if (!input || !footer) return;

        // Inject mag buttons as shadow hosts if not yet present
        if (footerTempBtn && !document.getElementById(IDS.magHostInput)) {
            footerTempBtn.parentNode.insertBefore(createMagButton(IDS.magHostInput, 'input'), footerTempBtn);
        }
        if (headerCallBtn && !document.getElementById(IDS.magHostHistory)) {
            headerCallBtn.parentNode.insertBefore(createMagButton(IDS.magHostHistory, 'history'), headerCallBtn);
        }

        ensureShield(footer);
        updateShield((input.textContent || '').length > SMS_MAX);
    };

    // ── Enter key block so you don't send a message that will fail ──────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const input = document.querySelector('div[data-qa="input_restriction"]');
            if (input && input.contains(e.target) && input.textContent.length > SMS_MAX) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    }, true);

    // ── Boot ──────────────────────────────────────────────────────────────────
    injectStyles();
    const observer = new MutationObserver(() => runSafetyCheck());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    // ── Bundled Helper: Character Progress Bar ────────────────────────────────
    // Uses the same rAF loop pattern as the working reference. Targets
    // .input-restriction directly — no new DOM nodes, no positioning deps.
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

            const len = (inputField.innerText || '').length;
            const pct = Math.min((len / LIMIT) * 100, 100);
            const color = getBarColor(len);
            const label = getLabel(len);

            inputRestriction.style.backgroundImage = `linear-gradient(to right, ${color} ${pct}%, rgba(0,0,0,0.08) ${pct}%)`;
            inputRestriction.style.backgroundSize = '100% 5px';
            inputRestriction.style.backgroundRepeat = 'no-repeat';
            inputRestriction.style.backgroundPosition = 'bottom';
            inputRestriction.style.borderBottom = 'none';

            inputRestriction.title = label;
            inputRestriction.setAttribute('aria-label',label);
            inputRestriction.setAttribute('role','progressbar');
            inputRestriction.setAttribute('aria-valuenow', String(len));
            inputRestriction.setAttribute('aria-valuemin', '0');
            inputRestriction.setAttribute('aria-valuemax', String(LIMIT));

            const isOver = len > LIMIT;
            sendBtn.style.opacity = isOver ? '0.2' : '1';
            sendBtn.style.pointerEvents = isOver ? 'none' : 'auto';

            setTimeout(() => window.requestAnimationFrame(validateAndRender), 500);
        };

        setTimeout(validateAndRender, 4000);
    })();
    // ── End Bundled Helper ────────────────────────────────────────────────────

})();
