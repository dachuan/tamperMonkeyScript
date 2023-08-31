// ==UserScript==
// @name         Keywords highligted by GPT
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  选择文本，GPT自动将关键词高亮
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @connect      https://openai.api2d.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // step by step
    // 1- select text area
    // 2- send to GPT as query, get keywords back
    // 3- highlight keywords
    
    // async query 
    async function q_api2d(q) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = "https://openai.api2d.net/v1/chat/completions";

            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D");

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.choices[0].message.content);
                    } else {
                        reject(xhr.statusText);
                    }
                }
            };

            const data = JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: q }],
            });

            xhr.send(data);
        });
    }

    // Create a button element
    const queryButton = document.createElement('button');
    queryButton.innerText = 'GPT';
    queryButton.style.position = 'absolute';
    queryButton.style.display = 'none';
    document.body.appendChild(queryButton);

    // Highlight selected text in yellow
    function highlightSelectedText() {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            const highlight = document.createElement('span');
            highlight.style.backgroundColor = 'yellow';
            highlight.appendChild(range.extractContents());
            range.insertNode(highlight);
        }
    }

    // Show the button when text is selected
    document.addEventListener('mouseup', function(event) {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            //highlightSelectedText();
            queryButton.style.display = 'block';
            const xpos = event.pageX + 10;
            const ypos = event.pageY - 10;
            queryButton.style.left = xpos + 'px';
            queryButton.style.top = ypos + 'px';
            queryButton.onclick = async function() {
                //GM_setClipboard(selectedText);
                queryButton.style.display = 'none';

                // query selected texts to GPT
                const q = `If you were a search engine, what keywords would you extract from the text below?Reply in Chinese. ${selectedText} `;
                const msg = await q_api2d("一周有几天");
                alert(msg);
            };
        } else {
            queryButton.style.display = 'none';
        }
    });

//    window.addEventListener('load', async function() {
//            // Popup a message
//            const msg = await q_api2d("一周有几天");
//            alert(msg);
//        });


})();
