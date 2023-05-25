// ==UserScript==
// @name         Excalidraw in browser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add Excalidraw to any website
// @match        *://*/*
// @grant        none
// @require      https://unpkg.com/react@18.2.0/umd/react.development.js
// @require      https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js
// @require      https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.development.js
// ==/UserScript==

(function () {
  'use strict';

  const createExcalidrawButton = () => {
    const button = document.createElement('button');
    button.innerHTML = 'Excalidraw';
    button.style.position = 'fixed';
    button.style.right = '20px';
    button.style.bottom = '20px';
    button.style.zIndex = 9999;
    button.onclick = () => {
      createExcalidrawOverlay();
    };
    document.body.appendChild(button);
  };

  const createExcalidrawOverlay = () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.top = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = 10000;
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    document.body.appendChild(overlay);

    const excalidrawContainer = document.createElement('div');
    excalidrawContainer.style.width = '80%';
    excalidrawContainer.style.height = '80%';
    excalidrawContainer.style.margin = '5% auto';
    excalidrawContainer.style.backgroundColor = 'white';
    overlay.appendChild(excalidrawContainer);

    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '20px';
    closeButton.style.top = '20px';
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
    };
    overlay.appendChild(closeButton);

    loadExcalidraw(excalidrawContainer);
  };

  const loadExcalidraw = (container) => {
    const App = () => {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          {
            style: { height: '100%', width: '100%' },
          },
          React.createElement(ExcalidrawLib.Excalidraw),
        ),
      );
    };

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App));
  };

  createExcalidrawButton();
})();
