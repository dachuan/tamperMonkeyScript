// ==UserScript==
// @name         KeyListener
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  key listener for activate some function
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

// Define the key combination to listen for
const keys = {
  ctrl: false,
  alt: false,
  shift: false,
  key: ''
};

// Listen for keydown events
document.addEventListener('keydown', event => {
  // Update the keys object based on which key was pressed
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
    default:
      keys.key = event.key;
      break;
  }

  // Check if the key combination was pressed
  if (keys.ctrl && keys.shift && keys.key === 'K') {
    // Do something here
    console.log("combo key pressed.");
  }
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
    default:
      keys.key = '';
      break;
  }
});
})();

