// ==UserScript==
// @name         GPT4 sidebar
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @description  diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // 创建一个侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
      position: fixed;
      right: 0;
      top: 50%;
      width: 400px;
      height: 300px;
      background: white;
      border-left: 1px solid #ccc;
      overflow-y: auto;
      transform: translateY(-50%);
      padding: 0px;
      box-sizing: border-box;
      box-shadow: 2px 2px 4px #ccc;
      z-index: 9999;
    `;

    // 添加侧边栏到页面
    document.body.appendChild(sidebar);

    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();
        // 检测是否为sidebar中的文字
        // sidebar中的文字不做处理，避免重复添加
        const target = event.target;

        if (selectedText.length > 0 && !sidebar.contains(target)) {
            addToSidebar(selectedText, e);
            highlightSelectedText();
        }
    });
    let snippetCount = 0;

    // Define Diigo style for list items
    var snippetStyle = 'list-style-type: none;' +
                         'padding: 10px 5px;' +
                         'margin: 10px 0;' +
                         'border-left: 3px solid #feb92c;' +
                         'background-color: #F5F5F5;' +
                         'box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);' +
                         'font-size: 12px;' +
                         'font-weight: normal;' +
                         'opacity: 0;' +
                         'color: #333;';

    function addToSidebar(text, e) {
        const snippet = document.createElement('div');
        snippet.textContent = text;
        snippet.style.cssText = snippetStyle;
        snippet.dataset.index = snippetCount;

        snippetCount += 1;

        // Animate adding text to the sidebar
        var opacity = 0;
        var interval = setInterval(function(){
            opacity += 0.1;
            snippet.style.opacity = opacity;
            if(opacity >= 1){
                clearInterval(interval);
            }
        }, 50);

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

            // 通过先extract，再insert可以避免
            // Non-Text元素包裹的错误
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            selection.removeAllRanges();
        }
    }

})();
