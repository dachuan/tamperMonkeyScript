// ==UserScript==
// @name         Reading Mode
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A simple reading mode for webpages
// @author       GPT-4
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let previewMode = false;
    let selectMode = false;
    let targetElement = null;
    let selectedElement = null;
    let selectedElementSequence = [];

    const readingModeButton = document.createElement('button');
    readingModeButton.textContent = 'Reading Mode';
    readingModeButton.style.position = 'fixed';
    readingModeButton.style.bottom = '20px';
    readingModeButton.style.right = '20px';
    document.body.appendChild(readingModeButton);


    readingModeButton.addEventListener('click', () => {
        document.addEventListener('mousemove', hoverHandler);
        document.addEventListener('click', clickHandler);
        document.addEventListener('keydown', keydownHandler);
        setTimeout(() => { //delay to make sure the preview is starting
            previewMode = true;
        },300)
    });

    function hoverHandler(event) {
        //console.log(previewMode);
        if(previewMode){
            if(targetElement){
                clearBox(targetElement);
            }

            targetElement = event.target;
            boundBox(targetElement);
        }
    }

    function boundBox(element) {
        // set selectedElement boxed by red color
        element.style.outline = "1px solid red";
    }

    function clearBox(element) {
        // set selectedElement boxed by red color
        element.style.outline = "";
    }

    function clickHandler(event) {
        if (previewMode) {
            previewMode = false;
            selectMode = true;
            selectedElement = event.target;
            selectedElementSequence.push(selectedElement);
            event.preventDefault();
        } 
    }

    function selectUp() {
        if(selectedElement.parentElement){
            clearBox(selectedElement);
            selectedElement = selectedElement.parentElement;
            selectedElementSequence.push(selectedElement);
            boundBox(selectedElement);
        } else{
            console.log("no parent");
        }
    }

    function selectDown() {
        if(selectedElementSequence.length > 1){
            clearBox(selectedElement);
            selectedElement = selectedElementSequence[selectedElementSequence.length - 2];
            selectedElementSequence.pop();
            boundBox(selectedElement);
        } else{
            console.log("at the bottom");
        }
    }

    function keydownHandler(event) {
        if (event.key === 'Escape') {
            //exitReadingMode();
        }
        if (event.key === 'ArrowLeft') {
            if(selectMode){
                selectUp(selectedElement);
            }
        }
        if (event.key === 'ArrowRight') {
            if(selectMode){
                selectDown(selectedElement);
            }
        }
        if (event.key === 'Enter') {
            if(selectMode){
                enterReadingMode();
            }
        }
    }

    function enterReadingMode() {
        previewMode = false;
        selectMode = false;

        document.removeEventListener('mousemove', hoverHandler);
        document.removeEventListener('click', clickHandler);
        document.removeEventListener('keydown', keydownHandler);

        const styleCssText = `
            font-size: 62.5%!important;
            color: #333;
            padding: 0;
            outline: 0;
            display: -webkit-flex;
            flex-flow: column;
            margin: 20px 20%;
            min-width: 400px;
            min-height: 400px;
            text-align: center;
        `;

        document.body.innerHTML = '';
        document.body.appendChild(selectedElement.cloneNode(true));
        document.body.style.cssText = styleCssText;
    }

})();
