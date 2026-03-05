// ==UserScript==
// @name         SMS Guard: Z-Shield (Compatible with 3CX PWA)
// @namespace    https://github.com/calldestn
// @version      1.1.0
// @description  Accessibility & Safety Overlay: Provides high-visibility alerts and font magnification for users with visual impairments to prevent SMS errors.
// @author       callme
// @match        https://*.3cx.cloud/*
// @license      AGPL-3.0-or-later
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const SMS_MAX = 160;

    // Load saved scale or default to 1 (100%)
    let currentScale = parseFloat(localStorage.getItem('cx-accessibility-scale')) || 1.0;

    const injectStyles = () => {
        // Remove existing if updating
        const oldStyle = document.getElementById('cx-zshield-styles');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = 'cx-zshield-styles';
        style.innerHTML = `
            /* The Shield Alert */
            #cx-safety-shield {
                position: absolute !important;
                right: 0 !important; top: 0 !important;
                height: 100% !important; width: 0%;
                background-color: #d32f2f !important; color: white !important;
                z-index: 10000 !important; display: flex !important;
                justify-content: center !important; align-items: center !important;
                overflow: hidden !important; white-space: nowrap !important;
                font-family: sans-serif !important; font-weight: bold !important;
                font-size: 11px !important; transition: width 0.3s ease !important;
                pointer-events: all !important; cursor: not-allowed !important;
                border-radius: 8px 0 0 8px !important;
            }
            #cx-safety-shield.active { width: 140px !important; box-shadow: -5px 0 15px rgba(0,0,0,0.2) !important; }

            /* Accessibility Magnifier Toggle */
            #cx-magnify-ctrl {
                position: absolute; right: 155px; top: -35px;
                background: #222; color: #fff; border: 2px solid #fff;
                border-radius: 4px; padding: 2px 10px; cursor: pointer;
                font-weight: bold; z-index: 10001; font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            }
            #cx-magnify-ctrl:hover { background: #444; }

            /* Targeted UI Magnification */
            .cx-accessible-ui {
                font-size: ${14 * currentScale}px !important;
                line-height: 1.4 !important;
                transform-origin: bottom left;
            }

            #chat-form-controls { overflow: visible !important; }
        `;
        document.head.appendChild(style);
    };

    const applyAccessibility = () => {
        const input = document.querySelector('div[data-qa="input_restriction"]');
        const sendBtn = document.querySelector('button[data-qa="send_message_button"]');
        if (input) input.style.fontSize = `${14 * currentScale}px`;
        if (sendBtn) sendBtn.style.transform = `scale(${currentScale})`;
    };

    const createControls = () => {
        const controls = document.getElementById('chat-form-controls');
        if (!controls || document.getElementById('cx-magnify-ctrl')) return;

        const btn = document.createElement('button');
        btn.id = 'cx-magnify-ctrl';
        btn.innerHTML = `🔍 ZOOM: ${(currentScale * 100).toFixed(0)}%`;
        btn.title = "Accessibility Zoom (Targeted)";
        btn.onclick = (e) => {
            e.preventDefault();
            currentScale = currentScale >= 2.0 ? 1.0 : currentScale + 0.25;
            localStorage.setItem('cx-accessibility-scale', currentScale);
            injectStyles();
            applyAccessibility();
            btn.innerHTML = `🔍 ZOOM: ${(currentScale * 100).toFixed(0)}%`;
        };
        controls.appendChild(btn);
    };

    const runSafetyCheck = () => {
        const input = document.querySelector('div[data-qa="input_restriction"]');
        const controls = document.getElementById('chat-form-controls');
        if (!input || !controls) return;

        let shield = document.getElementById('cx-safety-shield');
        if (!shield) {
            shield = document.createElement('div');
            shield.id = 'cx-safety-shield';
            shield.innerHTML = '⚠️ LIMIT EXCEEDED';
            controls.appendChild(shield);
        }

        const isOver = (input.textContent || "").length > SMS_MAX;
        shield.classList.toggle('active', isOver);
        
        createControls();
        applyAccessibility();
    };

    // Block Enter Key if over limit
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const input = document.querySelector('div[data-qa="input_restriction"]');
            if (input && input.contains(e.target) && input.textContent.length > SMS_MAX) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    }, true);

    injectStyles();
    const observer = new MutationObserver(() => runSafetyCheck());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
