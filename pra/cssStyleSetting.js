// ==UserScript==
// @name         Set CSS for .inner-item
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Set CSS for .inner-item class
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建一个 <style> 元素
    const style = document.createElement('style');
    style.type = 'text/css';

    // 设置 CSS 规则
    style.innerHTML = `
        .inner-item {
            list-style-type: none;
            padding: 10px 5px;
            margin: 10px 10px;
            border-left: 3px solid #feb92c;
            background-color: #F5F5F5;
            box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }
    `;

    // 将 <style> 元素添加到页面的 <head> 中
    document.head.appendChild(style);
})();
