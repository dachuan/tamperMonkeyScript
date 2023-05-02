// ==UserScript==
// @name         与机器人聊天
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  实现一个聊天对话框
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // Define the styles for user messages
    var userMessageStyle = {
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '14px'
    };

    // Define the styles for bot messages
    var botMessageStyle = {
        backgroundColor: '#eeeeee',
        color: '#000',
        fontSize: '14px'
    };

    // Create the chat box
    var chatBox = document.createElement('div');
    chatBox.style.position = 'fixed';
    chatBox.style.bottom = '10px';
    chatBox.style.right = '10px';
    chatBox.style.backgroundColor = '#fff';
    chatBox.style.border = '1px solid #000';
    chatBox.style.width = '300px';
    chatBox.style.height = '400px';
    chatBox.style.overflow = 'hidden';
    document.body.appendChild(chatBox);

    // Create the chat log
    var chatLog = document.createElement('div');
    chatLog.style.width = '100%';
    chatLog.style.height = '350px';
    chatLog.style.overflow = 'auto';
    chatBox.appendChild(chatLog);

    // Create the input box
    var inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.style.width = '250px';
    inputBox.style.marginLeft = '10px';
    inputBox.style.marginRight = '10px';
    chatBox.appendChild(inputBox);

    // Create the send button
    var sendButton = document.createElement('button');
    sendButton.innerHTML = 'Send';
    sendButton.style.marginRight = '10px';
    chatBox.appendChild(sendButton);

    // Initialize the chat
    var chatHistory = [];

    // Add event listener to send button
    sendButton.addEventListener('click', function() {
        var userInput = inputBox.value.trim();
        if (userInput !== '') {
            // Add user message to chat log
            var userMessage = document.createElement('div');
            userMessage.style.position = 'relative';
            userMessage.style.textAlign = 'right';
            userMessage.style.width = '100%';
            userMessage.style.marginBottom = '5px';
            userMessage.style.backgroundColor = userMessageStyle.backgroundColor;
            userMessage.style.color = userMessageStyle.color;
            userMessage.style.fontSize = userMessageStyle.fontSize;
            userMessage.innerHTML = userInput;
            chatLog.appendChild(userMessage);

            // Get the first word of the user message
            var firstWord = userInput.split(' ')[0];

            // Generate a response from the bot
            var botResponse = 'I heard you say "' + firstWord + '".';

            // Add bot message to chat log
            var botMessage = document.createElement('div');
            botMessage.style.textAlign = 'left';
            botMessage.style.width = '60%';
            botMessage.style.marginBottom = '5px';
            botMessage.style.backgroundColor = botMessageStyle.backgroundColor;
            botMessage.style.color = botMessageStyle.color;
            botMessage.style.fontSize = botMessageStyle.fontSize;
            botMessage.innerHTML = botResponse;
            chatLog.appendChild(botMessage);

            // Clear the input box
            inputBox.value = '';

            // Scroll to the bottom of the chat log
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });
})();


