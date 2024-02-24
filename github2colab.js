// ==UserScript==
// @name         Github to Colab
// @namespace    dcthe
// @version      0.1
// @description  Add a button to jump to Colab from Github
// @author       You
// @match        https://github.com/*/*.ipynb
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the page to load
    window.addEventListener('load', function() {
        // Find the "Copy path" button
        // 注意：这里会找到两个，第一个貌似显示在窄屏情况
        var copyPathButton = document.querySelectorAll('[data-testid="breadcrumb-copy-path-button"]')[1];
        //console.log(copyPathButton);

        // Create the "Jump to Colab" button
        var colabButton = document.createElement('button');
        colabButton.innerHTML = 'Jump to Colab';
        colabButton.style.marginLeft = '8px';

        // Add an event listener to the "Jump to Colab" button
        colabButton.addEventListener('click', function() {
            // Get the current URL
            var currentURL = window.location.href;

            // Replace "github" with "githubtocolab" in the URL
            var newURL = currentURL.replace('github', 'githubtocolab');

            // Redirect to the new URL
            window.location.href = newURL;
        });

        // Insert the "Jump to Colab" button after the "Copy path" button
        copyPathButton.parentNode.insertBefore(colabButton, copyPathButton.nextSibling);
    });
})();
