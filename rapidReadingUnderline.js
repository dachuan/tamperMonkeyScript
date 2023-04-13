// ==UserScript==
// @name         underliner for rapid reading
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  red underline to induce eye-movement
// @author       dcthe
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    // setting
    const pace = 10;                // how many texts underlined 
    const delay = 300;              // time delayed 
    const line_color = 'red';       // underline color
    const frame_color = '#55c8d7';  // selected frame color

    // underline the text nodes
    // --------------------
    function findTextNodes(element) {
        let textNodes = [];
        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                textNodes.push(child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                textNodes.push(...findTextNodes(child));
            }
        }
        return textNodes;
    }

    async function animateUnderline(textNode) {
        const text = textNode.textContent;
        const parent = textNode.parentElement;

        const wrapper = document.createElement('span');
        parent.replaceChild(wrapper, textNode);

        const range = pace;
        for (let i = 0; i < text.length; i += range) {
            const before = document.createElement('span');
            before.textContent = text.slice(0, i);
            wrapper.appendChild(before);

            const underline = document.createElement('span');
            underline.textContent = text.slice(i, i + range);
            underline.style.textDecoration = 'underline';
            underline.style.textDecorationColor = line_color;
            wrapper.appendChild(underline);

            const after = document.createElement('span');
            after.textContent = text.slice(i + range);
            wrapper.appendChild(after);

            await new Promise(r => setTimeout(r, delay));

            wrapper.innerHTML = '';
        }

        parent.replaceChild(textNode, wrapper);
    }

    async function processAllTextNodes(dom_js) {
        const textNodes = findTextNodes(dom_js);
        for (const textNode of textNodes) {
            await animateUnderline(textNode);
        }
    }

    // inspect dom
    // do underline when click
    // --------------------

    let onProcessing = false; //check if is on the running

    function highlightElement(element) {
      element.style.outline = `1px solid ${frame_color}`;
      //element.style.outline = '1px solid navy';
    }
  
    function removeHighlight(element) {
      element.style.outline = '';
    }
  
    document.addEventListener('mouseover', event => {
      const element = event.target;
      if(!onProcessing){
        highlightElement(element);
      }
    });
  
    document.addEventListener('mouseout', event => {
      const element = event.target;
      if(!onProcessing){
        removeHighlight(element);
      }
    });
  

    document.addEventListener('click', event => {
      const element = event.target;
      onProcessing = true;
      processAllTextNodes(element).then(result => {
        onProcessing = false;
        removeHighlight(element);
      });
    });
  
  
  
})();
