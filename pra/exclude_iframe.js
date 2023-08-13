// ==UserScript==
// @name         exclude the script run in iframe
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  key listener for activate some function
// @author       dcthehiker
// @match        http*://0.0.0.0
// @match        http*://localhost:*
// @match        http*://localhost:8000/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

    // check if main window
    const currentWindow = window.self;
    const topWindow = window.top;

    if (currentWindow === topWindow){
        console.log('only in main window');
(function() {
    'use strict';

    
        const add = document.createElement('button');
        add.innerHTML = 'Added';
        document.body.appendChild(add);
    
})();
    }
