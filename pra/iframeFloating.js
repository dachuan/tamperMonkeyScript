// ==UserScript==
// @name         Insert HTML as iframe on current page
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Inserts HTML code as an iframe on the current page
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get the HTML code to insert as an iframe
    const _html = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                hello tm script!
            </body>
        </html>`;

    const html = `<!DOCTYPE html>
        <html>
          <head>
            <title>Excalidraw in browser</title>
            <meta charset="UTF-8" />
            <script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>

            <script
          type="text/javascript"
          src="https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.development.js"
        ></script>
          </head>

          <body>
            <div class="container">
              <h1>Excalidraw Embed Example</h1>
              <div id="app"></div>
            </div>
            <script type="text/javascript" src="src/index.js"></script>
            <script>const App = () => {
              return React.createElement(
                  React.Fragment,
                      null,
                          React.createElement(
                                "div",
                                      {
                                              style: { height: "500px" },
                                                    },
                                                          React.createElement(ExcalidrawLib.Excalidraw),
                                                              ),
                                                                );
                                                                };

                                                                const excalidrawWrapper = document.getElementById("app");
                                                                const root = ReactDOM.createRoot(excalidrawWrapper);
                                                                root.render(React.createElement(App));</script>
          </body>
        </html>`;
    // Create a new iframe element
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '999999';
    iframe.srcdoc = html;

    // Append the iframe to the body of the current page
document.body.appendChild(iframe);
})(); 
