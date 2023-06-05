/*
 *  2023/6/5 下午2:34
 *  ------------------------------
 *  增加焦点在outliner之外的创建item方法
 *
 * 2023/6/4 下午12:34
 * 大纲编辑器
 * todo: 折叠子级
 * */

function outliner() {
    console.log('from module.');

    // Track the Shift key state
    let shiftKeyPressed = false;

    // Add keydown event listener to track Shift key state
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            shiftKeyPressed = true;
        }
    });

    // Add keyup event listener to track Shift key state
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            shiftKeyPressed = false;
        }
    });

    // Create the outline editor container
    const editorContainer = document.createElement('div');

    // Create the outline editor
    const outlineEditor = document.createElement('ul');
    outlineEditor.contentEditable = 'true';
    outlineEditor.style.margin = '10px';
    outlineEditor.style.height = 'calc(100% - 20px)';
    outlineEditor.style.overflow = 'auto';
    outlineEditor.style.paddingLeft = '0px'; // Remove padding for the main list

    // Add an empty list item when the editor is focused
    outlineEditor.addEventListener('focus', () => {
        if (outlineEditor.children.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = '\u200B'; // Zero-width space
            outlineEditor.appendChild(emptyItem);
        }
    });

    // Add a lastActiveNode property to the outlineEditor element
    outlineEditor.lastActiveNode = null;


    // Add a createNewItem method to the outlineEditor element
    outlineEditor.createNewItem = function (itemText) {
        const sel = window.getSelection();

        // 如果outlineEditor不在focus
        // 则取lastActiveNode
        const liNode = document.activeElement === outlineEditor ? getClosestLiElement(sel.getRangeAt(0).startContainer) : outlineEditor.lastActiveNode;

        if (liNode && liNode.tagName === 'LI') {
            const newItem = document.createElement('li');
            newItem.textContent = '\u200B' + itemText; // Zero-width space
            liNode.parentNode.insertBefore(newItem, liNode.nextSibling);
            const newRange = document.createRange();
            newRange.setStart(newItem.firstChild, 1);
            newRange.setEnd(newItem.firstChild, 1);
            sel.removeAllRanges();
            sel.addRange(newRange);
            outlineEditor.lastActiveNode = newItem; // 更新lastActiveNode
        }
    };

    // 获得所有的文本
    function processItems(items, indentLevel = 0) {
        console.log('do process');
        let result = '';
      
        items.forEach((item) => {
            console.log(item);
          // 添加当前层级的制表符
          const indent = '\t'.repeat(indentLevel);
      
          // 获取当前 li 元素的直接文本内容，排除子级元素的文本
          const itemText = Array.from(item.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');


            
          // 拼接文本和缩进
          result += `${indent}${itemText}\n`;

            console.log('indent', indentLevel);
            console.log('text', itemText);
      
          // 处理子级 li 元素，缩进层级加 1
          const childItems = Array.from(item.children).filter(child => child.tagName === 'UL');
          if (childItems.length > 0) {
            result += processItems(Array.from(childItems[0].children), indentLevel + 1);
          }
        });
      
        return result;
    }

    outlineEditor.exportAllItems = function() {

        //console.log('do export');

        //const topLevelItems = outlineEditor.querySelectorAll('ul > li');
        //const topLevelItems = outlineEditor.querySelectorAll(':scope > ul > li');
        const topLevelItems = editorContainer.querySelectorAll(':scope > ul > li');
        const itemsText = processItems(topLevelItems);
        
        //// 获取所有的 li 元素
        //const items = outlineEditor.querySelectorAll('li');
        //let itemsText = '';
      
        //items.forEach((item) => {
        //  // 获取缩进层级
        //  const indentLevel = item.getAttribute('data-indent') || 0;
      
        //  // 为每个层级添加一个制表符
        //  const indent = '\t'.repeat(indentLevel);
      
        //  // 拼接文本和缩进
        //  itemsText += `${indent}${item.textContent}\n`;
        //});

        return itemsText  
    };

    // Add an indent method to the outlineEditor element
    outlineEditor.indent = function (currentNode, sel, range) {
        if (currentNode.tagName === 'LI') {
            const previousItem = currentNode.previousElementSibling;
            if (previousItem) {
                const nestedList = previousItem.querySelector('ul') || document.createElement('ul');
                previousItem.appendChild(nestedList);
                nestedList.appendChild(currentNode);
                const newRange = document.createRange();

                newRange.setStart(currentNode.firstChild, 1);
                newRange.setEnd(currentNode.firstChild, 1);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }
    };

    // Add an outdent method to the outlineEditor element
    outlineEditor.outdent = function (currentNode, sel, range) {
        if (currentNode.tagName === 'LI') {
            const parentList = currentNode.parentNode;
            if (parentList !== outlineEditor) {
                const grandParentList = parentList.parentNode;
                grandParentList.parentNode.insertBefore(currentNode, parentList.nextSibling);
                if (parentList.children.length === 0) {
                    grandParentList.removeChild(parentList);
                }
                const newRange = document.createRange();
                newRange.setStart(currentNode.firstChild, range.startOffset);
                newRange.setEnd(currentNode.firstChild, range.endOffset);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }
    };

    // Add fold method to the outlineEditor element
    outlineEditor.fold = function (currentNode) {
        if (currentNode.tagName === 'LI') {
            const nestedList = currentNode.querySelector('ul');
            if (nestedList) {
                nestedList.style.display = 'none';
                const textNode = currentNode.firstChild;
                if (textNode.nodeType === Node.TEXT_NODE) {
                    textNode.textContent = '...' + textNode.textContent;
                }
            }
        }
    };

    // Add unfold method to the outlineEditor element
    outlineEditor.unfold = function (currentNode) {
        if (currentNode.tagName === 'LI') {
            const nestedList = currentNode.querySelector('ul');
            if (nestedList) {
                nestedList.style.display = 'block';
                const textNode = currentNode.firstChild;
                if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent.startsWith('...')) {
                    textNode.textContent = textNode.textContent.substring(3);
                }
            }
        }
    };

    // Check if is chinese input ongoing
    let isComposing = false;
    function checkChineseInput(inputDom) {

        inputDom.addEventListener('compositionstart', function () {
            isComposing = true;
        });

        inputDom.addEventListener('compositionend', function () {
            isComposing = false;
        });
    }
    checkChineseInput(editorContainer);

    // Add a dblclick event listener to toggle fold and unfold
    outlineEditor.addEventListener('dblclick', (e) => {
        const currentNode = e.target;
        if (currentNode.tagName === 'LI') {
            const nestedList = currentNode.querySelector('ul');
            if (nestedList && nestedList.style.display !== 'none') {
                outlineEditor.fold(currentNode);
            } else {
                outlineEditor.unfold(currentNode);
            }
        }
    });

    // Get the closest 'li' element from the given node
    function getClosestLiElement(node) {
        while (node && node.tagName !== 'LI') {
            node = node.parentElement;
        }
        return node;
    }


    //------------------------------
    // 对于outlineEditor的一些事件侦听
    //------------------------------

    // Handle keyboard events for indent, outdent, and new items
    outlineEditor.addEventListener('keydown', (e) => {
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const currentNode = range.startContainer.parentNode;

        if (e.key === 'Tab') {
            e.preventDefault();
            if (shiftKeyPressed) { // Outdent when Shift key is pressed
                outlineEditor.outdent(currentNode, sel, range);
            } else { // Indent when Shift key is not pressed
                outlineEditor.indent(currentNode, sel, range);
            }
        } else if (e.key === 'Enter' && !isComposing) { // Add a new list item on Enter key press
            // isComposing is a tag to check if chinese input is going
            e.preventDefault();
            outlineEditor.createNewItem("");
        }
    });

    // Modify keydown event listener to use Selection API
    outlineEditor.addEventListener('keydown', (e) => {
        if (e.key === 'z' && e.ctrlKey) {
            e.preventDefault();
            const selection = window.getSelection();
            const currentNode = getClosestLiElement(selection.anchorNode);
            if (currentNode && currentNode.tagName === 'LI') {
                const nestedList = currentNode.querySelector('ul');
                if (nestedList && nestedList.style.display !== 'none') {
                    outlineEditor.fold(currentNode);
                } else {
                    outlineEditor.unfold(currentNode);
                }
            }
        }
    });

    // Add a blur event listener to outlineEditor to store the last active li node
    outlineEditor.addEventListener('blur', (e) => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const currentNode = selection.getRangeAt(0).startContainer;
            outlineEditor.lastActiveNode = getClosestLiElement(currentNode);
        }
    });

    // Append the outline editor to the container
    editorContainer.appendChild(outlineEditor);

    // Add the outlineEditor element as a property of the editorContainer element
    editorContainer.outlineEditor = outlineEditor;

    // Apply the 2-space indent to all nested lists
    const nestedListStyle = document.createElement('style');
    nestedListStyle.innerHTML = `
      ul ul {
        padding-left: 1ch;
      }
      ul {
        list-style-position: inside; // Adjust the position of li::marker to inside
      }
      li {
        padding-left: 1px; // Add left padding to display the input cursor
      }
    `;
    document.head.appendChild(nestedListStyle);

    return editorContainer;
}

