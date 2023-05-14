// ==UserScript==
// @name         KeyListener
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  key listener for activate some function
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

/* add metakey */
(function() {
    'use strict';

    // Define the key combination to listen for
    const keys = {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
        key: ''
    };

    // Listen for keydown events
    document.addEventListener('keydown', event => {
        switch (event.key) {
          case 'Control':
            keys.ctrl = true;
            break;
          case 'Alt':
            keys.alt = true;
            break;
          case 'Shift':
            keys.shift = true;
            break;
          case 'Meta':
            keys.meta = true;
            break;
          default:
            keys.key = event.key;
            break;
        }
    
      // Check if the key combination was pressed
      if (keys.ctrl && keys.shift && keys.key === 'K') {
        // Do something here
        console.log("combo shift key pressed.");
      }

      // Check if the key combination was pressed
      if (keys.ctrl && keys.alt && keys.key === 'K') {
          // Do something here
          console.log("combo alt key pressed.");
      }

      // Check if the key combination was pressed
      if (keys.shift && keys.meta && keys.key === 'k') {
          // Do something here
          console.log("combo meta key pressed.");
      }


      //console.log(keys);
    });

    // Listen for keyup events
    document.addEventListener('keyup', event => {
        // Update the keys object based on which key was released
        switch (event.key) {
          case 'Control':
            keys.ctrl = false;
            break;
          case 'Alt':
            keys.alt = false;
            break;
          case 'Shift':
            keys.shift = false;
            break;
          case 'Meta':
            keys.meta = false;
            break;
          default:
            keys.key = '';
            break;
        }
    });
})();

