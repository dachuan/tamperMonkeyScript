// ==UserScript==
// @name         📘微信读书阅读助手
// @namespace   https://github.com/mefengl
// @version      0.1
// @description  简化版本微信读书助手
// @author       by dachuan mocking from mefengl
// @match        https://weread.qq.com/*
// @require      https://cdn.staticfile.org/jquery/3.6.1/jquery.min.js
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @run-at       document-end
// @license MIT
// ==/UserScript==


(function () {
  ("use strict");

    console.log('!hello from tamperMonkey.');

  // 书城运行脚本闪烁严重，直接跳过
  if (location.pathname.includes("category")) return;

  // 功能1️⃣：宽屏
  $(function () {
    $(".app_content").css("maxWidth", 900); //1000
    $(".readerTopBar").css("display", "flex");
  });

  // 功能2️⃣：自动隐藏顶栏和侧边栏，上划显示，下滑隐藏
  let windowTop = 0;
  $(window).scroll(() => {
    const scrollS = $(this).scrollTop();
    if (scrollS >= windowTop + 100) {
      // 下滑隐藏
      $(".readerTopBar, .readerControls").fadeOut();
      windowTop = scrollS;
    }
    else if (scrollS < windowTop) {
      // 上划显示
      $(".readerTopBar, .readerControls").fadeIn();
      windowTop = scrollS;
    }
  });

    // 功能4️⃣：简化划线菜单，包括想法页面
    document.addEventListener('mouseup', (event) => {
    
      let toolbarContainer = document.querySelector(".reader_toolbar_container");
    
      function delayAction(){
        if(toolbarContainer && toolbarContainer.style.display !== 'none') {
            //console.log('Toolbar container is visible');  
            toolbarContainer.hidden = false;
    
            // 去除划线颜色选择框
            $(".reader_toolbar_color_container").remove();
            // 去除划线工具栏多余的按钮
            $(".underlineBg, .underlineHandWrite, .query").remove();
            // 在这里完成简化想法页面的功能
            $("#readerReviewDetailPanel").css("padding-top", "12px");
            $("#readerReviewDetailPanel .title").remove();
            // 如果找到了有删除划线的按钮，就隐藏有直线划线的按钮，否则显示（因为之前隐藏了）
            if($(".removeUnderline").length){
               $(".underlineStraight").hide()
            }
            else{
              $(".underlineStraight").show();
              setTimeout(autoline, 10);
            }
            // 自动点击划线
            function autoline(){
                $(".underlineStraight").trigger("click");
                toolbarContainer.hidden = true;
            }
        }
      }
      setTimeout(delayAction, 10);
    });

})();
