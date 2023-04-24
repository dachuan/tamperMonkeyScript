// ==UserScript==
// @name         Copy Selected Text Button with Highlighting
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add a copy button when text is selected on a page, and highlight the selected text in yellow
// @author       Richard Feynman
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Create a button element
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy';
    copyButton.style.position = 'absolute';
    copyButton.style.display = 'none';
    document.body.appendChild(copyButton);

    // Highlight selected text in yellow
    function highlightSelectedText() {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            const highlight = document.createElement('span');
            highlight.style.backgroundColor = 'yellow';
            highlight.appendChild(range.extractContents());
            range.insertNode(highlight);
        }
    }

    // Show the button when text is selected
    document.addEventListener('mouseup', function(event) {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            highlightSelectedText();
            copyButton.style.display = 'block';
            const xpos = event.pageX + 10;
            const ypos = event.pageY - 10;
            copyButton.style.left = xpos + 'px';
            copyButton.style.top = ypos + 'px';
            copyButton.onclick = function() {
                GM_setClipboard(selectedText);
                copyButton.style.display = 'none';
            };
        } else {
            copyButton.style.display = 'none';
        }
    });
})();
