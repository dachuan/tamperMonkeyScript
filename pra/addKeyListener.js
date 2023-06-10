// ==UserScript==
// @name         KeyListener
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  key listener for activate some function
// @author       dcthehiker
// @match        http*://0.0.0.0
// @match        http*://localhost:*
// @match        http*://localhost:8000/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// @require       file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/keyHandler.js
// ==/UserScript==

(function() {
    'use strict';
    
    const keyHandler = new KeyHandler();

    keyHandler.doubleKey('s',1000,()=>{console.log('double s')});

})();
