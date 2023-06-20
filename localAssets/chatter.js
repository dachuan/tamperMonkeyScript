/*
 * 2023/6/20 下午4:54
 * ------------------------------
 *  聊天上下文支持
 *  清除上下文支持
 *
 * 2023/6/19 上午10:57
 * ------------------------------
 *  处理botlog中的换行问题
 *
 * 2023/6/18 上午10:57
 * ------------------------------
 *  使用GM_xmlHttpRequest 替代fetch
 *  规避跨域问题
 *  GM_xmlhttpRequest的文档和sample都含糊
 *  通过去掉它的状态限制条件达成
 *
 * 2023/6/16 上午11:21
 * ------------------------------
 *  add class for userlog and botlog
 *
 * 2023/6/13 下午2:11
 * ------------------------------
 *  simply UI component of chat with GPT
 *
 * */
// chatbox constructor
function chatter(){

    console.log('from chatbox module.');
    const ele = {};



    const chatBoxCSS = `
        display : flex;
        flex-direction : column;
        justify-content: center;
        align-items: center;
        backgroundColor : #fff;
        overflow : hidden;
    `;

    const chatLogCSS = `
        display : flex;
        flex-direction : column;
        width : 100%;
        height : 350px;
        overflow : auto;
    `;

    const inputContainerCSS = `
        display : flex;
        flex-direction : row;
        width : 96%;
        height : 60px;
        overflow : auto;
        border: 1px solid #aaa;
        margin-bottom: 10px;
    `;

     const inputBoxCSS = `
        width: 90%;
        height: 60px;
        box-sizing: border-box;
        border: none;
        resize: none;
    `;

    const sendButtonCSS = `
        //margin-right : 15px;
        //border: lightblue;
        //color: white;
        //background-color: darkcyan;
        //height: 90%;
    `;

    const clearButtonCSS = `
        width: 10%;
        //margin-right : 15px;
        //border: lightblue;
        //color: white;
        //background-color: darkcyan;
        //height: 90%;
    `;

    const segCSS = `
        font-size : 10px;
        text-align: center;
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
        background-color: #5d5cde;
        color: #fff;
        font-size : 14px;
        display : inline-block;
        text-align : left;
        white-space: pre-wrap;
        user-select: text;
        cursor: text;
    `;


    //white-space: pre-wrap;
    const botTextCSS = `
        background-color :  #eeeeee;
        color : #000;
        font-size : 14px;
        display : inline-block;
        text-align : left;
        white-space: pre-line;
        user-select: text;
        cursor: text;
    `;

    // Create the chat box
    var chatBox = document.createElement('div');
    chatBox.style.cssText = chatBoxCSS;
    document.body.appendChild(chatBox);

    // Create the chat log
    var chatLog = document.createElement('div');
    chatLog.contentEditable = 'true'; // 文本可选择的一个变通方法
    chatLog.classList.add('chatLog');
    chatLog.style.cssText = chatLogCSS;
    chatBox.appendChild(chatLog);

    // Create the input container
    var inputContainer = document.createElement('div');
    inputContainer.style.cssText = inputContainerCSS;
    chatBox.appendChild(inputContainer);

    // Create the clear button
    var clearButton = document.createElement('button');
    clearButton.style.cssText = clearButtonCSS;
    clearButton.innerHTML = '♲';
    inputContainer.appendChild(clearButton);

    // Create the input box
    var inputBox = document.createElement('textarea');
    inputBox.style.cssText = inputBoxCSS;
    inputBox.classList.add('chatInput');
    inputContainer.appendChild(inputBox);
    //chatBox.appendChild(inputBox);

    // Create the send button
    var sendButton = document.createElement('button');
    sendButton.style.cssText = sendButtonCSS;
    sendButton.innerHTML = 'Send';
    inputContainer.appendChild(sendButton);
    //chatBox.appendChild(sendButton);

    // Clear chat history by clearButton
    clearButton.addEventListener('click', function() {
        clearChatHistory();

        // create a segment div
        var clearSeg = document.createElement('div');
        clearSeg.style.cssText = segCSS;
        clearSeg.innerHTML ='--------------new chat----------------';
        chatLog.appendChild(clearSeg);
        chatLog.scrollTop = chatLog.scrollHeight;
    });

    // initial messages
    let messages = [];
    let sys_message = {"role": "system", "content": "Always think in English, but reply in Chinese."};
    messages.push(sys_message);

    function clearChatHistory(){
        messages = [];
        messages.push(sys_message);
    }

    // Add event listener to send button
    sendButton.addEventListener('click', function() {
        var userInput = inputBox.value.trim();
        if (userInput !== '') {
            // Add user message to chat log
            var userMessage = document.createElement('div');
            userMessage.style.cssText = userMessageCSS;

            // add span for text wrap
            var userText = document.createElement('span');
            userText.classList.add('userLog');
            userText.innerHTML = userInput;
            userText.style.cssText = userTextCSS;
            userMessage.appendChild(userText);
            chatLog.appendChild(userMessage);

            // Add bot message to chat log
            var botMessage = document.createElement('div');
            botMessage.style.cssText = botMessageCSS;

             // add span for text wrap
            var botText = document.createElement('span');
            botText.classList.add('botLog');
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

        // push message
        messages.push({ role: "user", content: question });
    
        // 3.5 turbo
        const requestBody = {
            model: 'gpt-3.5-turbo',
            messages: messages,
            stream: true,
        };

        // 16k
        //const requestBody = {
        //    model: 'gpt-3.5-turbo-16k',
        //    messages: [
        //        { role: "system", content: "任务：用Minto Pyramid结构重写。输出格式：Conclusion:...Key arguments:- key1 - key2- ...Detailed information:...用中文回复。下面是需要你重写的内容:"},
        //        { role: "user", content: question }
        //    ],
        //    stream: true,
        //};

        GM_xmlhttpRequest({
            method: 'POST',
            headers: headers,
            url: API_URL,
            data: JSON.stringify(requestBody),
            responseType: "stream",
            onloadstart: async function(response) { // onload是完全加载完毕,不能用onload
                const reader = response.response.getReader();
                const decoder = new TextDecoder();
                let partialData = '';
                let response_str = '';

                while (true) {
                    const { done, value} = await reader.read(); // value is Uint8Array
                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });

                        // Split string into lines
                        const lines = (partialData + chunk).split('\n');
                        partialData = lines.pop();
    
                        lines.forEach(line => {
                            const match = line.match(/"content":"([^"]*)"/);
                            if (match) {
                                //console.log(match[1]);
                                // 处理\n 为&#10
                                let w = match[1];
                                if (/\\n/.test(match[1])) {
                                  w = w.replace(/\\n/g, "&#10;");
                                }
                                response_str += w;
                                // render botText
                                responseSpan.innerHTML = response_str;
                                // 随文字下拉
                                chatLog.scrollTop = chatLog.scrollHeight;
                            }
                        });
                    }

                    if (done) break;
                }
                //console.log('done');
                if (response_str){ // push assistant message
                    messages.push({'role': 'assistant', 'content': response_str});
                    //console.log(messages);
                }
            },
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

/*backup*/
//------------------------------
        /* 
        fetch(API_URL, {     //fetch not works in CSP
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
            */

