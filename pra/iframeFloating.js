// ==UserScript==
// @name         Split Screen Div
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Split screen with two divs and adjustable divider
// @author       GPT-4
// @match        *://*/*
// @grant        none
// ==/UserScript==

/*
 * GPT 实现了双栏分割
 * 拖动分割线调整栏目宽度
 * 抛弃使用iframe
 * 但是跨域加载js，仍旧有问题
 * */


(function() {
    'use strict';

    // Save the original content
    const originalContent = document.documentElement.innerHTML;

    // Clear the current content and set up the container
    document.documentElement.innerHTML = '';
    const container = document.createElement('div');
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    document.documentElement.appendChild(container);

    // Create the left div and set its content
    const leftDiv = createDiv('0', 'calc(50% - 2px)', container);
    leftDiv.innerHTML = originalContent;

    // Create the right div and set its content
    const rightDiv = createDiv('calc(50% + 2px)', 'calc(50% - 2px)', container);
    const excalidrawWrapper = document.createElement('div');
    excalidrawWrapper.style.height = '100%';
    rightDiv.appendChild(excalidrawWrapper);

    // Load Excalidraw
    Promise.all([
        loadScript('https://unpkg.com/react@18.2.0/umd/react.development.js'),
        loadScript('https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js'),
        loadScript('https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.development.js'),
    ]).then(() => {
        const App = () => {
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    {
                        style: { height: '100%' },
                    },
                    React.createElement(ExcalidrawLib.Excalidraw)
                )
            );
        };

        const root = ReactDOM.createRoot(excalidrawWrapper);
        root.render(React.createElement(App));
    });

    // Create the divider
    const divider = document.createElement('div');
    divider.style.width = '4px';
    divider.style.height = '100%';
    divider.style.backgroundColor = '#ccc';
    divider.style.position = 'absolute';
    divider.style.top = '0';
    divider.style.left = 'calc(50% - 2px)';
    divider.style.cursor = 'col-resize';
    container.appendChild(divider);

    // Make the divider draggable
    divider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.documentElement.style.userSelect = 'none';

        const onMouseMove = (e) => {
            const x = e.clientX;
            const width = window.innerWidth;
            const percentage = (x / width) * 100;

            if (percentage < 10 || percentage > 90) {
                return;
            }
            leftDiv.style.width = `calc(${percentage}% - 2px)`;
            divider.style.left = `calc(${percentage}% - 2px)`;
            rightDiv.style.left = `calc(${percentage}% + 2px)`;
            rightDiv.style.width = `calc(${100 - percentage}% - 2px)`;
        };

        const onMouseUp = () => {
            document.documentElement.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function createDiv(left, width, container) {
        const div = document.createElement('div');
        div.style.width = width;
        div.style.height = '100%';
        div.style.overflow = 'auto';
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = left;
        container.appendChild(div);
        return div;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

})();
