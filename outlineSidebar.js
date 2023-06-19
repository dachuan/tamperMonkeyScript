// ==UserScript==
// @name         outliner sidebar
// @namespace    http://tampermonkey.net/
// @version      0.2.7
// @description  outliner diigo like sidebar for quotations
// @author       dcthehiker
// @match        *://*/*
// @exclude      /^https://.*?126.com/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=workflowy.com
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/outliner.js
// @require      file:///Users/dcthe/DC/Study/icoding/tamperMonkeyScript/localAssets/chatter.js
// @connect      openai.api2d.net
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*
 * 整合chatbox
 *  2023/6/19 下午8:53
 *  ------------------------------
 *  修改长按为双击作为数据互通操作
 *
 *  2023/6/18 上午10:59
 *  ------------------------------
 *  解决CSP问题，@conect和@grant
 *
 *  2023/6/17 下午2:05
 *  ------------------------------
 *  调整导出时候的大纲缩进
 *  长按item同时拷贝到系统剪切板
 *
 *  2023/6/16 上午9:59
 *  ------------------------------
 *  数据互通
 *  - [x] outliner数据到聊天输入框
 *  - [x] chatlog到outliner
 *  快捷键
 *  - [x] 快速切换面板，ss
 *  - [x] 快速启动sidebar，ctr+enter
 *  - [] 快捷发送数据，ctr+q
 *  - [] 快速input chatting 有bug
 *
 *  2023/6/15 下午9:31
 *  ------------------------------
 *  整合了switch按钮
 *  拖动及文本选择等
 *  样式初步成型
 *
 *  ------------------------------
 *  2023/6/13 下午1:16
 *  ------------------------------
 *  将chatWithGPT整合
 *
 * 改造成outline
 *  ------------------------------
 *  2023/6/11 下午1:29
 *  ------------------------------
 *  autoSave添加一个 blur 事件侦听器
 *  用于在焦点离开时自动保存
 *  避免最后一个item丢失
 *
 *  ------------------------------
 *  2023/6/10 下午5:31
 *  ------------------------------
 *  改进数据存储机制
 *  - 当sidebar元素有变化时
 *  - 自动保存
 *  sidebar可拖动
 *
 *  ------------------------------
 *  2023/6/9 下午3:52
 *  ------------------------------
 *  调整localStorage的key
 *  指向每一个页面href
 *  修正getXpath函数的bug
 *
 *  ------------------------------
 *  2023/6/8 下午2:26
 *  ------------------------------
 *  应用新的创建snippet的方法
 *  整合存储模块
 *  [x]调整webstorage的outliner重构方法
 *
 *  ------------------------------
 *  2023/6/6 上午10:25
 *  ------------------------------
 *  完成了大纲导出
 *  改进了初始不能收录高亮的问题
 *  完成单击跳转到原文
 *  todo:
 *  - 样式调整 done
 *  - 最上头的时间样式
 *
 *  ------------------------------
 *  2023/6/5 下午2:15
 *  ------------------------------
 *  初步实现了加载outline
 *  todo:
 *  - 样式调整
 *  - 代码优化
 * */

(function() {
    'use strict';

    console.log('csp');

    /* styel set */
    //---------start---------------------
    // 创建一个 <style> 元素
    const style = document.createElement('style');
    style.type = 'text/css';

    // 设置 CSS 规则
    // :focus设置outline:none 去除焦点时候的外框
    style.innerHTML = `
        .inner-item {
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }

        .chatItem {
            list-style-type: none;
            padding: 10px 5px;
            margin: 10px 10px;
            border-left: 3px solid #b9fe2c;
            background-color: #F5F5F5;
            box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            font-weight: normal;
            opacity: 100;
            color: #333;
        }

        .outliner-container {
            height: 420px;
        }

        .outliner-container > ul:focus {
            outline: none;
        }

        textarea:focus {
            outline: none;
        }

        .chatLog:focus {
            outline: none;
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
        }`;

    // 将 <style> 元素添加到页面的 <head> 中
    document.head.appendChild(style);
    //--------end----------------------

    /* 初始化数据*/
    //---------start---------------------
    const olEditor = outliner(); // 初始化outliner, required
    const chatBox = chatter().chatBox; // 初始化chatbox, required
    const webStorage = annotationStorage();
    let runScript = false; // 脚本开关
    //--------end----------------------

    /* sidebar 创建 */
    //---------start---------------------

    //// 创建一个侧边栏容器
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        position: fixed;
        right: 0;
        top: 50%;
        width: 400px;
        height: 450px;
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

    // 防止子元素不能选择

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

    //// 创建outliner面板

    // 容器
    const outlinerPanel = document.createElement('div');
    outlinerPanel.style.cssText = `
       display: 'block'; 
    `;

    // Make the title fixed at the top of the outlinerPanel
    const titleContainerOutliner = document.createElement('div');
    titleContainerOutliner.textContent = 'Quotations';
    titleContainerOutliner.style.cssText = `
        position: sticky;
        top: 0;
        font-size: 14px;
        font-weight: bold;
        color: #000;
        background-color: #42bbf4;
        text-align: center;
    `;

    // 点击title复制所有文本条目
    // 同时将数据保存到local storage
    titleContainerOutliner.addEventListener('click', function(event) {
        var url = window.location.origin + window.location.pathname;
        var title = document.title;
        var linkage = `[${title}](${url})`;

        var sidebarText = '';

        // add linkage
        sidebarText += linkage + '\n';

        // add all items in outliner
        var outlinerText = olEditor.outlineEditor.exportAllItems();
        var tabbedText = outlinerText.split('\n').map(line => '\t' + line).join('\n'); // 行首缩进，并于导出大纲分级
        sidebarText += tabbedText;

        navigator.clipboard.writeText(sidebarText);
        tipOfCopy();

        // 保存页面数据
        webStorage.saveAllAnnotations();
    });

    // 添加到sidebar
    document.body.appendChild(sidebar);
    sidebar.appendChild(outlinerPanel);
    outlinerPanel.appendChild(titleContainerOutliner);
    outlinerPanel.appendChild(olEditor);

    // copied 消息提示
    function tipOfCopy(){
        // 创建提示元素
        const tip = document.createElement('div');
        tip.textContent = 'All quotations copied.';
        tip.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transition: opacity 1s ease-in-out;
            background-color: #42bbf4;
            color: #fff;
        `;

        // 插入到文档中
        sidebar.appendChild(tip);

        // 1 秒后隐藏提示
        setTimeout(() => {
          tip.style.opacity = '0';
        }, 1000);
    }

    //// 创建chatbox面板
    
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
        color: #000;
        background-color: #42bbf4; // #bb42f4;
        text-align: center;
    `;

    // 添加到sidebar
    sidebar.appendChild(chatPanel);
    chatPanel.appendChild(titleContainerChat);
    chatPanel.appendChild(chatBox);

    // 初始两个panel的显示设置
    outlinerPanel.style.display = 'block';
    chatPanel.style.display = 'none';

    //// 添加一个面板切换的按钮
    const switchButton = document.createElement('button');
    switchButton.textContent = 's';
    switchButton.style.cssText = `
        position: absolute;
        top: 6px;
        left: 6px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #111;
        color: white;
        border: none;
        outline: none;
        cursor: pointer;
        z-index: 9999;
        font-size: 16px;
    `;

     // Add click event listener to the switch button
     switchButton.addEventListener('click', () => {
         switchBetweenPanels();
     });

    // 切换面板
    let activateChat = false;
    function switchBetweenPanels(){
            if (outlinerPanel.style.display === 'block') {
                outlinerPanel.style.display = 'none';
                chatPanel.style.display = 'block';
                activateChat = true;
                // activate input in chatting
                const chatInput = document.querySelector(".chatInput");
                const chatInputText = chatInput.value;
                chatInput.focus();
                setTimeout(()=>{ //清除多余的s字符
                    chatInput.value = chatInputText;
                }, 100);
            } else {
                outlinerPanel.style.display = 'block';
                chatPanel.style.display = 'none';
                activateChat = false;
            }
    }

    sidebar.appendChild(switchButton);
    //document.body.appendChild(switchButton);


    //// 添加一个控制sidebar出现的按钮
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
    // 初始化outliner的条目
    // 读取存储数据
    toggleSidebar.addEventListener('click', () => {
        toggleSidebar.style.backgroundColor = "#42bbf4";
        sidebar.style.opacity = (sidebar.style.opacity === '0' && runScript) ? '1' : '0';
        sidebar.style.zIndex = (sidebar.style.opacity === '0') ? '-9999' : '9999';
        toggleSidebar.textContent = (sidebar.style.opacity === '0') ? '+' : 'x';
        runScript = true;

        // make the first item
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const startTime = `Date: ${date} Time: ${time}`;

        if (olEditor.outlineEditor.children.length === 0) {
            const startItem = document.createElement('li');
            startItem.classList.add('starter');
            startItem.textContent = startTime; // Zero-width space
            //startItem.textContent = '\u200B' + startTime; // Zero-width space
            startItem.style.cssText =`
               text-align: right; 
               font-size: 10px;
            `;
            olEditor.outlineEditor.appendChild(startItem);
            olEditor.outlineEditor.lastActiveNode = startItem;

            // 读取存储数据
            // 进行页面重构
            webStorage.applyAllData();
        }
    });

    document.body.appendChild(toggleSidebar);

    // 划词生成snippet，添加到outliner中
    document.addEventListener('mouseup', function (e) {
        const selectedText = window.getSelection().toString().trim();

        // 检测是否为sidebar中的文字
        // sidebar中的文字不做处理，避免重复添加
        const target = event.target;

        if (selectedText.length > 0 && !sidebar.contains(target) && runScript) {
            // 文章中的高亮与outliner中item，保持一致的datasetIndex
            const equalDataSetIndex = Date.now();
            highlightSelectedText(equalDataSetIndex);

            // 创建一个新的snippet
            // 调用outliner自身的创建方法
            olEditor.outlineEditor.appendNewItem(selectedText, 'snippet', equalDataSetIndex);
            //console.log('add snippet to outline');

            // 侦听这个新建snippet的单击侦听
            const newAddedSnippet = document.querySelector(`.snippet[data-index="${equalDataSetIndex}"]`);
            newAddedSnippet.style.cssText = snippetStyle;

            newAddedSnippet.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡
                const highlighted = document.querySelector(`.highlighted[data-index="${newAddedSnippet.dataset.index}"]`);
                if (highlighted) {
                    highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            // 清除选区，避免重复添加
            window.getSelection().removeAllRanges();
            // 滚动到最后
            //sidebar.scrollTop = sidebar.scrollHeight;
        }
    });

    // Define Diigo style for list items
    var snippetStyle = `
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
    `;

    // esc键处理取消选择的情况
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            window.getSelection().removeAllRanges();
        }

    }
    document.addEventListener('keydown', handleKeyDown);

    // 高亮选区
    function highlightSelectedText(equalDataSetIndex) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.backgroundColor = 'yellow';
            span.className = 'highlighted';
            span.dataset.index = equalDataSetIndex;

            // 通过先extract，再insert可以避免
            // Non-Text元素包裹的错误
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            selection.removeAllRanges();

            // 重新选中先前选中的文本
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }


    // 数据存储于local storage
    function annotationStorage() {
        //console.log('storage pra');
        //
        const webStorage = {};
      
        const storageKey = 'highlightedData_' + window.location.href;
        const savedHighlightData = localStorage.getItem(storageKey);
        //console.log(savedOutlinerData);
      
        // 重新恢复页面
        // 包含outliner与页面高亮
        webStorage.applyAllData = function() {
            //console.log('loading data...');

            // 读取，并重新高亮
            if (savedHighlightData) {
                const parsedData = JSON.parse(savedHighlightData);
                parsedData.forEach((entry) => {
                  applyHighlight(entry);
                });
                //console.log('apply all highlighted.');
            }

            // 读取，并重新形成outliner
            olEditor.outlineEditor.restoreData();
            // 遍历所有snippet，增加跳转到原文高亮的侦听
            const snippets = Array.from(olEditor.outlineEditor.querySelectorAll('li')).filter(item => item.classList.contains('snippet'));
            snippets.forEach(snippet => {
                snippet.addEventListener('click', (e) => {
                    //console.log("clicked");
                    e.stopPropagation(); // 防止事件冒泡
                    const highlighted = document.querySelector(`.highlighted[data-index="${snippet.dataset.index}"]`);
                    if (highlighted) {
                        highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            });
            //console.log('apply outliner.');
        }
      
        // 存储数据
        webStorage.saveAllAnnotations = function() {
            const highlightedSpans = document.querySelectorAll('.highlighted');
            const data = Array.from(highlightedSpans).map((span) => {
              return {
                xpath: getXPath(span.parentNode),
                text: span.textContent,
                dataset_index: span.dataset.index
              };
            });

            // 使用当前页面的 URL 作为存储键
            const storageKey = 'highlightedData_' + window.location.href;
            localStorage.setItem(storageKey, JSON.stringify(data));
            //console.log('highlighted saved.');

            // 调用outliner中的数据保存方法
            olEditor.outlineEditor.saveData();
            //console.log('outliner saved');
      
        }
      
        function getXPath(element) {
            if (element.id !== '') {
              return 'id("' + element.id + '")';
            }
            if (element === document.body) {
              return element.tagName.toLowerCase();
            }
      
            let siblingIndex = 1;
            let sibling = element;
            while ((sibling = sibling.previousElementSibling)) {
                // 改进，只计算相同tag的兄弟节点
                if (sibling.tagName === element.tagName) {
                  siblingIndex++;
                }
              //siblingIndex++;
            }
      
            return (
              getXPath(element.parentNode) +
              '/' +
              element.tagName.toLowerCase() +
              '[' +
              siblingIndex +
              ']'
            );
        }
      
        function applyHighlight(entry) {
            //console.log('text: ', entry.text);
            //console.log('xpath: ', entry.xpath);
            //console.log(' ------------------------------')
            const parent = document.evaluate(
              entry.xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (!parent) return;
      
            const textNodeIndex = Array.from(parent.childNodes).findIndex(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent.includes(entry.text)
            );
            if (textNodeIndex === -1) return;
      
            const textNode = parent.childNodes[textNodeIndex];
            const highlightedSpan = document.createElement('span');
            highlightedSpan.className = 'highlighted';
            highlightedSpan.style.backgroundColor = 'yellow';
            highlightedSpan.textContent = entry.text;
            highlightedSpan.dataset.index = entry.dataset_index;
      
            const text = textNode.textContent;
            const textBefore = text.substring(0, text.indexOf(entry.text));
            const textAfter = text.substring(textBefore.length + entry.text.length);
      
            if (textBefore) {
              parent.insertBefore(document.createTextNode(textBefore), textNode);
            }
            parent.insertBefore(highlightedSpan, textNode);
            if (textAfter) {
              parent.insertBefore(document.createTextNode(textAfter), textNode);
            }
            parent.removeChild(textNode);
        }
      
        return webStorage
    }


    function autoSave(targetNode){
        // 回调函数，当监控行为观察到变化时执行
        const callback_save = function(mutationsList, observer) {
            webStorage.saveAllAnnotations();
            //console.log('save all data to local storage.');
        };
        
        // 观察器的配置（需要观察哪些变动）
        const config_change = {
            //attributes: true,
            childList: true,
            subtree: true
        };
        
        // 创建一个观察器实例并传入回调函数
        const observer_save = new MutationObserver(callback_save);
        
        // 用配置文件开始观察目标节点
        observer_save.observe(targetNode, config_change);
        
        // 添加一个 blur 事件侦听器，用于在焦点离开时自动保存
        const onBlur = function (event) {
            webStorage.saveAllAnnotations();
            //console.log('save all data to local storage on blur.');
        };
        targetNode.addEventListener('blur', onBlur, true);

        // 之后，你可以使用下面的代码停止观察
        // observer.disconnect();
    }

    const targetNode = sidebar; // 监控sidebar中的元素变化，进行存储
    autoSave(targetNode);

    /// 数据在面板之间互通

    // sidebar作为侦听器
    // 长按数据互通 改
    // 双击互通
    sidebar.addEventListener('dblclick', (event) => {
        const target = event.target;
        const targetText = target.textContent;
        if (target.classList.contains("inner-item") || 
            target.classList.contains("chatItem")    ||
            target.classList.contains("snippet")
        ){
            outlinerToChatInput(targetText);
            tipOfTransferData(target);
            // save to clipboard
            navigator.clipboard.writeText(targetText);
        } else if(target.classList.contains('userLog') ||
            target.classList.contains('botLog')
        ){
            chatlogToOutliner(targetText);
            tipOfTransferData(target);
            navigator.clipboard.writeText(targetText);
        }
        else{
            //console.log('not for processing');
        }
    });
    /* 长按
    sidebar.addEventListener('mousedown', (event) => {
        const insertTimeout = setTimeout(() => {
            //console.log('long press');
            const target = event.target;
            const targetText = target.textContent;
            if (target.classList.contains("inner-item") || 
                target.classList.contains("chatItem")    ||
                target.classList.contains("snippet")
            ){
                outlinerToChatInput(targetText);
                tipOfTransferData(target);
                // save to clipboard
                navigator.clipboard.writeText(targetText);
            } else if(target.classList.contains('userLog') ||
                target.classList.contains('botLog')
            ){
                chatlogToOutliner(targetText);
                tipOfTransferData(target);
                navigator.clipboard.writeText(targetText);
            }
            else{
                //console.log('not for processing');
            }
        }, 500); // 1000ms 长按时间

        // 鼠标松开时清除定时器，避免误触发
        sidebar.addEventListener('mouseup', () => {
            clearTimeout(insertTimeout);
        });

        sidebar.addEventListener('mouseleave', () => {
            clearTimeout(insertTimeout);
        });
    });*/

    // 几个处理函数
    function chatlogToOutliner(targetText){
        /*将聊天记录发送到outliner作为一个item*/
        const dataSetIndex = Date.now();
        olEditor.outlineEditor.appendNewItem(targetText, 'chatItem', dataSetIndex);
    }

    function outlinerToChatInput(targetText){
        /* 将outliner中的item，发送到聊天输入框*/
        const chatInput = document.querySelector('.chatInput');
        const currentText = chatInput.value;
        const newText = currentText + ' ' + targetText;
        chatInput.value = newText;
    }

    function tipOfTransferData(target){
        // Animate 
        var opacity = 0;
        var interval = setInterval(function(){
            opacity += 0.1;
            target.style.opacity = opacity;
            if(opacity >= 1){
                clearInterval(interval);
            }
        }, 100);
    }


    /// key handler for shortcuts    
    
    class KeyHandler {
      constructor() {
        this.keyDown = {};
        this.lastKey = null;
        this.lastKeyDownTime = null;
        this.leaderKeyDown = false;
        this.leaderKey = [];
    
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
      }
    
      handleKeyDown(e) {
        this.keyDown[e.key] = true;
    
        if (this.leaderKeyDown) {
          this.checkLeaderFollowKey(e.key);
        }
      }
    
      handleKeyUp(e) {
        this.keyDown[e.key] = false;
      }
    
      singleKey(key, callback) {
        document.addEventListener('keydown', (e) => {
          if (e.key === key) {
            callback();
            //console.log(this.keyDown);
          }
        });
      }
    
      combinationKey(keys, callback) {
        document.addEventListener('keydown', (e) => {
          const allKeysPressed = keys.every((key) => this.keyDown[key]);
          if (allKeysPressed) {
            callback();
            //console.log(this.keyDown);
          }
        });
      }
    
      doubleKey(key, interval, callback) {
        document.addEventListener('keydown', (e) => {
          if (e.key === key) {
            const currentTime = new Date().getTime();
            if (this.lastKey === key && currentTime - this.lastKeyDownTime < interval) {
              callback();
            }
            this.lastKey = key;
            this.lastKeyDownTime = currentTime;
          }
        });
      }
    
      comboKey(leaderKeys, followKey, callback) {
        this.leaderKey = leaderKeys;
        document.addEventListener('keydown', (e) => {
          const allKeysPressed = leaderKeys.every((key) => this.keyDown[key]);
          if (allKeysPressed) {
            this.leaderKeyDown = true;
          }
        });
    
        this.checkLeaderFollowKey = (key) => {
          if (key === followKey) {
            callback();
          }
          this.leaderKeyDown = false;
        };
      }
    }

    const keyHandler = new KeyHandler();

    // 快捷开启sidebar
    // 第一次需要手动点击toggle button
    keyHandler.combinationKey(['Control', 'Enter'], toggleButtonClick);
    function toggleButtonClick(){
        if (document.activeElement.nodeName === 'BODY'){
            toggleSidebar.click();
        }
    }

    // 双击s，切换面板
    keyHandler.doubleKey('s', 200, switchBetweenPanelsByss); 
    function switchBetweenPanelsByss(){
        if (document.activeElement.nodeName === 'BODY'){
            switchBetweenPanels();
        }
    }


    // 快速进入chat输入
    // 有bug
    //keyHandler.doubleKey('i', 200, focusChatInput); 
    //keyHandler.singleKey('i', focusChatInput); 
    //keyHandler.combinationKey(['Control', 'a'], focusChatInput);

    function focusChatInput(){
        //console.log(activateChat);
        if(activateChat){
            const chatInput = document.querySelector(".chatInput");
            chatInput.focus();
            setTimeout(()=>{ //清除多余的s字符
                chatInput.value = '';
            }, 100);
            //console.log('on chatting');
            chatInput.focus();
        }
    }


    // ctr + q, 面板之间转移数据
    // not works
    //keyHandler.combinationKey(['Control', 'q'], transData);

    // ------------------------------
    // backup
    // ------------------------------
})();
