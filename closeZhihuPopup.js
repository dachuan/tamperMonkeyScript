// ==UserScript==
// @name         Close Zhihu Pop-up
// @namespace    http://tampermonkey.net/
// @version      0.21
// @description  Automatically close pop-up windows on a specific webpage.
// @match        https://www.zhihu.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Define a function to close the pop-up windows
    function closePopups() {
        // Get all the pop-up windows on the webpage
        var popups = document.querySelectorAll('.css-ysn1om,.css-1ynzxqw');

        // Close each pop-up window
        for (var i = 0; i < popups.length; i++) {
            popups[i].style.display = 'none';
        }
    }

    // Call the closePopups function immediately
    closePopups();

    // Watch for changes to the DOM tree and close any pop-up windows that appear
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if any new pop-up windows have been added to the DOM
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                var popups = document.querySelectorAll('.css-ysn1om,.css-1ynzxqw');
                for (var i = 0; i < popups.length; i++) {
                    popups[i].style.display = 'none';
                }
            }
        });
    });

    // Start watching for changes to the DOM tree
    observer.observe(document.body, { childList: true, subtree: true });
})();

