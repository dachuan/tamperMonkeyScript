// ==UserScript==
// @name         B站笔记快捷键←↓→
// @namespace    indefined
// @version      0.2
// @description  修改大王鹅鹅鹅script
// @author       dcthe
// @match        http*://www.bilibili.com/video/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @grant        none
// @license      AGPL License
// ==/UserScript==

/*
 * 改用setTimeout的套嵌来实现多个按键按下
 *  2023/5/23 下午2:36
 * */

(function() {
    'use strict';

    // JS监听键盘快捷键事件
    document.addEventListener('keydown', function (event)
    {
        if (event.ctrlKey && event.keyCode == 13) {//截图+时间戳——快捷键：ctrl+Enter
            
            // 3 buttons here
            const time_btn = document.querySelector('i.bili-note-iconfont.iconicon_flag_L');
            let yes_btn;
            const screen_btn = document.querySelector('i.bili-note-iconfont.iconcapture-app');
            const list_btn =  document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered");
            
            // one by one click
            setTimeout(function() { //click time botton
              time_btn.click();
              setTimeout(function() { //wait for yes_btn appear
                  if(!yes_btn){
                    yes_btn = document.querySelector('div.dialog-btn.tag-dialog__btn--confirm:nth-child(2)');
                  }
                setTimeout(function() { //click yes_btn
                  yes_btn.click();
                  setTimeout(function() { //click screen_btn
                    screen_btn.click();
                    setTimeout(function(){ //click list_btn to bottom
                      list_btn.click();
                      list_btn.click();
                    }, 100);
                  }, 100);
                }, 100);
              },200);
            }, 100);
        }

        if (event.ctrlKey && event.keyCode == 32) {//插入文本：Ctrl+space
             document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
             setTimeout(1 * 100 );
             document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
        };
    
    

        /*
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

    /* 异步实现多个按钮依次按下
    // 定义一个异步函数
    async function setTime_screenShot() {
      // 等待btn1出现并点击
      await new Promise(resolve => {
        const interval = setInterval(() => {
          const time_btn = document.querySelector('i.bili-note-iconfont.iconicon_flag_L');
          if (time_btn) {
            clearInterval(interval);
            time_btn.click();
            //console.log('按钮1已点击');
            resolve();
          }
        }, 300);
      });
    
      // 等待100毫秒
      await new Promise(resolve => setTimeout(resolve, 100));
    
      // 等待确认按钮出现并点击
      await new Promise(resolve => {
        const interval = setInterval(() => {
          const btn = document.querySelector('div.dialog-btn.tag-dialog__btn--confirm:nth-child(2)');
          if (btn) {
            clearInterval(interval);
            btn.click();
            //console.log('按钮2已点击');
            resolve();
          }
        }, 100);
      });
    
      // 等待100毫秒
      await new Promise(resolve => setTimeout(resolve, 100));
    
      // 点击截图按钮
      const screen_btn = document.querySelector('i.bili-note-iconfont.iconcapture-app');
      await screen_btn.click();
      //console.log('按钮3已点击');

      // 拉到文末
      await new Promise(resolve => setTimeout(resolve, 100));
      document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();
      await new Promise(resolve => setTimeout(resolve, 100));
      document.querySelector("i.icon.bili-note-iconfont.iconiconfont_icon_unordered").click();

    }
    */

})();


