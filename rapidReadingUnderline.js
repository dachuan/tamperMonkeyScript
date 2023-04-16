// ==UserScript==
// @name         Rapid Reading Underline
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @description  ctr + shift + k  for activate underline, q for catch text
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // setting
    const pace = 10;// how many texts underlined
    const delay = 300;// time delayed
    const line_color = 'red';// underline color
    const box_color = 'red';// catch text color
    const frame_color = '#55c8d7';// selected frame color
    let act_it = false; // activate function or not
    let catch_it = false;// catch text or not
    let onProcessing = false; //check if is on the running

    // Define the key combination to listen for
    const keys = {
        ctrl: false,
        alt: false,
        shift: false,
        key: ''
    };

    // Listen for keydown events
    document.addEventListener('keydown', event => {
        // Update the keys object based on which key was pressed
        switch (event.key) {
            case 'Control':
                keys.ctrl = true;
                break;
            case 'Alt':
                keys.alt = true;
                break;
            case 'Shift':
                keys.shift = true;
                break;
            default:
                keys.key = event.key;
                break;
        }

        // Check if the key combination was pressed
        // 设置了 ctr shift k as toggle
        if (keys.ctrl && keys.shift && keys.key === 'K') {
            // Do something here
            console.log("combo key pressed.");
            act_it = true;
        }

        // check to catch text by key q
        if (keys.key === 'q') {
            // Do something here
            console.log("catch text");
            catch_it = true;
        }

    });

    // Listen for keyup events
    document.addEventListener('keyup', event => {
        // Update the keys object based on which key was released
        switch (event.key) {
            case 'Control':
                keys.ctrl = false;
                break;
            case 'Alt':
                keys.alt = false;
                break;
            case 'Shift':
                keys.shift = false;
                break;
            default:
                keys.key = '';
                break;
        }
    });

    // underline the text nodes
    // --------------------
    function findTextNodes(element) {
        let textNodes = [];
        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                textNodes.push(child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                textNodes.push(...findTextNodes(child));
            }
        }
        return textNodes;
    }

    function catchBox(seg){
        seg.style.border = `2px solid ${box_color}`;
    }

    async function animateUnderline(textNode) {
        const text = textNode.textContent;
        const parent = textNode.parentElement;

        const wrapper = document.createElement('span');
        parent.replaceChild(wrapper, textNode);

        // segments in one textNode
        // slice one textNode into several segs
        const range = pace;
        const segs = [];
        for (let i = 0; i < text.length; i += range) {
            const seg = document.createElement('span');
            seg.textContent = text.slice(i, i+range);
            wrapper.appendChild(seg);
            //seg.style.border = "2px solid red";
            segs.push(seg);
        }

        for (let i=0;i < segs.length;i++){
            segs[i].style.textDecoration = 'underline';
            segs[i].style.textDecorationColor = line_color;

            await new Promise(r => setTimeout(r, delay));

            // if q is pressed, cath this seg
            if(catch_it){
                catchBox(segs[i]);
                catch_it = false;
            }

            segs[i].style.textDecoration = '';
        }

    }

    async function processAllTextNodes(dom_js) {
        const textNodes = findTextNodes(dom_js);
        for (const textNode of textNodes) {
            await animateUnderline(textNode);
        }
    }

    // inspect dom
    // do underline when click
    // --------------------

    function highlightElement(element) {
        element.style.outline = `1px solid ${frame_color}`;
    }

    function removeHighlight(element) {
        element.style.outline = '';
    }

    document.addEventListener('mouseover', event => {
        const element = event.target;
        if(!onProcessing && act_it){
            highlightElement(element);
        }
    });

    document.addEventListener('mouseout', event => {
        const element = event.target;
        if(!onProcessing && act_it){
            removeHighlight(element);
        }
    });

    document.addEventListener('click', event => {
        const element = event.target;
        if (act_it){
            onProcessing = true;
            act_it = false;
            processAllTextNodes(element).then(result => {
            onProcessing = false;
            removeHighlight(element);
        });
        }
    });
})();
