// ==UserScript==
// @name         Highlight the GPT quotations
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  key listener for activate some function
// @author       dcthehiker
// @match        http*://0.0.0.0
// @match        http*://localhost:*
// @match        http*://localhost:8000/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*
 *  2023/7/6 下午3:29
 *  ------------------------------
 *  尝试使用function call
 *  请求跑通
 *  解析arguments成功
 *  []进一步解析keywords
 *
 * 格式化输出可控性很差
 * 不应继续沿着这条路进行
 *
 * */

(function() {
    
    'use strict';
    console.log("Function Call  GPT quotations.");


    const API_KEY = 'fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D';
    const API_URL = 'https://openai.api2d.net/v1/chat/completions';
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        //'x-api2d-no-cache': 1, // 强制跳过缓存
    };


    // html content
    const innerText = document.body.innerText;
    //console.log(innerText);
    
    // 定义高亮样式
    const highlightStyle = "background-color: yellow;";
    
    // 获取网页正文的文本内容
    const bodyHTML = document.body.innerHTML;
    let highlightedText = bodyHTML;
    
    // 查找第一处匹配，并高亮
    function highlightFirstWord(searchText){
        // 定义正则表达式
        var regex = new RegExp(searchText, "gi");
        
        // 在正文中查找第一处匹配位置
        var match = regex.exec(highlightedText);
        
        if (match !== null) {
          // 如果匹配到了，则将匹配到的文本用带有高亮样式的<span>包裹起来
          highlightedText = highlightedText.substring(0, match.index) + "<span style=\"" + highlightStyle + "\">" + match[0] + "</span>" + highlightedText.substring(match.index + match[0].length);
        }
    }

    // push message
    let messages = [];
    const sys_prompt = "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous."; 

    messages.push({ role:"system", content: sys_prompt});
    messages.push({ role: "user", content: innerText});

    // set functions for calling
    const functions = [
        {
            "name": "extract_keyword_relations",
            "description": "extract inner relations of keywords",
            "parameters": {
                "type": "object",
                "properties": {
                        "relations":{
                        "type": ["object"],
                        "description": "Multi-Entity Relationship between keywords in form like: {'keyword A-->keyword B':'context logic relation description'}",
                    }
                },
                "required": ["relations"],
            },
        },
    ];
    
    // 3.5 turbo
    const requestBody = {
        // 不同的model表现有差异
        // 0613常偷工减料
        //model: 'gpt-3.5-turbo-0301',
        model: `gpt-3.5-turbo-0613`,

        messages: messages,
        functions: functions,
        function_call: {"name": "extract_keyword_relations"},

        //temperature: 0.5,
        //stream: true,
    };

    // keywords by GPT
    let searchTexts = [];
    GM_xmlhttpRequest({
        method: 'POST',
        headers: headers,
        url: API_URL,
        data: JSON.stringify(requestBody),
        onload: function(response) {

            // 解析返回的argument中的relations
            //console.log(response.responseText);
            const json_resp = JSON.parse(response.responseText);
            //console.log(json_resp);
            const arg_returned = json_resp.choices[0].message.function_call["arguments"];
            //console.log(arg_returned);
            const keywords_relations = JSON.parse(arg_returned).relations;
            //console.log(keywords_relations);

            //searchTexts = searchTexts.concat(ls_keywords.keywords);
            //console.log(searchTexts);
            //for(let searchText of searchTexts){
            //    console.log(searchText);
            //    highlightFirstWord(searchText);
            //}
            //// 将整个网页正文的innerHTML属性替换为替换后的内容
            //document.body.innerHTML = highlightedText;
        },
    })

// backup
/*
    const sys_prompt = `
1- Your interest lies in how human cognition can be enhanced with the assistance of LLM. Based on this interest, first extract all keywords from the following text and list them in format of json like \`\`\`{"keywords" : ["keyword","keyword","keyword"]}\`\`\`. 
2- Then, let's try to connect these keywords in sequence through a logical chain.  The logical chain is to be displayed in mermaid form and also put into json data like: 
\`\`\`{"mermaid_data":"
\`\`\` mermaid! graph LR keyword A--relation--> keyword B
\`\`\`"}\`\`\`
3- Remember: reply in Chinese
    `;
    */

})();

