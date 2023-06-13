// ==UserScript==
// @name         与机器人聊天
// @namespace    http://tampermonkey.net/
// @version      0.0.5
// @description  实现一个聊天对话框
// @author       dcthehiker
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

/* 2023/6/13 上午10:38
 * ------------------------------
 *  scroll to bottom
 *
 * 流式显示成功
 * 滚动条需要调整，目前没有跟着往下
 */


(function() {
    'use strict';

    const chatBoxCSS = `
        position : fixed;
        bottom : 10px;
        right : 10px;
        backgroundColor : #fff;
        border : 1px solid #000;
        width : 300px;
        height : 440px;
        overflow : hidden;
    `;

    const chatLogCSS = `
        display : flex;
        flex-direction : column;
        width : 100%;
        height : 350px;
        overflow : auto;
    `;

     const inputBoxCSS = `
        width: 90%;
        height: 60px;
        margin-left : 15px;
        box-sizing: border-box;
    `;

    const sendButtonCSS = `
        margin-left : 250px;
    `;

    const userMessageCSS = `
        text-align : right;
        align-self : flex-end;
        width : 80%;
        margin-right : 10px;
        margin-bottom : 10px;
    `;

    const botMessageCSS = `
        text-align : left;
        width : 80%;
        margin-left : 10px;
        margin-bottom : 10px;
    `;

    const userTextCSS = `
        background-color :  #007bff;
        color : #fff;
        font-size : 14px;
        display : inline-block;
        text-align : left;
        white-space: pre-wrap;
    `;


    const botTextCSS = `
        background-color :  #eeeeee;
        color : #000;
        font-size : 14px;
        display : inline-block;
        text-align : left;
        white-space: pre-wrap;
    `;

    // Create the chat box
    var chatBox = document.createElement('div');
    chatBox.style.cssText = chatBoxCSS;
    document.body.appendChild(chatBox);

    // Create the chat log
    var chatLog = document.createElement('div');
    chatLog.style.cssText = chatLogCSS;
    chatBox.appendChild(chatLog);


    // Create the input box
    var inputBox = document.createElement('textarea');
    inputBox.style.cssText = inputBoxCSS;
    chatBox.appendChild(inputBox);


    // Create the send button
    var sendButton = document.createElement('button');
    sendButton.style.cssText = sendButtonCSS;
    sendButton.innerHTML = 'Send';
    chatBox.appendChild(sendButton);


    // Initialize the chat
    var chatHistory = [];

    // Add event listener to send button
    sendButton.addEventListener('click', function() {
        var userInput = inputBox.value.trim();
        if (userInput !== '') {
            // Add user message to chat log
            var userMessage = document.createElement('div');
            userMessage.style.cssText = userMessageCSS;

            // add span for text wrap
            var userText = document.createElement('span');
            userText.innerHTML = userInput;
            userText.style.cssText = userTextCSS;
            userMessage.appendChild(userText);
            chatLog.appendChild(userMessage);

            // Add bot message to chat log
            var botMessage = document.createElement('div');
            botMessage.style.cssText = botMessageCSS;

             // add span for text wrap
            var botText = document.createElement('span');
            botText.style.cssText = botTextCSS;
            botMessage.appendChild(botText);
            chatLog.appendChild(botMessage);

            // update botText
            streamResponse(userInput, botText);

            // Clear the input box
            inputBox.value = '';

            // Scroll to the bottom of the chat log
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });

    // query from GPT in streaming data
    function streamResponse(question, responseSpan) {
    
        const API_KEY = 'fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D';
        const API_URL = 'https://openai.api2d.net/v1/chat/completions';
    
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        };
    
        const requestBody = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: question }],
            stream: true,
        };
    
        fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        }).then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialData = '';
            let response_str = '';
    
            reader.read().then(function processText({ done, value }) {
                if (done) {
                    console.log('Stream finished');
                    return;
                }
    
                // Convert Uint8Array to string
                const chunk = decoder.decode(value, { stream: true });
    
                // Split string into lines
                const lines = (partialData + chunk).split('\n');
                partialData = lines.pop();
    
                lines.forEach(line => {
                    const match = line.match(/"content":"([^"]*)"/);
                    if (match) {
                        //console.log(match[1]);
                        response_str += match[1];
                        // render botText
                        responseSpan.innerHTML = response_str;
                        // 随文字下拉
                        chatLog.scrollTop = chatLog.scrollHeight;
                    }
                });
    
                // Read next chunk of data
                reader.read().then(processText);
              });
            });
        }
        
    // Add event listener to input box for "Enter" key
    inputBox.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        sendButton.click();
      }
    });

})();
