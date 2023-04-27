// ==UserScript==
// @name         Run q_api2d function on button click
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a button to run q_api2d function on click event
// @author       Your Name
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @connect      https://openai.api2d.net
// ==/UserScript==

(function() {
    'use strict';

    // Create the button element
    var runbutton = document.createElement('button');
    runbutton.id = 'run-button';
    runbutton.innerHTML = 'Run';
    runbutton.style.cssText = 'position: fixed; right: 0; top: 0; width: 400px; height: 300px; overflow-y: auto;';

    // Add the button to the page
    document.body.appendChild(runbutton);

    // Add a click event listener to the button
    runbutton.addEventListener('click', function() {
        // Call the q_api2d function with a sample input
        q_api2d('how many days in one week?');
    });

    // Define the q_api2d function
    function q_api2d(q) {
        var xhr = new XMLHttpRequest();
        var url = "https://openai.api2d.net/v1/chat/completions";

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer fk189028-nLqoall7vcbQ65xUXwqa3s7x8mgE9W7D");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response.choices[0].message.content);
            }
        };

        var data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: q }],
        });

        xhr.send(data);
    }
})();
