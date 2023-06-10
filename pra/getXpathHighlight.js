// ==UserScript==
// @name         Save and Restore Highlighted Text
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Save and restore highlighted text using localStorage and XPath
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

/* search for parent
 * works
 * 但是不能出现高亮之间嵌套
 * 改进了：监听整个document中的dom变化，进行save
 * 增加：outliner数据
 * */
(function () {
  'use strict';
    console.log('storage pra');

  const savedHighlightData = localStorage.getItem('tampermonkeyHighlightedText');
  const savedDivData = localStorage.getItem('tampermonkeyDivContent');
  //console.log(savedHighlightData);
  //console.log(savedDivData);

  function applyAllData() {

    // 读取，并重新高亮
    if (savedHighlightData) {
        //console.log('apply all highlighted.');
        const parsedData = JSON.parse(savedHighlightData);
        parsedData.forEach((entry) => {
          applyHighlight(entry);
        });
    }

    // 读取，并重新形成outliner
    if (savedDivData) {

        const divElement = document.querySelector(".outliner-container");
        //console.log(divElement);

        if (divElement) {
          divElement.innerHTML = savedDivData;
          //console.log('apply outliner.');
        }
    }
  }

  // Wait for the window to load before querying the div
  document.addEventListener('keydown', (e) => {
              //applyAllData();
          if (e.key === "Escape") {
              e.preventDefault();
              //console.log('loading data');
              applyAllData();
          }
  });
  //window.addEventListener('load', applyDivData);

  function getXPath(element) {
      if (element.id !== '') {
        return 'id("' + element.id + '")';
      }
      if (element === document.body) {
        return element.tagName.toLowerCase();
      }

      let siblingIndex = 1;
      let sibling = element;
      while ((sibling = sibling.previousElementSibling)) {
        siblingIndex++;
      }

      return (
        getXPath(element.parentNode) +
        '/' +
        element.tagName.toLowerCase() +
        '[' +
        siblingIndex +
        ']'
      );
  }

  function applyHighlight(entry) {
      const parent = document.evaluate(
        entry.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (!parent) return;

      const textNodeIndex = Array.from(parent.childNodes).findIndex(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.includes(entry.text)
      );
      if (textNodeIndex === -1) return;

      const textNode = parent.childNodes[textNodeIndex];
      const highlightedSpan = document.createElement('span');
      highlightedSpan.className = 'highlighted';
      highlightedSpan.style.backgroundColor = 'yellow';
      highlightedSpan.textContent = entry.text;
      highlightedSpan.dataset.index = entry.dataset_index;

      const text = textNode.textContent;
      const textBefore = text.substring(0, text.indexOf(entry.text));
      const textAfter = text.substring(textBefore.length + entry.text.length);

      if (textBefore) {
        parent.insertBefore(document.createTextNode(textBefore), textNode);
      }
      parent.insertBefore(highlightedSpan, textNode);
      if (textAfter) {
        parent.insertBefore(document.createTextNode(textAfter), textNode);
      }
      parent.removeChild(textNode);
  }

  function saveAllAnnotations() {
      const highlightedSpans = document.querySelectorAll('.highlighted');
      const data = Array.from(highlightedSpans).map((span) => {
        return {
          xpath: getXPath(span.parentNode),
          text: span.textContent,
          dataset_index: span.dataset.index
        };
      });
      localStorage.setItem('tampermonkeyHighlightedText', JSON.stringify(data));
      //console.log('highlighted saved.');

      //const divXPath = '//*[@id="activity-detail"]/div[8]/div[2]';
      //const divElement = document.evaluate(
      //  divXPath,
      //  document,
      //  null,
      //  XPathResult.FIRST_ORDERED_NODE_TYPE,
      //  null
      //).singleNodeValue;

      const divElement = document.querySelector(".outliner-container");
      if (divElement) {
        localStorage.setItem('tampermonkeyDivContent', divElement.innerHTML);
        //console.log('outliner saved');
      }
  }

  // Create a MutationObserver to listen for DOM changes
  const observer = new MutationObserver((mutations) => {
     saveAllAnnotations()
  });

  // Start observing the document for changes
  observer.observe(document, { childList: true, subtree: true });

})();
