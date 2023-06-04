// ==UserScript==
// @name         Quotations sidebar
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @exclude      /^https://.*?126.com/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

/*
 *  2023/6/3 下午9:52
 * 逐步改造成大纲式
 * 双击进入item的修改模式实现
 * */

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
      z-index: -9999;
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

        var url = window.location.origin + window.location.pathname;
        var title = document.title;
        var linkage = `[${title}](${url})`;

        var sidebarText = '';


        // add linkage
        sidebarText += linkage + '\n';

        var sidebarItems = sidebar.querySelectorAll('.snippet');
        for (var i = 0; i < sidebarItems.length; i++) {
            // 缩进
            sidebarText += `    ` + sidebarItems[i].textContent + '\n';
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
        top: 60px;
        right: 20px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #aaa;
        color: white;
        border: none;
        outline: none;
        cursor: pointer;
        z-index: 9999;
    `;

    // 添加点击事件监听器
    toggleSidebar.addEventListener('click', () => {
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0' && runScript) ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
        runScript = true;
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
            // 清除选区，避免重复添加
            window.getSelection().removeAllRanges();
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
        opacity: 100;
        color: #333;
    `;

    // Define input style 
    var textareaStyle = `
        list-style-type: none;
        padding: 10px 5px;
        margin: 10px 10px;
        border: none;
        border-left: 3px solid #feb92c;
        background-color: #F5F5F5;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        font-size: 12px;
        font-weight: normal;
        opacity: 100;
        color: #333;
        width: 100%;
        box-sizing: border-box;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        resize: none;
        overflow: hidden; // 隐藏滚动条
    `;

    function addToSidebar(text, e) {
        const snippet = document.createElement('div');
        snippet.textContent = text;
        snippet.style.cssText = snippetStyle;
        snippet.dataset.index = snippetCount;
        snippet.classList.add('snippet');

        snippetCount += 1;

        // Animate adding text to the sidebar
        fadeIn(snippet,30);

        // 添加点击事件，跳转到原文位置
        snippet.addEventListener('click', jumpBack);

        // 双击进入编辑状态
        snippet.addEventListener('dblclick', transToComposing);

        sidebar.appendChild(snippet);
    }

    function transToComposing(event) {
        const snippet = event.currentTarget;

        // 创建一个textarea元素
        const textarea = document.createElement('textarea');
        textarea.value = snippet.textContent;
        textarea.style.cssText = textareaStyle;

        // 在sidebar中用textarea替换snippet
        sidebar.replaceChild(textarea, snippet);

        // 为textarea添加输入事件监听器
        textarea.addEventListener('input', adjustHeight);

        // 为textarea添加失去焦点事件
        textarea.addEventListener('blur', transToSnippet);

        // 按下enter键
        // 为textarea对应的snippet添加新增一个同级的snippet
        // 流程梳理如下：
        // todo：
        // 1- 在编辑状态下，侦听enter键
        // 2- textarea转化成snippet
        // 3- sidebar增加一条新的snippet，位置就在这条之下
        // 4- 新的snippet进入到编辑状态
        
        // 在编辑状态下，侦听Enter键
        textarea.addEventListener('keydown', handleEnterKey);

        // 自动聚焦到textarea并调整高度
        textarea.focus();
        adjustHeight();

        function adjustHeight() {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        function handleEnterKey(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                //replaceTextareaWithSnippet();
                //transToSnippet();
                createNewSnippet(snippet);
            }
        }

        function transToSnippet() {

            replaceTextareaWithSnippet();

            // 重新为snippet添加双击进入编辑状态事件
            snippet.addEventListener('dblclick', transToComposing);
        }

        function replaceTextareaWithSnippet() {
            // 移除输入事件监听器
            textarea.removeEventListener('input', adjustHeight);
            // 移除键盘事件监听器
            textarea.removeEventListener('keydown', handleEnterKey);

            // 更新snippet的文本并替换textarea
            snippet.textContent = textarea.value;
            console.log(snippet);
            console.log(textarea);
            sidebar.replaceChild(snippet, textarea);
        }
    }

    // animation as snippet added
    function fadeIn(snippet,duration){
        var opacity = 0;
        var interval = setInterval(function(){
            opacity += 0.1;
            snippet.style.opacity = opacity;
            if(opacity >= 1){
                clearInterval(interval);
            }
        }, duration);
    }

    // 创建新的snippet并插入到当前snippet的下方
    function createNewSnippet(currentSnippet) {
        const newSnippet = document.createElement('div');
        newSnippet.textContent = '';
        newSnippet.style.cssText = snippetStyle;
        newSnippet.addEventListener('dblclick', transToComposing);

        // 将新snippet插入到当前snippet的下方
        sidebar.insertBefore(newSnippet, currentSnippet.nextSibling);

        // 进入新snippet的编辑状态
        //const event = new MouseEvent('dblclick', {
        //    bubbles: true,
        //    cancelable: true,
        //    view: window
        //});
        const event = document.createEvent('MouseEvent');
        event.initMouseEvent('dblclick', true, true, window);

        newSnippet.dispatchEvent(event);
    }

    // 跳转事件
    function jumpBack(event) {
        const snippet = event.currentTarget;
        const highlighted = document.querySelector(`.highlighted[data-index="${snippet.dataset.index}"]`);
        if (highlighted) {
            highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 处理取消选择的情况
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            window.getSelection().removeAllRanges();
        }
    }
    document.addEventListener('keydown', handleKeyDown);

    // 高亮选区
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

            // 重新选中先前选中的文本
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

})();
