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

    function listenAt(isSetKeys,callback){
        // check global keys combination
        // isSetKeys 是一个函数
        // 用来判断按键组合
        document.addEventListener('keydown', function(event) {
            console.log('key pressed');
            if (isSetKeys())
            {
                console.log('keys satisfied.');
                callback();
            }
        });
    }

    function onAction(){
        console.log('combo key pressed');
        console.log(keys);
    }

    listenAt(() => {return keys.ctrl && keys.key == 'a'}, onAction);
    listenAt(() => {return keys.shift && keys.key == 'K'}, onAction);
    listenAt(() => {return keys.ctrl && keys.meta  && keys.key == 'k'}, onAction);

})();

