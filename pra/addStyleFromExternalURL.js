// ==UserScript==
// @name         Load font from external domain
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qq.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {

GM_addStyle(`
  @font-face {
    font-family: 'My Custom Font';
    src: url('https://unpkg.com/@excalidraw/excalidraw@0.15.2/dist/excalidraw-assets-dev/Virgil.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  body {
    font-family: 'My Custom Font', sans-serif;
  }
`);
})();
