// ==UserScript==
// @name         KeyListener
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  key listener for activate some function
// @author       dcthehiker
// @match        http*://0.0.0.0
// @match        http*://localhost:*
// @match        http*://localhost:8000/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('chatbox constructed.');
    // 创建一个 <style> 元素
    const style = document.createElement('style');
    style.type = 'text/css';

    // 设置 CSS 规则
    style.innerHTML = `
        .inner-item {
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }

        .snippet {
            list-style-type: none;
            padding: 10px 5px;
            margin: 10px 10px;
            border-left: 3px solid #feb92c;
            background-color: #F5F5F5;
            box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }
    `;

    // 将 <style> 元素添加到页面的 <head> 中
    document.head.appendChild(style);

    // 脚本开关
    let runScript = false;

    // 创建一个侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        position: fixed;
        right: 0;
        //top: 100px;
        top: 50%;
        width: 400px;
        //height: 550px; //300px 
        background: white;
        border-left: 1px solid #ccc;
        overflow-y: auto;
        transform: translateY(-50%);
        padding: 0px;
        box-sizing: border-box;
        box-shadow: 2px 2px 4px #ccc;
        opacity: 0;
        z-index: -9999;
    `;

    // draggable 
    sidebar.draggable="true";
    let mouse = { x: 0, y: 0 };
    sidebar.ondragstart = function() {
        // 记录鼠标与sidebar之间的距离
        mouse = {
            x: event.offsetX,
            y: event.offsetY
        }
    }
    // 拖拽结束
    sidebar.ondragend = function() {
        // sidebar的位置 = 鼠标与页面之间的距离 - 鼠标与sidebar之间的距离
        sidebar.style.left = event.clientX - mouse.x + "px";
        sidebar.style.top = event.clientY - mouse.y + "px";
        sidebar.style.transform = ''; //去除transform的影响，避免位置跳跃
    }

    /* make a outliner panel*/

    const outlinerPanel = document.createElement('div');
    outlinerPanel.style.cssText = `
       display: 'block', 
    `;

    // Make the title fixed at the top of the outlinerPanel
    const titleContainerOutliner = document.createElement('div');
    titleContainerOutliner.textContent = 'Quotations -------------------- click save all';
    titleContainerOutliner.style.cssText = `
        position: sticky;
        top: 0;
        font-size: 14px;
        font-weight: bold;
        background-color: #42bbf4;
    `;

    /* make a chat panel*/

    const chatPanel = document.createElement('div');
    chatPanel.style.cssText = `
       display: 'none', 
    `;

    // Make the title fixed at the top of the chatPanel
    const titleContainerChat = document.createElement('div');
    titleContainerChat.textContent = 'chat with GPT';
    titleContainerChat.style.cssText = `
        position: sticky;
        top: 0;
        font-size: 14px;
        font-weight: bold;
        background-color: #4211f4;
    `;

    /* switch button for chat to outliner*/

    // 添加一个控制sidebar出现的按钮
    const switchButton = document.createElement('button');
    switchButton.textContent = 's';
    switchButton.style.cssText = `
        position: fixed;
        top: 60px;
        right: 50px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #111;
        color: white;
        border: none;
        outline: none;
        cursor: pointer;
        z-index: 9999;
    `;
     // Add click event listener to the switch button
     switchButton.addEventListener('click', () => {
         if (outlinerPanel.style.display === 'block') {
             outlinerPanel.style.display = 'none';
             chatPanel.style.display = 'block';
         } else {
             outlinerPanel.style.display = 'block';
             chatPanel.style.display = 'none';
         }
     });

    // 添加一个控制sidebar出现的按钮
    const toggleSidebar = document.createElement('button');
    toggleSidebar.textContent = '+';
    toggleSidebar.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #aaa;
        color: white;
        border: none;
        outline: none;
        cursor: pointer;
        z-index: 9999;
    `;

    // 添加点击事件监听器
    toggleSidebar.addEventListener('click', () => {
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0' && runScript) ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
        runScript = true;
        }
    );

    // chatbox constructor
    function chatter(){
        const ele = {};

        const chatBoxCSS = `
            //position : fixed;
            //bottom : 10px;
            //right : 10px;
            backgroundColor : #fff;
            border : 1px solid #000;
            //width : 300px;
            //height : 440px;
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
    
        ele.chatBox = chatBox;

        return ele
    }

    // 添加侧边栏到页面
    document.body.appendChild(sidebar);
    document.body.appendChild(toggleSidebar);
    document.body.appendChild(switchButton);

    // 添加chatPanel
    chatPanel.appendChild(titleContainerChat);
    const chatBox = chatter().chatBox;
    chatPanel.appendChild(chatBox)
    sidebar.appendChild(chatPanel);

    outlinerPanel.appendChild(titleContainerOutliner);
    sidebar.appendChild(outlinerPanel);

    outlinerPanel.style.display = 'block';
    chatPanel.style.display = 'none';


})();
