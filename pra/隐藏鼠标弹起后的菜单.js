// ==UserScript==
// @name         Close LunaAI Pop-up
// @namespace    http://tampermonkey.net/
// @version      0.21
// @description  Automatically close pop-up windows on a specific webpage.
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

// 监听mouseup事件
document.addEventListener('mouseup', function(event) {
  // 检查元素是否存在
  const element = document.querySelector('#__j__luna-bot-ai-context-menu');
  if (element) {
    // 隐藏元素
    element.style.display = 'none';
  }
});

})();
