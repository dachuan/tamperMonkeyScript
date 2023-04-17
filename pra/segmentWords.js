// ==UserScript==
// @name         中文分词示例脚本
// @description  将页面中的中文进行分词，并输出到控制台中
// @version      0.0.1
// @match        *://*/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/segmentit@2.0.3/dist/umd/segmentit.js
// ==/UserScript==

const segmentit = Segmentit.useDefault(new Segmentit.Segment());
const result = segmentit.doSegment('工信处女干事bee每月经过下属科室都要must亲口交代24口交换机等技术性器件的安装工作。');
console.log(result);
