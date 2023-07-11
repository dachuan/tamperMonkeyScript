// ==UserScript==
// @name         Highlight the GPT quotations
// @namespace    http://tampermonkey.net/
// @version      0.0.2
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


    /// GPT request by function call
    // ------------------------------

    // config
    const API_KEY = 'fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D';
    const API_URL = 'https://openai.api2d.net/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        //'x-api2d-no-cache': 1, // 强制跳过缓存
    };

    // push message
    let messages = [];
    const sys_prompt = "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous.";

    // html content
    const innerText = document.body.innerText;
    //console.log(innerText);

    messages.push({
        role: "system",
        content: sys_prompt
    });
    messages.push({
        role: "user",
        content: innerText
    });

    // set functions for calling
    const functions = [{
        "name": "extract_keyword_relations",
        "description": "extract inner relations of keywords",
        "parameters": {
            "type": "object",
            "properties": {
                "relations": {
                    "type": ["object"],
                    "description": "Multi-Entity Relationship between keywords in form like: {'keyword A-->keyword B':'context logic relation description'}",
                }
            },
            "required": ["relations"],
        },
    }, ];

    // 3.5 turbo
    const requestBody = {
        // 不同的model表现有差异
        // 0613才有function call
        // 0613常偷工减料
        //model: 'gpt-3.5-turbo-0301',
        model: `gpt-3.5-turbo-0613`,

        messages: messages,
        functions: functions,
        function_call: {
            "name": "extract_keyword_relations"
        },

        //temperature: 0.5,
        //stream: true,
    };

    function GPT_query(requestBody) {

        console.log('waiting for GPT response...');

        GM_xmlhttpRequest({
            method: 'POST',
            headers: headers,
            url: API_URL,
            data: JSON.stringify(requestBody),
            onload: function(response) {

                console.log("replying from GPT...");
                // 解析返回的argument中的relations
                console.log(response.responseText);
                const json_resp = JSON.parse(response.responseText);
                //console.log(json_resp);
                const arg_returned = json_resp.choices[0].message.function_call["arguments"];
                //console.log(arg_returned);
                const keywords_relations = JSON.parse(arg_returned).relations;
                console.log(keywords_relations);

                const parsedRelations = parseRelations(keywords_relations);

                console.log(parsedRelations);

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
    }

    // parse "from-->to": "relation"
    // to: "from":"xxx", "to":"xxx", "relation":"xxx"
    function parseRelations(relationData) {
        const result = [];
        for (const key in relationData) {
            const from = key.split("-->")[0];
            const to = key.split("-->")[1];
            const relation = relationData[key];
            const triple = {
                from,
                to,
                relation
            };
            result.push(triple);
        }
        return result
    }

    /// highlight and set inline relations
    // ------------------------------

    // 实现高亮
    // 定义高亮样式
    const highlightStyle = "background-color: yellow;";

    // 获取网页正文的文本内容
    const bodyHTML = document.body.innerHTML;
    let highlightedText = bodyHTML;

    // 查找第一处匹配，并高亮
    function highlightFirstWord(keyword) {
        // 检查是否已经高亮了关键词
          const existingHighlight = document.querySelector(`#${keyword}.hled`);
          if (existingHighlight !== null) {
            // 关键词已经被高亮
            console.log('already done.');
            return;
          }
        // 搜索页面中所有的文本节点
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;

            // 检查文本节点是否包含关键词
            const index = node.textContent.toLowerCase().indexOf(keyword.toLowerCase());
            if (index !== -1) {
                // 如果找到了关键词，创建一个新的 span 元素
                const span = document.createElement('span');
                span.style.backgroundColor = 'yellow';
                span.classList.add('hled');
                span.id = keyword;

                // 将匹配的文本分为两个部分：匹配前面的部分和匹配后面的部分
                const before = node.textContent.slice(0, index);
                const match = node.textContent.slice(index, index + keyword.length);
                const after = node.textContent.slice(index + keyword.length);

                // 将匹配前面的文本作为一个新的文本节点插入到 DOM 中
                if (before.length > 0) {
                    const beforeNode = document.createTextNode(before);
                    node.parentNode.insertBefore(beforeNode, node);
                }

                // 将匹配的文本作为一个新的 span 元素插入到 DOM 中
                span.appendChild(document.createTextNode(match));
                node.parentNode.insertBefore(span, node);

                // 将匹配后面的文本作为一个新的文本节点插入到 DOM 中
                if (after.length > 0) {
                    const afterNode = document.createTextNode(after);
                    node.parentNode.insertBefore(afterNode, node);
                }

                // 删除原始的文本节点
                node.parentNode.removeChild(node);

                // 退出循环，只高亮第一个匹配的关键词
                return;
            }
        }
    }

    //highlightFirstWord("prompt");
    //highlightFirstWord("明确");
    //highlightFirstWord("要求");
    //highlightFirstWord("prompt");

    // setup a SVG cover
    const w = document.querySelector("body").clientWidth;
    const h = document.querySelector("body").clientHeight;
    createSVG(w, h);
    const svg = document.getElementById('svg-cover');

    function createSVG(width, height) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.zIndex = "999";
        svg.style.width = width + "px";
        svg.style.height = height + "px";
        svg.setAttribute("id", "svg-cover");
        document.body.appendChild(svg);
    }


    // inline relation 
    // 画线及relation框
    function drawLineBetweenSpans(span_from, span_to, distTurn, relation = "related") {

        function getSpanConnectionPoints(span) {
            const rect = span.getBoundingClientRect();
            const topConnectionPoint = {
                x: rect.left + rect.width / 2,
                y: rect.top - 5
            };
            const bottomConnectionPoint = {
                x: rect.left + rect.width / 2,
                y: rect.bottom - rect.height / 2 + 5,
            };
            return {
                topConnectionPoint,
                bottomConnectionPoint
            };
        }

        const spanFromPoints = getSpanConnectionPoints(span_from);
        const spanToPoints = getSpanConnectionPoints(span_to);

        let startPoint, endPoint;
        let turn1Point = {},
            turn2Point = {};

        // Determine start point
        if (spanFromPoints.bottomConnectionPoint.y < spanToPoints.topConnectionPoint.y) {
            startPoint = spanFromPoints.bottomConnectionPoint;
            turn1Point.x = startPoint.x;
            turn1Point.y = startPoint.y + distTurn;
        } else {
            startPoint = spanFromPoints.topConnectionPoint;
            turn1Point.x = startPoint.x;
            turn1Point.y = startPoint.y - distTurn;
        }

        // Determine end point
        if (spanToPoints.topConnectionPoint.y > spanFromPoints.bottomConnectionPoint.y) {
            endPoint = spanToPoints.topConnectionPoint;
        } else {
            endPoint = spanToPoints.bottomConnectionPoint;
        }

        turn2Point.x = endPoint.x;
        turn2Point.y = turn1Point.y;

        const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line1.setAttribute("x1", startPoint.x);
        line1.setAttribute("y1", startPoint.y);
        line1.setAttribute("x2", turn1Point.x);
        line1.setAttribute("y2", turn1Point.y);
        line1.setAttribute("stroke", "black");
        line1.setAttribute("stroke-width", "2");
        svg.appendChild(line1);

        const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", turn1Point.x);
        line2.setAttribute("y1", turn1Point.y);
        line2.setAttribute("x2", turn2Point.x);
        line2.setAttribute("y2", turn2Point.y);
        line2.setAttribute("stroke", "black");
        line2.setAttribute("stroke-width", "2");
        svg.appendChild(line2);

        const line3 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line3.setAttribute("x1", turn2Point.x);
        line3.setAttribute("y1", turn2Point.y);
        line3.setAttribute("x2", endPoint.x);
        line3.setAttribute("y2", endPoint.y);
        line3.setAttribute("stroke", "black");
        line3.setAttribute("stroke-width", "2");
        svg.appendChild(line3);

        // Add starting point
        const start = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        start.setAttribute("cx", startPoint.x);
        start.setAttribute("cy", startPoint.y);
        start.setAttribute("r", "5");
        start.setAttribute("fill", "black");
        svg.appendChild(start);

        // Add relation 
        // 创建文本元素
        const ankor = {
            "x": turn1Point.x + (turn2Point.x - turn1Point.x) / 2,
            "y": turn1Point.y
        }; // 卯定位置,第1,2个拐点中点

        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", ankor.x + 5);
        text.setAttribute("y", ankor.y);
        text.setAttribute("font-size", "10"); // 设置文本大小为10
        text.textContent = relation;
        svg.appendChild(text);

        // 点击进入编辑状态
        text.addEventListener("click", function() {
            // 编辑 text 元素的内容
            var foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
            foreignObject.setAttribute("width", "100");
            foreignObject.setAttribute("height", "20");
            foreignObject.setAttribute("x", ankor.x);
            foreignObject.setAttribute("y", text.getAttribute("y") - foreignObject.getAttribute("height"));

            var input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("value", text.textContent);
            input.style.width = "100%";
            input.style.height = "100%";
            input.style.boxSizing = "border-box";
            input.style.padding = "2px";
            input.style.fontSize = "10px";

            foreignObject.appendChild(input);
            svg.appendChild(foreignObject);

            text.setAttribute("visibility", "hidden");
            rect.setAttribute("visibility", "hidden");

            input.select();

            input.addEventListener("blur", function() {
                text.textContent = input.value;
                foreignObject.remove();
                text.setAttribute("visibility", "visible");

                // 动态调整文本元素的边界框大小
                setRectAttr();
                rect.setAttribute("visibility", "visible");
            });
        });


        // 动态调整文本元素的边界框大小
        function setRectAttr() {
            const bbox = text.getBBox();
            rect.setAttribute("x", bbox.x);
            rect.setAttribute("y", bbox.y);
            rect.setAttribute("width", bbox.width);
            rect.setAttribute("height", bbox.height);
        }

        // 创建矩形元素
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        setRectAttr();
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", "black");
        svg.appendChild(rect);

        // 默认隐藏
        rect.setAttribute("opacity", "0"); // 设置不透明度为0
        text.setAttribute("opacity", "0");

        // 创建圆形按钮
        var toggler = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        toggler.setAttribute("cx", ankor.x); // 将圆形按钮放在文字最开头
        toggler.setAttribute("cy", ankor.y);
        toggler.setAttribute("r", "5");
        toggler.setAttribute("fill", "red");
        svg.appendChild(toggler);

        // 添加事件监听器
        toggler.addEventListener("click", function() {
            var opacity = rect.getAttribute("opacity") || "1"; // 获取当前不透明度
            if (opacity === "1") {
                rect.setAttribute("opacity", "0"); // 设置不透明度为0
                text.setAttribute("opacity", "0");
            } else {
                rect.setAttribute("opacity", "1"); // 设置不透明度为1
                text.setAttribute("opacity", "1");
            }
        });

        // Add arrowhead
        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        let arrowPoints;
        if (startPoint.y < endPoint.y) {
            arrowPoints = `${endPoint.x},${endPoint.y} ${endPoint.x - 5},${endPoint.y - 10} ${endPoint.x + 5},${endPoint.y - 10}`;
        } else {
            arrowPoints = `${endPoint.x},${endPoint.y} ${endPoint.x - 5},${endPoint.y + 10} ${endPoint.x + 5},${endPoint.y + 10}`;
        }
        arrow.setAttribute("points", arrowPoints);
        arrow.setAttribute("class", "arrow");
        svg.appendChild(arrow);
    }

    // 绘制所有的高亮及inline relation
    function inlineCognitive(parsedRelations) {
        for(let triple of parsedRelations){
            const from = triple.from;
            const to = triple.to;
            const relation = triple.relation;

            console.log("from: ", from);
            console.log("to: ", to);
            console.log("relation: ", relation);

            // highlight the from/to text
            highlightFirstWord(from);
            highlightFirstWord(to);

            // inline relation
            const span_from = document.getElementById(from);
            const span_to = document.getElementById(to);
            drawLineBetweenSpans(span_from, span_to, 10, relation);
        }
    }

    const test_data = [
        {
            "from": "调整",
            "to": "函数",
            "relation": "通过调整函数来改进"
        },
        {
            "from": "主题",
            "to": "内容",
            "relation": "主题与内容相关"
        },
        {
            "from": "分解",
            "to": "主题",
            "relation": "将主题或内容分解成多个子主题"
        },
        {
            "from": "制定",
            "to": "问题",
            "relation": "为每个子主题制定相关问题"
        },
        {
            "from": "提供",
            "to": "背景信息",
            "relation": "根据需要提供背景信息"
        },
        {
            "from": "执行",
            "to": "测试和改进",
            "relation": "设计完prompt后进行测试和改进"
        }
    ];

    inlineCognitive(test_data);


    /// set a button for GPT request
    // ------------------------------
    const GPT_btn = document.createElement('button');
    GPT_btn.innerHTML = "request";
    document.body.appendChild(GPT_btn);
    GPT_btn.addEventListener('click', function() {
        GPT_query(requestBody)
    });

    // backup
    /*
        const sys_prompt = `
    1- Your interest lies in how human cognition can be enhanced with the assistance of LLM. Based on this interest, first extract all keywords from the following text and list them in format of json like \`\`\`{"keywords" : ["keyword","keyword","keyword"]}\`\`\`. 
    2- Then, let's try to connect these keywords in sequence through a logical chain.  The logical chain is to be displayed in mermaid form and also put into json data like: 
    \`\`\`{"mermaid_data":"
    \`\`\` mermaid!
    graph LR
    keyword A--relation--> keyword B
    \`\`\`"}\`\`\`
    3- Remember: reply in Chinese
        `;

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


        test data:
    [
        {
            "from": "调整",
            "to": "函数",
            "relation": "通过调整函数来改进"
        },
        {
            "from": "主题",
            "to": "内容",
            "relation": "主题与内容相关"
        },
        {
            "from": "prompt",
            "to": "步骤",
            "relation": "prompt通过以下步骤来进行"
        },
        {
            "from": "思考",
            "to": "任务",
            "relation": "prompt的目标是让用户进行思考任务"
        },
        {
            "from": "分解",
            "to": "主题",
            "relation": "将主题或内容分解成多个子主题"
        },
        {
            "from": "制定",
            "to": "问题",
            "relation": "为每个子主题制定相关问题"
        },
        {
            "from": "提供",
            "to": "背景信息",
            "relation": "根据需要提供背景信息"
        },
        {
            "from": "激发",
            "to": "创意或思考的方式",
            "relation": "通过不同方式激发用户的创意或思考能力"
        },
        {
            "from": "设定",
            "to": "要求或标准",
            "relation": "明确用户需要达到的要求或标准"
        },
        {
            "from": "结束",
            "to": "提示",
            "relation": "为prompt提供适当的结束提示"
        },
        {
            "from": "执行",
            "to": "测试和改进",
            "relation": "设计完prompt后进行测试和改进"
        }
    ]

        function _highlightFirstWord(searchText){
            // 定义正则表达式
            var regex = new RegExp(searchText, "gi");
            
            // 在正文中查找第一处匹配位置
            var match = regex.exec(highlightedText);
            
            if (match !== null) {
                // 如果匹配到了，则将匹配到的文本用带有高亮样式的<span>包裹起来
                // id 为文本值
                console.log("matched: ", match[0]);
                highlightedText = highlightedText.substring(0, match.index) + "<span style=\"" + highlightStyle + ">" + match[0] + "</span>" + highlightedText.substring(match.index + match[0].length);
                //highlightedText = highlightedText.substring(0, match.index) + "<span style=\"" + highlightStyle + "\" id=\"" + match[0] + "\">" + match[0] + "</span>" + highlightedText.substring(match.index + match[0].length);
                //将html的内容替换
                document.body.innerHTML = highlightedText;
            }
        }
        */

})();
