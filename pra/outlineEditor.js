// ==UserScript==
// @name         Outline Editor
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

/*
 *  2023/6/1 下午7:32
 *  实现了初步的大纲编辑
 *  缩进，返回都ok
 * */
(function() {
    'use strict';

    // 用于跟踪 Shift 键状态的变量
    let shiftKeyPressed = false;
    
    // 添加 keydown 事件监听器以跟踪 Shift 键状态
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            shiftKeyPressed = true;
        }
    });
    
    // 添加 keyup 事件监听器以跟踪 Shift 键状态
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            shiftKeyPressed = false;
        }
    });

    // Create the button for opening the outline editor
    const openEditorButton = document.createElement('button');
    openEditorButton.innerHTML = 'Open Outline Editor';
    openEditorButton.style.position = 'fixed';
    openEditorButton.style.bottom = '20px';
    openEditorButton.style.right = '20px';
    openEditorButton.style.zIndex = 1000;
    document.body.appendChild(openEditorButton);

    // Create the outline editor container
    const editorContainer = document.createElement('div');
    editorContainer.style.display = 'none';
    editorContainer.style.position = 'fixed';
    editorContainer.style.top = '10px';
    editorContainer.style.right = '10px';
    editorContainer.style.width = '400px';
    editorContainer.style.height = '90%';
    editorContainer.style.backgroundColor = '#ffffff';
    editorContainer.style.border = '2px solid #000';
    editorContainer.style.zIndex = 1001;
    document.body.appendChild(editorContainer);

    // Create the outline editor
    const outlineEditor = document.createElement('ul');
    outlineEditor.contentEditable = 'true';
    outlineEditor.style.margin = '10px';
    outlineEditor.style.height = 'calc(100% - 20px)';
    outlineEditor.style.overflow = 'auto';
    outlineEditor.style.paddingLeft = '0px'; // Remove padding for the main list
    editorContainer.appendChild(outlineEditor);

    // Toggle the outline editor on button click
    openEditorButton.addEventListener('click', () => {
        editorContainer.style.display = editorContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Add an empty list item when the editor is focused
    outlineEditor.addEventListener('focus', () => {
        if (outlineEditor.children.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = '\u200B'; // Zero-width space
            outlineEditor.appendChild(emptyItem);
        }
    });

    // Handle keyboard events for indent, outdent, and new items
    outlineEditor.addEventListener('keydown', (e) => {
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const currentNode = range.startContainer.parentNode;

        if (e.key === 'Tab') {
            e.preventDefault();
            if (shiftKeyPressed) { // 按住 Shift 键时执行 outdent 操作
                      //console.log('outdent');
                      e.preventDefault();
                      if (currentNode.tagName === 'LI') {
                          const parentList = currentNode.parentNode;
                          if (parentList !== outlineEditor) {
                              const grandParentList = parentList.parentNode;
                              grandParentList.parentNode.insertBefore(currentNode, parentList.nextSibling);
                              if (parentList.children.length === 0) {
                                  grandParentList.removeChild(parentList);
                              }
                              const newRange = document.createRange();
                              newRange.setStart(currentNode.firstChild, range.startOffset);
                              newRange.setEnd(currentNode.firstChild, range.endOffset);
                              sel.removeAllRanges();
                              sel.addRange(newRange);
                          }
                      }
                  } else { // 没有按住 Shift 键时执行 indent 操作
                      //console.log('indent');
                      if (currentNode.tagName === 'LI') {
                          const previousItem = currentNode.previousElementSibling;
                          if (previousItem) {
                              const nestedList = previousItem.querySelector('ul') || document.createElement('ul');
                              previousItem.appendChild(nestedList);
                              nestedList.appendChild(currentNode);
                              const newRange = document.createRange();
                              newRange.setStart(currentNode.firstChild, range.startOffset);
                              newRange.setEnd(currentNode.firstChild, range.endOffset);
                              sel.removeAllRanges();
                              sel.addRange(newRange);
                          }
                      }
                  }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentNode.tagName === 'LI') {
                const newItem = document.createElement('li');
                newItem.textContent = '\u200B'; // Zero-width space
                currentNode.parentNode.insertBefore(newItem, currentNode.nextSibling);
                const newRange = document.createRange();
                newRange.setStart(newItem.firstChild, 1);
                newRange.setEnd(newItem.firstChild, 1);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }
    });

    // Apply the 2-space indent to all nested lists
    const nestedListStyle = document.createElement('style');
    nestedListStyle.innerHTML = `
        ul ul {
            padding-left: 1ch;
        }
        ul {
            list-style-position: inside; // 调整li::marker位置为内部
        }
        li {
            padding-left: 1px; // 添加左内边距以显示输入光标
        }
    `;
    document.head.appendChild(nestedListStyle);
})();
