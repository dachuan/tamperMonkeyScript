// ==UserScript==
// @name         GPT4 sidebar
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

    // 创建一个侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 300px;
  background: white;
  border-left: 1px solid #ccc;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  z-index: 9999;
`;

    // 添加侧边栏到页面
    document.body.appendChild(sidebar);

    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();

        if (selectedText.length > 0) {
            addToSidebar(selectedText, e);
            highlightSelectedText();
        }
    });
    let snippetCount = 0;

    function addToSidebar(text, e) {
        const snippet = document.createElement('div');
        snippet.textContent = text;
        snippet.style.cssText = `
    margin-bottom: 10px;
    cursor: pointer;
  `;
    snippet.dataset.index = snippetCount;

    snippetCount += 1;

    // 添加点击事件，跳转到原文位置
    snippet.addEventListener('click', () => {
        const highlighted = document.querySelector(`.highlighted[data-index="${snippet.dataset.index}"]`);
        if (highlighted) {
            highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    sidebar.appendChild(snippet);
}

    function highlightSelectedText() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = 'yellow';
            span.className = 'highlighted';
            span.dataset.index = snippetCount - 1;
            range.surroundContents(span);
            selection.removeAllRanges();
        }
    }

})();
