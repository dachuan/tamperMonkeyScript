// ==UserScript==
// @name         Streaming data decoder
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  streaming decoder
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY = 'fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D';
    const API_URL = 'https://openai.api2d.net/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    };

    const question = "python是什么";

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

            // Print each line to console
            //lines.forEach(line => console.log(line));

            // Print each line to console if it contains the desired content
            lines.forEach(line => {
                const match = line.match(/{"content":"([^"]*)"/);
                if (match) {
                    console.log(match[1]);
                }
            });

            // Read next chunk of data
            reader.read().then(processText);
        });
    });
})();
