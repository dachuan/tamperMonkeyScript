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
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/pra/local_js.js
// @grant        none
// ==/UserScript==
/*
 * 加载本地js包
 * @require的方法
 * */

(function() {
    'use strict';

    console.log('loading...');

    loadJS();

    // Your code here...
})();
