// ==UserScript==
// @name         Rapid Reading Underline
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description  ctr + shift + k  for activate underline, ctr + f for catch text,ctr + h,l speed control
// @author       dcthehiker
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/segmentit@2.0.3/dist/umd/segmentit.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

// use word segment 
const segmentit = Segmentit.useDefault(new Segmentit.Segment());

(function() {
    'use strict';

    // setting
    const pace = 5;// how many words underlined
    let delay = 300;// time delayed
    const line_color = 'red';// underline color
    const box_color = 'red';// catch text color
    const frame_color = '#55c8d7';// selected frame color
    let run_script = false; // activate this script
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
            console.log("combo key pressed.");
            run_script = true;
            act_it = true;
        }

        // check to catch text by key f
        if (keys.ctrl && keys.key === 'f') {
            if(run_script){
                console.log("catch text");
                catch_it = true;
            }
        }

        // speed up and down by h l
        if (keys.ctrl && keys.key === 'l') {
            if(run_script){
                console.log("speed down");
                if (delay > 100){
                    delay -= 100;
                    console.log(delay);
                }
            }
        }

        if (keys.ctrl && keys.key === 'h') {
            if(run_script){
                console.log("speed up");
                if (delay < 500){
                    delay += 100;
                    console.log(delay);
                }
            }
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
        // based on segmentit 
        const word_segs = segmentit.doSegment(text);
        const text_segs = [];
        for (const w of word_segs){
            const t = w.w;

            text_segs.push(t);
        }

        // reform text_segs according to pace
        function groupByPace(arr, pace) {
            const result = [];
            for (let i = 0; i < arr.length; i += pace) {
              result.push(arr.slice(i, i + pace).join(""));
            }
            return result;
        }

        const group_segs = groupByPace(text_segs,pace);

        const segs = [];
        for (let i = 0; i < group_segs.length; i++) {
            const seg = document.createElement('span');
            seg.textContent = group_segs[i];
            wrapper.appendChild(seg);
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
            act_it = true;
        });
        }
    });
})();
