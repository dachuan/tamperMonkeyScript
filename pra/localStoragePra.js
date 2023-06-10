// ==UserScript==
// @name         Save and Restore Page Changes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Save and restore page changes using localStorage
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

/*
 * 设置localStorage
 * localStorage.getItem('tampermonkeyPageChanges')
 * localStorage.setItem('tampermonkeyPageChanges', 'true');
 * localStorage.setItem('tampermonkeyPageData', JSON.stringify(data));
 * */

    //------------------------------
    //方法二：存储json数据
    //------------------------------
    /*
     * 这个方法需要自己构建数据结构
     * 保存json数据
     * 读取json数据之后，
     * 再转化成页面数据
     * */

(function() {
    'use strict';

    // Function to apply the changes to the page
    function applyChanges(data) {
        // Change the background color
        document.body.style.backgroundColor = data.backgroundColor;

        // Add custom data to the page
        const customData = document.createElement('div');
        customData.id = 'customData';
        customData.innerText = data.customText;
        document.body.prepend(customData);
    }

    // Check if the localStorage key exists
    const savedData = localStorage.getItem('tampermonkeyPageData');
    if (savedData) {
        // If the key exists, parse the JSON string and apply the changes to the page
        const parsedData = JSON.parse(savedData);
        applyChanges(parsedData);
    } else {
        // If the key does not exist, listen for a specific event (e.g., double-click) to apply the changes
        document.body.addEventListener('dblclick', () => {
            // Define the data to be saved
            const data = {
                backgroundColor: 'lightblue',
                customText: 'This is custom data added by the Tampermonkey script.'
            };

            // Apply the changes
            applyChanges(data);

            // Save the data to localStorage as a JSON string
            localStorage.setItem('tampermonkeyPageData', JSON.stringify(data));
        });
    }
})();
    //------------------------------
    //方法一：存储标志位
    //------------------------------
    /*
     *通过localStorage.setItem 来设置一个存储id，
     再次打开url的时候，
     通过localStorage.getItem来读取这个存储id，
     看是否有保存。
     如果有保存数据，那么就再次执行页面的改变。
     这个保存下来的不是实际数据，而是一个判别符号，
     如果符合，
     那么数据并不是读取
     而是重头再次生成
     * 
     * */
/*
(function() {
    'use strict';

    // Function to apply the changes to the page
    function applyChanges() {
        // Change the background color
        document.body.style.backgroundColor = 'lightblue';

        // Add custom data to the page
        const customData = document.createElement('div');
        customData.id = 'customData';
        customData.innerText = 'This is custom data added by the Tampermonkey script.';
        document.body.prepend(customData);
    }

    // Check if the localStorage key exists
    if (localStorage.getItem('tampermonkeyPageChanges') === 'true') {
        // If the key exists, apply the changes to the page
        applyChanges();
    } else {
        // If the key does not exist, listen for a specific event (e.g., double-click) to apply the changes
        document.body.addEventListener('dblclick', () => {
            // Apply the changes
            applyChanges();

            // Save the state to localStorage
            localStorage.setItem('tampermonkeyPageChanges', 'true');
        });
    }
})();
*/
