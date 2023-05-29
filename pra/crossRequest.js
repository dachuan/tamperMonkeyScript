// ==UserScript==
// @name         cross url request
// @namespace    http://your.homepage/
// @version      0.1
// @description  My Tampermonkey Script
// @match        http://*/*
// @match        https://*/*
// @connect      unpkg.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 声明一个loadScript函数，使用GM_xmlhttpRequest函数获取JavaScript文件内容
//    function loadScript(src) {
//        return new Promise((resolve, reject) => {
//            GM_xmlhttpRequest({
//                method: 'GET',
//                url: src,
//                onload: function(response) {
//                    // 请求成功后，将JavaScript文件插入到页面中
//                    const script = document.createElement('script');
//                    script.textContent = response.responseText;
//                    document.head.appendChild(script);
//                    resolve();
//                },
//                onerror: function(response) {
//                    // 请求失败后，打印错误信息并reject Promise
//                    console.log('Error: ' + response.statusText);
//                    reject(response.statusText);
//                }
//            });
//        });
//    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: src,
                onload: function(response) {
                    // 请求成功后，将JavaScript文件插入到页面中
                    const script = document.createElement('script');
                    const blob = new Blob([response.responseText], { type: 'text/javascript' });
                    script.src = URL.createObjectURL(blob);
                    document.head.appendChild(script);
                    script.onload = () => {
                        resolve();
                        URL.revokeObjectURL(script.src);
                    };
                },
                onerror: function(response) {
                    // 请求失败后，打印错误信息并reject Promise
                    console.log('Error: ' + response.statusText);
                    reject(response.statusText);
                }
            });
        });
    }


    // 在脚本中使用单个url请求
//    loadScript('https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.development.js')
//        .then(() => {
//            console.log('Script loaded!');
//        })
//        .catch((error) => {
//            console.log('Error: ' + error);
//        });
    
    // 加载多个js文件
    Promise.all([
        loadScript('https://unpkg.com/react@18.2.0/umd/react.development.js'),
        loadScript('https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js'),
        loadScript('https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.development.js'),
    ]).then(() => {
        console.log('all three scripts loaded.');

    }).catch((error) => {
            console.log('Error: ' + error);
        });

})();
