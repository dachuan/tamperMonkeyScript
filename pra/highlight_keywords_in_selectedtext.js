// ==UserScript==
// @name         Highlight Keywords
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlight selected text containing predefined keywords
// @author       ChatGPT
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';
  
  // Add your keywords here
  const keywords = ["中国", "北京", "朝阳"];
  
  // Create a CSS class for highlighting
  GM_addStyle('.highlight{ background-color: yellow; }');
  
  // Function to highlight selected text
  function highlightSelectedText() {
    const selectedText = window.getSelection().toString();
    if(selectedText) {
      const regex = new RegExp(keywords.join('|'), 'gi');
      const highlightedText = selectedText.replace(regex, '<span class="highlight">$&</span>');
      const range = window.getSelection().getRangeAt(0);
      const div = document.createElement('div');
      div.innerHTML = highlightedText;
      range.deleteContents();
      range.insertNode(div);
    }
  }
  
  // Add event listener to highlight selected text on mouseup
  window.addEventListener('mouseup', highlightSelectedText);

})();
