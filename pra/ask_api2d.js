// ==UserScript==
// @name         GPT对话框脚本
// @namespace    http://tampermonkey
// @version      1
// @description  实现一个组合对话框，上面是问题框，中间是一个确定按钮，最下面是回复问题的地方。
// @match        http://*/*
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 创建组合对话框
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.bottom = '0';
    dialog.style.right = '0';
    dialog.style.width = '400px';
    dialog.style.height = 'auto';
    dialog.style.backgroundColor = '#fff';
    dialog.style.border = '1px solid #ccc';
    dialog.style.borderRadius = '5px';
    dialog.style.padding = '10px';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    dialog.style.zIndex = '9999';

    // 创建问题输入框
    const questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.style.padding = '5px';
    questionInput.style.margin = '5px';
    questionInput.style.borderRadius = '5px';
    questionInput.style.border = '1px solid #ccc';
    questionInput.placeholder = '请输入您的问题';
    dialog.appendChild(questionInput);

    // 创建确定按钮
    const submitBtn = document.createElement('button');
    submitBtn.innerText = '确定';
    submitBtn.style.padding = '5px';
    submitBtn.style.margin = '5px';
    submitBtn.style.borderRadius = '5px';
    submitBtn.style.border = '1px solid #ccc';
    submitBtn.style.backgroundColor = '#f5f5f5';
    dialog.appendChild(submitBtn);

    // 创建回复框
    const answerDiv = document.createElement('div');
    answerDiv.style.padding = '5px';
    answerDiv.style.margin = '5px';
    answerDiv.style.borderRadius = '5px';
    answerDiv.style.border = '1px solid #ccc';
    answerDiv.style.minHeight = '50px';
    answerDiv.style.overflowY = 'scroll';
    dialog.appendChild(answerDiv);

    // 点击确定按钮发送问题到OpenAI的chat API接口，并接收返回的消息
    submitBtn.addEventListener('click', () => {
        const question = questionInput.value;
        if (question.trim() === '') return;
        questionInput.value = '';
        answerDiv.innerHTML += '<p><strong>问：</strong>' + question + '</p>';
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://openai.api2d.net/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D'
            },
            data: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: "user", content: question }],
                //stream: true
            }),
            onload: function(response) {
                console.log(response.responseText);
                const data = JSON.parse(response.responseText);
                const answer = data.choices[0].message.content;
                answerDiv.innerHTML += '<p><strong>答：</strong>' + answer + '</p>';
            }
        });
    });

    // 将组合对话框添加到页面中
    document.body.appendChild(dialog);
})();
