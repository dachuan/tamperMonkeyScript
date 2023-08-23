// ==UserScript==
// @name         Keep Colab Alive
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  key listener for activate some function
// @author       dcthehiker
// @match        http*://colab.research.google.com/drive/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let intervalId;

    function connect(){
        console.log("Connect pushed"); 
        document.querySelector("#top-toolbar > colab-connect-button").shadowRoot.querySelector("#connect").click() 
    }

    function addButton() {
      let button = document.createElement("button"); 
      button.textContent = "Auto Connect";
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style.right = "20px";
      button.onclick = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
          button.textContent = "Start Auto Connect";
        } else {
          intervalId = setInterval(connect, 60000);
          button.textContent = "Stop Auto Connect";
        }
      };
      document.body.appendChild(button);
    }

    function delayAdd(){
        setTimeout(() => {
            addButton();
            console.log('done');
        }, 10000); 
    }

    delayAdd();

})();
