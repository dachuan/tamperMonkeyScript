// ==UserScript==
// @name         outliner sidebar
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  outliner diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @exclude      /^https://.*?126.com/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=workflowy.com
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/outliner.js
// @grant        none
// ==/UserScript==

/*
 * 改造成outline
 *  ------------------------------
 *  2023/6/9 下午3:52
 *  ------------------------------
 *  调整localStorage的key
 *  指向每一个页面href
 *
 *  ------------------------------
 *  2023/6/8 下午2:26
 *  ------------------------------
 *  应用新的创建snippet的方法
 *  整合存储模块
 *  [x]调整webstorage的outliner重构方法
 *
 *  ------------------------------
 *  2023/6/6 上午10:25
 *  ------------------------------
 *  完成了大纲导出
 *  改进了初始不能收录高亮的问题
 *  完成单击跳转到原文
 *  todo:
 *  - 样式调整 done
 *  - 最上头的时间样式
 *
 *  ------------------------------
 *  2023/6/5 下午2:15
 *  ------------------------------
 *  初步实现了加载outline
 *  todo:
 *  - 样式调整
 *  - 代码优化
 * */

(function() {
    'use strict';

    console.log('hightlight bugs');

    // 创建一个 <style> 元素
    const style = document.createElement('style');
    style.type = 'text/css';

    // 设置 CSS 规则
    style.innerHTML = `
        .inner-item {
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }

        .snippet {
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

    // 初始化outliner，存储数据
    const olEditor = outliner();
    const webStorage = annotationStorage();

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
    // 同时将数据保存到local storage
    titleContainer.addEventListener('click', function(event) {
        var url = window.location.origin + window.location.pathname;
        var title = document.title;
        var linkage = `[${title}](${url})`;

        var sidebarText = '';

        // add linkage
        sidebarText += linkage + '\n';

        // add all items in outliner
        var outlinerText = olEditor.outlineEditor.exportAllItems();
        sidebarText += outlinerText;

        navigator.clipboard.writeText(sidebarText);
        tipOfCopy();

        // 保存页面数据
        webStorage.saveAllAnnotations();
    });

    sidebar.appendChild(titleContainer);
    sidebar.appendChild(olEditor);

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
    // 初始化outliner的条目
    // 读取存储数据
    toggleSidebar.addEventListener('click', () => {
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0' && runScript) ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
        runScript = true;

        // make the first item
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const startTime = `Date: ${date} Time: ${time}`;

        if (olEditor.outlineEditor.children.length === 0) {
            const startItem = document.createElement('li');
            startItem.classList.add('starter');
            startItem.textContent = '\u200B' + startTime; // Zero-width space
            olEditor.outlineEditor.appendChild(startItem);
            olEditor.outlineEditor.lastActiveNode = startItem;

            // 读取存储数据
            // 进行页面重构
            webStorage.applyAllData();
        }
    });

    document.body.appendChild(toggleSidebar);

    // 划词生成snippet，添加到outliner中
    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();

        // 检测是否为sidebar中的文字
        // sidebar中的文字不做处理，避免重复添加
        const target = event.target;

        if (selectedText.length > 0 && !sidebar.contains(target) && runScript) {
            // 文章中的高亮与outliner中item，保持一致的datasetIndex
            const equalDataSetIndex = Date.now();
            highlightSelectedText(equalDataSetIndex);

            // 创建一个新的snippet
            // 调用outliner自身的创建方法
            olEditor.outlineEditor.appendNewItem(selectedText, 'snippet', equalDataSetIndex);
            //console.log('add snippet to outline');

            // 侦听这个新建snippet的单击侦听
            const newAddedSnippet = document.querySelector(`.snippet[data-index="${equalDataSetIndex}"]`);
            newAddedSnippet.style.cssText = snippetStyle;

            newAddedSnippet.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡
                const highlighted = document.querySelector(`.highlighted[data-index="${newAddedSnippet.dataset.index}"]`);
                if (highlighted) {
                    highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            // 清除选区，避免重复添加
            window.getSelection().removeAllRanges();
            // 滚动到最后
            sidebar.scrollTop = sidebar.scrollHeight;
        }
    });

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

    // esc键处理取消选择的情况
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            window.getSelection().removeAllRanges();
        }

        //tmp for trace the restore
        if (event.key === 'q') {
            event.preventDefault();
            console.log("outlineEditor is : ", olEditor.outlineEditor);
        }
    }
    document.addEventListener('keydown', handleKeyDown);

    // 高亮选区
    function highlightSelectedText(equalDataSetIndex) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = 'yellow';
            span.className = 'highlighted';
            span.dataset.index = equalDataSetIndex;

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


    // 数据存储于local storage
    function annotationStorage() {
        //console.log('storage pra');
        //
        const webStorage = {};
      
        const storageKey = 'highlightedData_' + window.location.href;
        const savedHighlightData = localStorage.getItem(storageKey);
        //console.log(savedOutlinerData);
      
        // 重新恢复页面
        // 包含outliner与页面高亮
        webStorage.applyAllData = function() {
            console.log('loading data...');

            // 读取，并重新高亮
            if (savedHighlightData) {
                const parsedData = JSON.parse(savedHighlightData);
                parsedData.forEach((entry) => {
                  applyHighlight(entry);
                });
                console.log('apply all highlighted.');
            }

            // 读取，并重新形成outliner
            olEditor.outlineEditor.restoreData();
            // 遍历所有snippet，增加跳转到原文高亮的侦听
            const snippets = Array.from(olEditor.outlineEditor.querySelectorAll('li')).filter(item => item.classList.contains('snippet'));
            snippets.forEach(snippet => {
                snippet.addEventListener('click', (e) => {
                    //console.log("clicked");
                    e.stopPropagation(); // 防止事件冒泡
                    const highlighted = document.querySelector(`.highlighted[data-index="${snippet.dataset.index}"]`);
                    if (highlighted) {
                        highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            });
            console.log('apply outliner.');
        }
      
        // 存储数据
        webStorage.saveAllAnnotations = function() {
            const highlightedSpans = document.querySelectorAll('.highlighted');
            const data = Array.from(highlightedSpans).map((span) => {
              return {
                xpath: getXPath(span.parentNode),
                text: span.textContent,
                dataset_index: span.dataset.index
              };
            });

            // 使用当前页面的 URL 作为存储键
            const storageKey = 'highlightedData_' + window.location.href;
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log('highlighted saved.');

            // 调用outliner中的数据保存方法
            olEditor.outlineEditor.saveData();
            console.log('outliner saved');
      
        }
      
        function getXPath(element) {
            if (element.id !== '') {
              return 'id("' + element.id + '")';
            }
            if (element === document.body) {
              return element.tagName.toLowerCase();
            }
      
            let siblingIndex = 1;
            let sibling = element;
            while ((sibling = sibling.previousElementSibling)) {
              siblingIndex++;
            }
      
            return (
              getXPath(element.parentNode) +
              '/' +
              element.tagName.toLowerCase() +
              '[' +
              siblingIndex +
              ']'
            );
        }
      
        function applyHighlight(entry) {
            console.log('text: ', entry.text);
            console.log('xpath: ', entry.xpath);
            console.log(' ------------------------------')
            const parent = document.evaluate(
              entry.xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (!parent) return;
      
            const textNodeIndex = Array.from(parent.childNodes).findIndex(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent.includes(entry.text)
            );
            if (textNodeIndex === -1) return;
      
            const textNode = parent.childNodes[textNodeIndex];
            const highlightedSpan = document.createElement('span');
            highlightedSpan.className = 'highlighted';
            highlightedSpan.style.backgroundColor = 'yellow';
            highlightedSpan.textContent = entry.text;
            highlightedSpan.dataset.index = entry.dataset_index;
      
            const text = textNode.textContent;
            const textBefore = text.substring(0, text.indexOf(entry.text));
            const textAfter = text.substring(textBefore.length + entry.text.length);
      
            if (textBefore) {
              parent.insertBefore(document.createTextNode(textBefore), textNode);
            }
            parent.insertBefore(highlightedSpan, textNode);
            if (textAfter) {
              parent.insertBefore(document.createTextNode(textAfter), textNode);
            }
            parent.removeChild(textNode);
        }
      
        return webStorage
    }

    // ------------------------------
    // backup
    // ------------------------------
})();
