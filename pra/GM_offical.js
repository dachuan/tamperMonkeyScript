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
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*可以获得stream数据，await处可能有问题*/

(function() {
    'use strict';

    console.log('streaming ' + (GM_xmlhttpRequest.RESPONSE_TYPE_STREAM === 'stream' ? 'supported' : 'not supported'));


    function GPT() {

        console.log('offical');

        //let baseURL = "https://chatgptdddd.com/";
        //addMessageChain(messageChain7, {role: "user", content: your_qus})//连续话
        const API_KEY = 'fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D';
        const API_URL = 'https://openai.api2d.net/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        };
    
        // 3.5 turbo
        const question = '什么是python';
        const requestBody = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: question }],
            stream: true,
        };

        GM_xmlhttpRequest({
            method:   'POST',
            url:      API_URL,
            headers: headers,
            data: JSON.stringify(requestBody),
            responseType: 'stream',
            onloadstart: async function(r) {
                //console.log(r);
                const reader = r.response.getReader();
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
                                console.log(match[1]);
                                response_str += match[1];
                                // render botText
                                //responseSpan.innerHTML = response_str;
                                // 随文字下拉
                                //chatLog.scrollTop = chatLog.scrollHeight;
                            }
                        });
                    }

                    if (done) break;
                }
                console.log('done');
            },
        });

    }

    GPT();
    
//    GM_xmlhttpRequest({
//        method:   'GET',
//        url:      'http://ipv4.download.thinkbroadband.com/100MB.zip?t=' + Date.now(),
//        responseType: 'stream',
//        onloadstart: async function(r) {
//            if (r.readyState == 4 && r.status == 200) {
//                const reader = r.response.getReader();
//                while (true) {
//                    const { done, value} = await reader.read(); // value is Uint8Array
//                    if (value) {
//                        console.log(value.length, 'received')
//                    }
//                    if (done) break;
//                }
//                console.log('done');
//            }
//        }
//    });

//    const your_qus = 'whatisgood';
//    function TOYAML() {
//
//        console.log('starting');
//
//        GM_fetch({
//            method: "GET",
//            url: "https://toyaml.com/stream?q=whatisgood",
//            //url: "https://toyaml.com/stream?q="+encodeURI(your_qus),
//            headers: {
//                "Content-Type": "application/json",
//                "Referer": "https://toyaml.com/",
//                "accept": "*/*"
//            },
//            responseType: "stream"
//        }).then((stream) => {
//            let finalResult = [];
//            const reader = stream.response.getReader();
//            console.log('get data');
//            reader.read().then(function processText({done, value}) {
//                if (done) {
//                    //highlightCodeStr()
//                    console.log('done');
//                    return;
//                }
//                try {
//                    // console.log(normalArray)
//                    let byteArray = new Uint8Array(value);
//                    let decoder = new TextDecoder('utf-8');
//                    let nowResult = decoder.decode(byteArray);
//                    console.log('streamed');
//                    console.log(nowResult);
//                    //if(!nowResult.match(/答案来自/)){
//                    //    finalResult.push(nowResult)
//                    //}
//                    //showAnserAndHighlightCodeStr(finalResult.join(""))
//
//                } catch (ex) {
//                    console.log(ex);
//                }
//
//                return reader.read().then(processText);
//            });
//        }).catch((ex)=>{
//            console.log(ex);
//        })
//    }
//
//    console.log('start');
//    TOYAML();

})();


// backup

/*
            onloadstart: async function(r) {
                //console.log(r);
                const reader = r.response.getReader();
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
                                console.log(match[1]);
                                response_str += match[1];
                                // render botText
                                responseSpan.innerHTML = response_str;
                                // 随文字下拉
                                //chatLog.scrollTop = chatLog.scrollHeight;
                            }
                        });
                    }

                    if (done) break;
                }
                console.log('done');
            },

*/
