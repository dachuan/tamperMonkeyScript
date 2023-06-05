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
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/outliner.js
// ==/UserScript==

/*
 *  - 2023/6/4 下午12:38
 *  将outliner作为模块导入
 *  实现了折叠
 *  - 2023/6/1 下午7:32
 *  实现了初步的大纲编辑
 *  缩进，返回都ok
 * */

(function() {
    'use strict';

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

    // import outliner
    const outlineEditor = outliner();
    editorContainer.appendChild(outlineEditor);


    // Toggle the outline editor on button click
    openEditorButton.addEventListener('click', () => {
        editorContainer.style.display = editorContainer.style.display === 'none' ? 'block' : 'none';
    });

})();
