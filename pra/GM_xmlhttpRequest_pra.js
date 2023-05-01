// ==UserScript==
// @name         GM_xmlHttpRequest
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    /* tamper monkey中的一个网络请求库
     * @grant 必须
     * onreadystatechange 里面的状态表明了请求状态
     * 最终的请求回复在onload中
     * */

    // 发送 HTTP 请求
GM_xmlhttpRequest({
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/todos/1',
  onload: function(response) {
    console.log(response.responseText);
  },
  onreadystatechange: function(response) {
    // 根据 readyState 属性的值判断 HTTP 请求的状态
    switch (response.readyState) {
      case 0:
        console.log('请求未初始化');
        break;
      case 1:
        console.log('服务器连接已建立');
        break;
      case 2:
        console.log('请求已接收');
        break;
      case 3:
        console.log('请求处理中');
        break;
      case 4:
        console.log('请求已完成，且响应已就绪');
        break;
    }
  }
});
})();
