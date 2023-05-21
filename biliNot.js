// ==UserScript==
// @name         B站笔记快捷键←↓→
// @namespace    indefined
// @version      0.1
// @description  修改大王鹅鹅鹅script
// @author       dcthe
// @match        http*://www.bilibili.com/video/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @grant        none
// @license      AGPL License
// ==/UserScript==

(function() {
    'use strict';
    // JS监听键盘快捷键事件
    document.addEventListener('keydown', function (event)
    {
        if (event.ctrlKey && event.keyCode == 13) {//截图+时间戳——快捷键：ctrl+Enter
            document.querySelector('i.bili-note-iconfont.iconcapture-app').click();
            new Promise((resolve,reject)=>{
                document.querySelector('i.bili-note-iconfont.iconicon_flag_L').click();
                return resolve();
            }).then(()=>{
                setTimeout( function(){//移动光标到文末
                    document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
                    setTimeout(1 * 100 );
                    document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
                },500);
            });
        };

        if (event.ctrlKey && event.keyCode == 32) {//插入文本：Ctrl+space
             document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
             setTimeout(1 * 100 );
             document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
        };
        /*
        if (event.ctrlKey && event.keyCode == 37) {//时间戳——快捷键：Ctrl+←
             document.querySelector('i.bili-note-iconfont.iconicon_flag_L').click();
             setTimeout( function(){
              document.querySelector('div.dialog-btn.tag-dialog__btn--confirm:nth-child(2)').click();
             }, 5 * 100 );
        };
        if (event.shiftKey && event.keyCode == 38) {//打开笔记——快捷键：shift+↑
             document.querySelector('div.note-btn.note-btn__blue:nth-child(2)').click();
             document.querySelector('div.note-list-footer > div.note-list-btn').click()

        };
        if (event.shiftKey && event.keyCode == 40) {//关闭笔记——快捷键：shift+↓
             document.querySelector('i.bili-note-iconfont.iconiconfont_icon_close').click();

        };

        if (event.ctrlKey && event.keyCode == 39) {//截图——快捷键：Ctrl+→
            document.querySelector('i.bili-note-iconfont.iconcapture-app').click();
        };
        if (event.shiftKey && event.keyCode == 13) {//截图+时间戳——快捷键：shift+Enter
            document.querySelector('i.bili-note-iconfont.iconcapture-app').click();
            new Promise((resolve,reject)=>{
                document.querySelector('i.bili-note-iconfont.iconicon_flag_L').click();
                return resolve();
            }).then(()=>{
                setTimeout( function(){
                    document.querySelector('div.dialog-btn.tag-dialog__btn--confirm:nth-child(2)').click();
                    var parentNode=document.querySelector('div.editor-innter.ql-container.ql-snow > div.ql-editor');
                    var childN=parentNode.childNodes;
                    for(var i=0;childN.length;i++){
                        if(childN[i].innerHTML=="<br>" && childN[i].nextSibling.innerHTML!="<br>" && childN[i].nextSibling.nodeName == "P" && childN[i].previousSibling.nodeName == "DIV"){
                           childN[i].remove();
                        }
                    }
                },1500);
            });
        };
*/
    });


})();


