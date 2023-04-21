// ==UserScript==
// @name         GPT4 sidebar
// @namespace    http://tampermonkey.net/
// @version      0.0.9
// @description  diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // 脚本开关
    let runScript = false;

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
      opacity: 0;
      z-index: 9999;
    `;

    // Make the title fixed at the top of the sidebar
    const titleContainer = document.createElement('div');
    titleContainer.textContent = 'Quotations -------------------- click save all';
    titleContainer.style.cssText = `
        position: sticky;
        top: 0;
        font-size: 14px;
        font-weight: bold;
        background-color: #42bbf4;
    `;
    // 点击title复制所有文本条目
    titleContainer.addEventListener('click', function(event) {
        var sidebarText = '';
        var sidebarItems = sidebar.querySelectorAll('.snippet');
        for (var i = 0; i < sidebarItems.length; i++) {
            sidebarText += sidebarItems[i].textContent + '\n';
        }
        navigator.clipboard.writeText(sidebarText);
        tipOfCopy();
    });

    sidebar.appendChild(titleContainer);

    // copied 消息提示
    function tipOfCopy(){

        // 创建提示元素
        const tip = document.createElement('div');
        tip.textContent = 'All quotations copied.';
        tip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transition: opacity 1s ease-in-out;
            background-color: #42bbf4;
            color: #fff;
        `;
        
        // 插入到文档中
        document.body.appendChild(tip);
        
        // 1 秒后隐藏提示
        setTimeout(() => {
          tip.style.opacity = '0';
        }, 1000);
    }


    // 添加侧边栏到页面
    document.body.appendChild(sidebar);

    // 添加一个控制sidebar出现的按钮
    const toggleSidebar = document.createElement('button');
    toggleSidebar.textContent = '+';
    toggleSidebar.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #222;
        color: white;
        border: none;
        outline: none;
        cursor: pointer;
    `;
    
    // 添加点击事件监听器
    toggleSidebar.addEventListener('click', () => {
        runScript = true;
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0') ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
    });
    
    document.body.appendChild(toggleSidebar);

    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();
        // 检测是否为sidebar中的文字
        // sidebar中的文字不做处理，避免重复添加
        const target = event.target;

        if (selectedText.length > 0 && !sidebar.contains(target) && runScript) {
            addToSidebar(selectedText, e);
            highlightSelectedText();
        }
    });
    let snippetCount = 0;

    // Define Diigo style for list items
    var snippetStyle = `
        list-style-type: none;
        padding: 10px 5px;
        margin: 10px 10px;
        border-left: 3px solid #feb92c;
        background-color: #F5F5F5;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        font-size: 12px;
        font-weight: normal;
        opacity: 0;
        color: #333;
    `;

    function addToSidebar(text, e) {
        const snippet = document.createElement('div');
        snippet.textContent = text;
        snippet.style.cssText = snippetStyle;
        snippet.dataset.index = snippetCount;
        snippet.classList.add('snippet');

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
