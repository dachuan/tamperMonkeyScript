// ==UserScript==
// @name         Embed iframe floating window with smooth dragging
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Embed an iframe floating window in the current webpage with smooth dragging using requestAnimationFrame
// @author       GPT-4
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the iframe element
    const iframe = document.createElement('iframe');
    iframe.src="https://app.databerry.ai/agents/clio35euh0000e9og962d4g16/iframe";
    iframe.style.width = '120%';
    iframe.style.height = 'calc(200% - 20px)'; // Adjust height to account for the title bar
    iframe.style.border = '1px solid #ccc';

    // Create the title bar
    const titleBar = document.createElement('div');
    titleBar.textContent = 'Ask me anything';
    titleBar.style.width = '120%';
    titleBar.style.height = '20px';
    titleBar.style.backgroundColor = '#ccc';
    titleBar.style.color = '#000';
    titleBar.style.textAlign = 'center';
    titleBar.style.lineHeight = '20px';
    titleBar.style.cursor = 'move';

    // Create a draggable div wrapper for the iframe
    const draggableDiv = document.createElement('div');
    draggableDiv.appendChild(titleBar);
    draggableDiv.appendChild(iframe);
    draggableDiv.style.position = 'fixed';
    draggableDiv.style.width = '400px';
    draggableDiv.style.height = '300px';
    draggableDiv.style.top = '10px';
    draggableDiv.style.right = '10px';
    draggableDiv.style.zIndex = '99999';

    // Append the draggable div to the body
    document.body.appendChild(draggableDiv);

    // Initialize dragging variables
    let isMouseDown = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let requestID;

    // Mouse down event handler
    titleBar.addEventListener('mousedown', (event) => {
        event.preventDefault();
        document.body.style.pointerEvents = 'none';
        const draggableDivRect = draggableDiv.getBoundingClientRect();
        isMouseDown = true;
        dragOffsetX = event.clientX - draggableDivRect.left;
        dragOffsetY = event.clientY - draggableDivRect.top;
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    // Mouse move event handler
    function onMouseMove(event) {
        if (isMouseDown) {
            if (requestID) {
                cancelAnimationFrame(requestID);
            }
            requestID = requestAnimationFrame(() => {
                draggableDiv.style.left = (event.clientX - dragOffsetX) + 'px';
                draggableDiv.style.top = (event.clientY - dragOffsetY) + 'px';
            });
        }
    }

    // Mouse up event handler
    function onMouseUp() {
        isMouseDown = false;
        document.body.style.pointerEvents = 'auto';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }
})();
