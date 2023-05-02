// ==UserScript==
// @name         与机器人聊天
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  实现一个聊天对话框
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

/* 基本样式调整完毕
 * 输入框样式需要调整
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
        height : 400px;
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
        width : 250px;
        margin-left : 10px;
        margin-right : 10px;
    `;

    const sendButtonCSS = `
        margin-left : 240px;
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
    `;


    const botTextCSS = `
        background-color :  #eeeeee;
        color : #000;
        font-size : 14px;
        display : inline-block;
        text-align : left;
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
    var inputBox = document.createElement('input');
    inputBox.style.cssText = inputBoxCSS;
    inputBox.type = 'text';
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

            // Get the first word of the user message
            var firstWord = userInput.split(' ')[0];

            // Generate a response from the bot
            var botResponse = 'I heard you say "' + firstWord + '".';

            // Add bot message to chat log
            var botMessage = document.createElement('div');
            botMessage.style.cssText = botMessageCSS;


             // add span for text wrap
            var botText = document.createElement('span');
            botText.innerHTML = botResponse;
            botText.style.cssText = botTextCSS;
            botMessage.appendChild(botText);
            chatLog.appendChild(botMessage);

            // Clear the input box
            inputBox.value = '';

            // Scroll to the bottom of the chat log
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });
})();


