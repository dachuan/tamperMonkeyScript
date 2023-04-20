// ==UserScript==
// @name         Floating sidebar
// @namespace    http://tampermonkey.net/
// @version      0.0.9
// @description  select text and send to sidebar 
// @author       dcthehiker
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a floating sidebar
    var sidebar = document.createElement('div');
    sidebar.style.position = 'fixed';
    sidebar.style.top = '50%';
    sidebar.style.right = '0';
    sidebar.style.transform = 'translateY(-50%)';
    sidebar.style.backgroundColor = '#ffffff';
    sidebar.style.padding = '0px 0px 0px 10px';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.boxShadow = '2px 2px 4px #ccc';
    //sidebar.style.maxWidth = '300px'; // Add maximum width to the sidebar
    sidebar.style.width = '400px'; // Set fixed width
    sidebar.style.maxHeight = '300px'; // Add maximum height to the sidebar
    sidebar.style.overflowY = 'auto'; // Add scrollbar to the sidebar
    sidebar.style.wordWrap = 'break-word'; // Allow text to wrap to next line
    sidebar.style.zIndex = '9999';
    sidebar.style.fontFamily = 'Arial, sans-serif';
    sidebar.style.fontSize = '12px';

    // Create a title for the sidebar
    var title = document.createElement('h4');
    title.textContent = 'My Highlights';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    title.style.fontSize = '14px';
    title.style.color = '#fff';
    title.style.backgroundColor = '#42bbf4';
    title.style.fontWeight = 'bold';

    // Make the title fixed at the top of the sidebar
    var titleContainer = document.createElement('div');
    titleContainer.appendChild(title);
    titleContainer.style.position = 'sticky';
    titleContainer.style.top = '0';
    sidebar.appendChild(titleContainer);

    // Create a button to copy all sidebar items to clipboard
    var copyAllButton = document.createElement('button');
    copyAllButton.textContent = 'copy all';
    copyAllButton.style.position = 'sticky';
    copyAllButton.style.top = '24px';
    //copyAllButton.style.bottom = '10px';
    //copyAllButton.style.right = '10px';
    copyAllButton.addEventListener('click', function(event) {
        var sidebarText = '';
        var sidebarItems = sidebar.querySelectorAll('li');
        for (var i = 0; i < sidebarItems.length; i++) {
            sidebarText += sidebarItems[i].textContent + '\n';
        }
        navigator.clipboard.writeText(sidebarText);
    });
    sidebar.appendChild(copyAllButton);

    document.body.appendChild(sidebar);

    // Define Diigo style for list items
    var listItemStyle = 'list-style-type: none;' +
                         'padding: 10px 5px;' +
                         'margin: 10px 0;' +
                         'border-left: 3px solid #feb92c;' +
                         'background-color: #F5F5F5;' +
                         'box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);' +
                         'font-weight: normal;' +
                         'color: #333;';

    // Keep track of selected text to avoid duplicates
    var selectedText = [];

    // Listen for selection events on the page
    document.addEventListener('mouseup', function(event) {
        var selection = window.getSelection().toString().trim();
        var target = event.target;
        if (selection.length > 0 && !selectedText.includes(selection) && !sidebar.contains(target)) {

            // Create a list item for the selected text with Diigo style
            var listItem = document.createElement('li');
            listItem.setAttribute('style', listItemStyle);
            listItem.textContent = selection;

            // set opacity to 0
            listItem.style.opacity = 0;

            // Add the list item to the sidebar
            sidebar.appendChild(listItem);

            // Animate adding text to the sidebar
            var opacity = 0;
            var interval = setInterval(function(){
                opacity += 0.1;
                listItem.style.opacity = opacity;
                if(opacity >= 1){
                    clearInterval(interval);
                }
            }, 50);

            // Add the selected text to the array to avoid duplicates
            selectedText.push(selection);
        }
    });

})();
