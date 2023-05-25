// ==UserScript==
// @name         Split Screen Iframe
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Split screen with two iframes and adjustable divider
// @author       GPT-4
// @match        *://*/*
// @grant        none
// ==/UserScript==

/*
 * GPT实现了左右分屏，并且可以拖动调整大小
 *
 * */

(function() {
    'use strict';

    // Save the original content
    const originalContent = document.documentElement.innerHTML;

    // Clear the current content and set up the container
    document.documentElement.innerHTML = '';
    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    document.documentElement.appendChild(container);

    // Create the left iframe and set its content
    const leftIframe = createIframe('0', '50%', container);
    leftIframe.contentWindow.document.write(originalContent);

    // Create the right iframe and set its content
    const rightIframe = createIframe('50%', '50%', container);
    rightIframe.contentWindow.document.write('<h1>Hello world</h1>');

    // Create the divider
    const divider = document.createElement('div');
    divider.style.width = '4px';
    divider.style.height = '100%';
    divider.style.backgroundColor = '#ccc';
    divider.style.position = 'absolute';
    divider.style.top = '0';
    divider.style.left = '50%';
    divider.style.cursor = 'col-resize';
    container.appendChild(divider);

    // Create the transparent overlay
    const overlay = document.createElement('div');
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'none';

    container.appendChild(overlay);

    // Make the divider draggable
    divider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        overlay.style.display = 'block';
        document.documentElement.style.userSelect = 'none';

        const onMouseMove = (e) => {
            const x = e.clientX;
            const width = window.innerWidth;
            const percentage = (x / width) * 100;

            if (percentage < 10 || percentage > 90) {
                return;
            }
            leftIframe.style.width = `${percentage}%`;
            divider.style.left = `${percentage}%`;
            rightIframe.style.left = `${percentage + 0.5}%`;
            rightIframe.style.width = `${100 - percentage - 0.5}%`;
        };

        const onMouseUp = () => {
            document.documentElement.style.userSelect = '';
            overlay.style.display = 'none';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function createIframe(left, width, container) {
        const iframe = document.createElement('iframe');
        iframe.style.width = width;
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = left;
        container.appendChild(iframe);
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.close();
        return iframe;
    }

})();
