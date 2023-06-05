// ==UserScript==
// @name         Quotations sidebar
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @exclude      /^https://.*?126.com/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/outliner.js
// @grant        none
// ==/UserScript==

/*
 * 改造成outline
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


    const olEditor = outliner();

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
    toggleSidebar.addEventListener('click', () => {
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0' && runScript) ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
        runScript = true;
    });

    document.body.appendChild(toggleSidebar);

    // 划词生成snippet，添加到outliner中
    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();
        // 检测是否为sidebar中的文字
        // sidebar中的文字不做处理，避免重复添加
        const target = event.target;

        if (selectedText.length > 0 && !sidebar.contains(target) && runScript) {
            //addToSidebar(selectedText, e);

            highlightSelectedText();

            // 创建一个新的snippet
            // 调用outliner自身的创建方法
            //olEditor.outlineEditor.createNewItem("new");
            olEditor.outlineEditor.createNewItem(selectedText);

            // 清除选区，避免重复添加
            window.getSelection().removeAllRanges();
        }
    });
    let snippetCount = 0;

    // 划词生成snippet
//    document.addEventListener('mouseup', function (e) {
//        const selectedText = window.getSelection().toString().trim();
//        // 检测是否为sidebar中的文字
//        // sidebar中的文字不做处理，避免重复添加
//        const target = event.target;
//
//        if (selectedText.length > 0 && !sidebar.contains(target) && runScript) {
//            addToSidebar(selectedText, e);
//            highlightSelectedText();
//            // 清除选区，避免重复添加
//            window.getSelection().removeAllRanges();
//        }
//    });
//    let snippetCount = 0;

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

    // 添加snippet到sidebar的处理
    function addToSidebar(text, e, insertAfter = null) {
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

        // 新增: 添加长按事件，插入新条目
        snippet.addEventListener('mousedown', (event) => {
            const insertTimeout = setTimeout(() => {
                insertNewSnippet(snippet);
            }, 1000); // 1000ms 长按时间

            // 鼠标松开时清除定时器，避免误触发
            snippet.addEventListener('mouseup', () => {
                clearTimeout(insertTimeout);
            });

            snippet.addEventListener('mouseleave', () => {
                clearTimeout(insertTimeout);
            });
        });

        if (insertAfter) {
            insertAfter.insertAdjacentElement('afterend', snippet);
        } else {
            sidebar.appendChild(snippet);
            // sidebar 滚动到末尾
            sidebar.scrollTop = sidebar.scrollHeight;
        }
    }

    // 编辑新增加的snippet
    function insertNewSnippet(afterElement) {
        const input = document.createElement('input');
        input.style.width = '100%';
        input.placeholder = 'Enter new text...';
    
        afterElement.insertAdjacentElement('afterend', input);
        input.focus();
    
        let isComposing = false; // 新增: 添加一个标记来检查是否处于组合输入状态
    
        // 失去焦点时，将输入框的值插入到侧边栏
        const onBlur = () => {
            if (input.value.trim()) {
                addToSidebar(input.value.trim(), null, input);
            }
            input.remove();
        };
    
        input.addEventListener('blur', onBlur);
    
        // 新增: 监听compositionstart事件
        input.addEventListener('compositionstart', () => {
            isComposing = true;
        });
    
        // 新增: 监听compositionend事件
        input.addEventListener('compositionend', () => {
            isComposing = false;
        });
    
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !isComposing) { // 检查是否处于组合输入状态
                event.preventDefault();
    
                if (input.value.trim()) {
                    addToSidebar(input.value.trim(), null, input);
                }
                input.removeEventListener('blur', onBlur); // 移除blur事件
                input.remove();
            }
        });
    }


    // esc键处理取消选择的情况
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

    // ------------------------------
    // back
    // ------------------------------

    // outliner编辑器引入
    // 暂时通过require
        //function outliner() {
        //    //console.log('from module.');
        //  
        //    // Track the Shift key state
        //    let shiftKeyPressed = false;
        //  
        //    // Add keydown event listener to track Shift key state
        //    document.addEventListener('keydown', (e) => {
        //        if (e.key === 'Shift') {
        //          shiftKeyPressed = true;
        //        }
        //    });
        //  
        //    // Add keyup event listener to track Shift key state
        //    document.addEventListener('keyup', (e) => {
        //        if (e.key === 'Shift') {
        //          shiftKeyPressed = false;
        //        }
        //    });
        //  
        //    // Create the outline editor container
        //    const editorContainer = document.createElement('div');
        //  
        //    // Create the outline editor
        //    const outlineEditor = document.createElement('ul');
        //    outlineEditor.contentEditable = 'true';
        //    outlineEditor.style.margin = '10px';
        //    outlineEditor.style.height = 'calc(100% - 20px)';
        //    outlineEditor.style.overflow = 'auto';
        //    outlineEditor.style.paddingLeft = '0px'; // Remove padding for the main list
        //  
        //    // Add an empty list item when the editor is focused
        //    outlineEditor.addEventListener('focus', () => {
        //        if (outlineEditor.children.length === 0) {
        //          const emptyItem = document.createElement('li');
        //          emptyItem.textContent = '\u200B'; // Zero-width space
        //          outlineEditor.appendChild(emptyItem);
        //        }
        //    });

        //    // Add a lastActiveNode property to the outlineEditor element
        //    outlineEditor.lastActiveNode = null;
        //  
        //  
        //    // Add a createNewItem method to the outlineEditor element
        //    outlineEditor.createNewItem = function(itemText) {
        //        const sel = window.getSelection();

        //        // 如果outlineEditor不在focus
        //        // 则取lastActiveNode
        //        const liNode = document.activeElement === outlineEditor ? getClosestLiElement(sel.getRangeAt(0).startContainer) : outlineEditor.lastActiveNode;

        //        if (liNode && liNode.tagName === 'LI') {
        //            const newItem = document.createElement('li');
        //            newItem.textContent = '\u200B'+itemText; // Zero-width space
        //            liNode.parentNode.insertBefore(newItem, liNode.nextSibling);
        //            const newRange = document.createRange();
        //            newRange.setStart(newItem.firstChild, 1);
        //            newRange.setEnd(newItem.firstChild, 1);
        //            sel.removeAllRanges();
        //            sel.addRange(newRange);
        //            outlineEditor.lastActiveNode = newItem; // 更新lastActiveNode
        //        }
        //    };
        //  
        //    // Add an indent method to the outlineEditor element
        //    outlineEditor.indent = function(currentNode, sel, range) {
        //        if (currentNode.tagName === 'LI') {
        //            const previousItem = currentNode.previousElementSibling;
        //            if (previousItem) {
        //                const nestedList = previousItem.querySelector('ul') || document.createElement('ul');
        //                previousItem.appendChild(nestedList);
        //                nestedList.appendChild(currentNode);
        //                const newRange = document.createRange();
        //  
        //                newRange.setStart(currentNode.firstChild, 1);
        //                newRange.setEnd(currentNode.firstChild, 1);
        //                sel.removeAllRanges();
        //                sel.addRange(newRange);
        //            }
        //        }
        //    };
        //  
        //    // Add an outdent method to the outlineEditor element
        //    outlineEditor.outdent = function(currentNode, sel, range) {
        //        if (currentNode.tagName === 'LI') {
        //            const parentList = currentNode.parentNode;
        //            if (parentList !== outlineEditor) {
        //                const grandParentList = parentList.parentNode;
        //                grandParentList.parentNode.insertBefore(currentNode, parentList.nextSibling);
        //                if (parentList.children.length === 0) {
        //                    grandParentList.removeChild(parentList);
        //                }
        //                const newRange = document.createRange();
        //                newRange.setStart(currentNode.firstChild, range.startOffset);
        //                newRange.setEnd(currentNode.firstChild, range.endOffset);
        //                sel.removeAllRanges();
        //                sel.addRange(newRange);
        //            }
        //        }
        //    };
        //  
        //    // Add fold method to the outlineEditor element
        //    outlineEditor.fold = function(currentNode) {
        //        if (currentNode.tagName === 'LI') {
        //            const nestedList = currentNode.querySelector('ul');
        //            if (nestedList) {
        //                nestedList.style.display = 'none';
        //                const textNode = currentNode.firstChild;
        //                if (textNode.nodeType === Node.TEXT_NODE) {
        //                    textNode.textContent = '...' + textNode.textContent;
        //                }
        //            }
        //        }
        //    };
        //  
        //    // Add unfold method to the outlineEditor element
        //    outlineEditor.unfold = function(currentNode) {
        //        if (currentNode.tagName === 'LI') {
        //          const nestedList = currentNode.querySelector('ul');
        //          if (nestedList) {
        //              nestedList.style.display = 'block';
        //              const textNode = currentNode.firstChild;
        //              if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent.startsWith('...')) {
        //                  textNode.textContent = textNode.textContent.substring(3);
        //              }
        //          }
        //        }
        //    };
        //  
        //     // Check if is chinese input ongoing
        //     let isComposing = false;
        //     function checkChineseInput(inputDom){
        //  
        //          inputDom.addEventListener('compositionstart', function() {
        //              //console.log('Input method editor started composing.');
        //              isComposing = true;
        //          });
        //          
        //          inputDom.addEventListener('compositionend', function() {
        //              //console.log('Input method editor finished composing.');
        //              isComposing = false;
        //          });
        //     }
        //    checkChineseInput(editorContainer);
        //  
        //    // Add a dblclick event listener to toggle fold and unfold
        //    outlineEditor.addEventListener('dblclick', (e) => {
        //        const currentNode = e.target;
        //        if (currentNode.tagName === 'LI') {
        //            const nestedList = currentNode.querySelector('ul');
        //            if (nestedList && nestedList.style.display !== 'none') {
        //                outlineEditor.fold(currentNode);
        //            } else {
        //                outlineEditor.unfold(currentNode);
        //            }
        //        }
        //    });
        //  
        //    // Get the closest 'li' element from the given node
        //    function getClosestLiElement(node) {
        //      while (node && node.tagName !== 'LI') {
        //        node = node.parentElement;
        //      }
        //      return node;
        //    }

        //    //------------------------------
        //    // 对于outlineEditor的一些事件侦听
        //    //------------------------------
        //  
        //    // Handle keyboard events for indent, outdent, and new items
        //    outlineEditor.addEventListener('keydown', (e) => {
        //        const sel = window.getSelection();
        //        const range = sel.getRangeAt(0);
        //        const currentNode = range.startContainer.parentNode;
        //  
        //        if (e.key === 'Tab') {
        //          e.preventDefault();
        //          if (shiftKeyPressed) { // Outdent when Shift key is pressed
        //            outlineEditor.outdent(currentNode, sel, range);
        //          } else { // Indent when Shift key is not pressed
        //            outlineEditor.indent(currentNode, sel, range);
        //          }
        //        } else if (e.key === 'Enter' && !isComposing) { // Add a new list item on Enter key press
        //          // isComposing is a tag to check if chinese input is going
        //          e.preventDefault();
        //          outlineEditor.createNewItem("");
        //        }
        //    });

        //    // Modify keydown event listener to use Selection API
        //    outlineEditor.addEventListener('keydown', (e) => {
        //      if (e.key === 'z' && e.ctrlKey) {
        //        e.preventDefault();
        //        const selection = window.getSelection();
        //        const currentNode = getClosestLiElement(selection.anchorNode);
        //        if (currentNode && currentNode.tagName === 'LI') {
        //          const nestedList = currentNode.querySelector('ul');
        //          if (nestedList && nestedList.style.display !== 'none') {
        //            outlineEditor.fold(currentNode);
        //          } else {
        //            outlineEditor.unfold(currentNode);
        //          }
        //        }
        //      }
        //    });

        //      // Add a blur event listener to outlineEditor to store the last active li node
        //      outlineEditor.addEventListener('blur', (e) => {
        //        const selection = window.getSelection();
        //        if (selection.rangeCount > 0) {
        //          const currentNode = selection.getRangeAt(0).startContainer;
        //          outlineEditor.lastActiveNode = getClosestLiElement(currentNode);
        //            //console.log('last active node is: ', outlineEditor.lastActiveNode);
        //        }
        //      });
        //  
        //    // Append the outline editor to the container
        //    editorContainer.appendChild(outlineEditor);
        //  
        //    // Add the outlineEditor element as a property of the editorContainer element
        //    editorContainer.outlineEditor = outlineEditor;
        //  
        //    // Apply the 2-space indent to all nested lists
        //    const nestedListStyle = document.createElement('style');
        //    nestedListStyle.innerHTML = `
        //      ul ul {
        //        padding-left: 1ch;
        //      }
        //      ul {
        //        list-style-position: inside; // Adjust the position of li::marker to inside
        //      }
        //      li {
        //        padding-left: 1px; // Add left padding to display the input cursor
        //      }
        //    `;
        //    document.head.appendChild(nestedListStyle);
        //  
        //    return editorContainer;
        //}
})();
