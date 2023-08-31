// ==UserScript==
// @name         boxed text
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Add event listener to detect when text is selected
    document.addEventListener('mouseup', function() { var selection = window.getSelection(); if (selection.toString().length) {
        // Wrap selected text in a span element with red border
        var span = document.createElement('span');
        span.style.border = '2px solid red';
        selection.getRangeAt(0).surroundContents(span); } }); })();
