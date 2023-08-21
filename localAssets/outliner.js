/*
 *  2023/8/21 下午9:41
 *  ------------------------------
 *  设置ctr+shift+d，cut
 *  设置ctr+shift+p，paste
 *
 *  2023/8/21 下午5:33
 *  ------------------------------
 *  outdent 修改成正确的层级关系
 *
 *  2023/6/19 下午8:52
 *  ------------------------------
 *  暂时屏蔽双击折叠功能
 *
 *  2023/6/15 下午9:09
 *  ------------------------------
 *  新增加item，滚动到最后
 *
 *  2023/6/12 上午11:08
 *  ------------------------------
 *  调整了outline的数据重置方法
 *  目前可以正确还原层级结构
 *
 *  2023/6/11 下午1:31
 *  ------------------------------
 *  调整了indent的计算方法
 *  调整了item的text获取方法
 *  目前存储数据正确了
 *
 *  2023/6/9 下午3:30
 *  ------------------------------
 *  调整storageKey，使得不同页面保存不同数据
 *  避免出现相同域名的数据不独立
 *
 *  2023/6/8 下午9:40
 *  ------------------------------
 *  增加数据存储到local storage的方法
 *  增加数据重置outliner的方法
 *
 *  2023/6/8 下午12:37
 *  ------------------------------
 *  调整on blur时的lastActiveNode
 *  设置为outliner最后一个直接的子级li
 *
 *  新的appendNewItem方法
 *  只对外部使用，避免选取的问题
 *
 *  2023/6/6 上午11:47
 *  ------------------------------
 *  调整createItem的传入参数
 *
 *  2023/6/5 下午2:34
 *  ------------------------------
 *  增加焦点在outliner之外的创建item方法
 *
 * 2023/6/4 下午12:34
 * 大纲编辑器
 * todo: 折叠子级
 * */

function outliner() {
    console.log('restore outliner');

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
    editorContainer.classList.add('outliner-container');

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
    // to be used in outliner edit inside
    // 此处代码有冗余，todo
    outlineEditor.createNewItem = function (itemText, itemClass='inner-item', itemDataSetIndex=Date.now()) {
        const sel = window.getSelection();

        // 如果outlineEditor不在focus
        // 则取lastActiveNode
        //console.log("1 last active node is: ",outlineEditor.lastActiveNode);

        const liNode = document.activeElement === outlineEditor ? getClosestLiElement(sel.getRangeAt(0).startContainer) : outlineEditor.lastActiveNode;


        if (liNode && liNode.tagName === 'LI') {
            const newItem = document.createElement('li');

            newItem.textContent = '\u200B' + itemText; // Zero-width space
            newItem.classList.add(itemClass);
            newItem.dataset.index = itemDataSetIndex;

            liNode.parentNode.insertBefore(newItem, liNode.nextSibling);
            const newRange = document.createRange();
            newRange.setStart(newItem.firstChild, 1);
            newRange.setEnd(newItem.firstChild, 1);
            sel.removeAllRanges();
            sel.addRange(newRange);
            outlineEditor.lastActiveNode = newItem; // 更新lastActiveNode
            //console.log("2 last active node is: ",outlineEditor.lastActiveNode);
            //滚动到最后
            outlineEditor.scrollTop = outlineEditor.scrollHeight;
        }
    };

    // append newItem method to the outlineEditor element
    // to be used outside 
    outlineEditor.appendNewItem = function (itemText, itemClass='snippet', itemDataSetIndex) {
        outlineEditor.setLastActiveNode();
        const liNode = outlineEditor.lastActiveNode;
        //console.log("li node in outliner is: ",liNode);

        if (liNode && liNode.tagName === 'LI') {
            const newItem = document.createElement('li');

            newItem.textContent = '\u200B' + itemText; // Zero-width space
            newItem.classList.add(itemClass);
            newItem.dataset.index = itemDataSetIndex;

            liNode.parentNode.insertBefore(newItem, liNode.nextSibling);
            outlineEditor.lastActiveNode = newItem; // 更新lastActiveNode
            //滚动到最后
            outlineEditor.scrollTop = outlineEditor.scrollHeight;
        }
    };

    // 保存item数据
    outlineEditor.saveData = function () {
        const items = Array.from(editorContainer.querySelectorAll('li'));
        items.shift(); // 去除第一个start time item
        const data = [];

        const calculateIndentLevel = function (item) {
            let level = 0;
            while (item.parentElement && item.parentElement.tagName === 'UL' && item.parentElement !== editorContainer.querySelector('ul')) {
                item = item.parentElement.parentElement;
                level++;
            }
            return level;
        };

        items.forEach((item) => {
            const itemData = {
                // 获取当前 li 元素的直接文本内容，排除子级元素的文本
                text: Array.from(item.childNodes)
                  .filter(node => node.nodeType === Node.TEXT_NODE)
                  .map(node => node.textContent.trim())
                  .join(''),
                class: item.className,
                index: item.dataset.index,
                indentLevel: calculateIndentLevel(item),
            };
            //console.log('text is: ', itemData.text);
            //console.log('indent level is: ', itemData.indentLevel);
            data.push(itemData);
        });
    
        // 使用当前页面的 URL 作为存储键
        const storageKey = 'outlinerData_' + window.location.href;
        localStorage.setItem(storageKey, JSON.stringify(data));
    };


    // Add restoreData method to the outlineEditor element
    // 重置数据
     outlineEditor.restoreData = function () {
        //console.log('restore the outliner.');
        const storageKey = 'outlinerData_' + window.location.href;
        const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
        //console.log("loading data: ", data);
        const ulElement = editorContainer.querySelector('ul');
    
        // 保留 startItem
        const startItem = ulElement.querySelector('.starter');
        ulElement.innerHTML = ''; // 清空ul元素
    
        const createNestedUls = function (level) {
            let ul = document.createElement('ul');
            let currentUl = ul;
    
            for (let i = 1; i < level; i++) {
                const nestedUl = document.createElement('ul');
                currentUl.appendChild(nestedUl);
                currentUl = nestedUl;
            }
    
            return ul;
        };
    
        data.forEach((itemData, index) => {
            const newItem = document.createElement('li');
            newItem.textContent = '\u200B' + itemData.text; // Zero-width space
            newItem.classList.add(itemData.class);
            newItem.dataset.index = itemData.index;
    
            let targetUl = ulElement;
    
            if (itemData.indentLevel > 0) {
                const lastItem = data[index - 1] || {};
                const prevItem = ulElement.querySelector(`[data-index="${lastItem.index}"]`);
    
                if (prevItem) {
                    if (itemData.indentLevel === lastItem.indentLevel) {
                        targetUl = prevItem.parentElement;
                    } else if (itemData.indentLevel > lastItem.indentLevel) {
                        const existingUl = prevItem.querySelector('ul');
                        if (existingUl) {
                            targetUl = existingUl;
                        } else {
                            const ulsToCreate = itemData.indentLevel - (lastItem.indentLevel || 0);
                            const nestedUls = createNestedUls(ulsToCreate);
                            prevItem.appendChild(nestedUls);
                            targetUl = nestedUls.querySelector('ul:last-child') || nestedUls;
                        }
                    } else {
                        let parentItem = prevItem;
                        for (let i = 0; i < lastItem.indentLevel - itemData.indentLevel; i++) {
                            parentItem = parentItem.parentElement.parentElement;
                        }
                        targetUl = parentItem.parentElement;
                    }
                }
            }
    
            targetUl.appendChild(newItem);
        });
    
        // 重置 startItem
        if (startItem) {
            const firstItem = ulElement.querySelector('li:first-child');
            if (firstItem) {
                ulElement.insertBefore(startItem, firstItem);
            } else {
                ulElement.appendChild(startItem);
            }
        }
    };   


    // 获得所有的文本
    function processItems(items, indentLevel = 0) {
        let result = '';
      
        items.forEach((item) => {
          // 添加当前层级的制表符
          const indent = '\t'.repeat(indentLevel);
      
          // 获取当前 li 元素的直接文本内容，排除子级元素的文本
          const itemText = Array.from(item.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');
            
          // 拼接文本和缩进
          result += `${indent}${itemText}\n`;
      
          // 处理子级 li 元素，缩进层级加 1
          const childItems = Array.from(item.children).filter(child => child.tagName === 'UL');
          if (childItems.length > 0) {
            result += processItems(Array.from(childItems[0].children), indentLevel + 1);
          }
        });
      
        return result;
    }

    // 单纯文本输出
    // 包含大纲缩进
    outlineEditor.exportAllItems = function() {
        const topLevelItems = editorContainer.querySelectorAll(':scope > ul > li');
        const itemsText = processItems(topLevelItems);
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
                grandParentList.parentNode.insertBefore(currentNode, grandParentList.nextSibling);   // 插入到grandParent的同级而不是parent, parent是ul 
                //grandParentList.parentNode.insertBefore(currentNode, parentList.nextSibling); // 反向outdent有误
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


    // Get the closest 'li' element from the given node
    function getClosestLiElement(node) {
        while (node && node.tagName !== 'LI') {
            node = node.parentElement;
        }
        return node;
    }

    // 设置默认的最后一个active node
    outlineEditor.setLastActiveNode = function(){
        const elements = outlineEditor.querySelectorAll(':scope > li');
        //console.log('from outliner, outlineEditor.querySelectorAll', outlineEditor);
        const lastElement = elements[elements.length - 1];
        outlineEditor.lastActiveNode = lastElement;
        //console.log('from outliner, last node is: ', outlineEditor.lastActiveNode);
    }


    //------------------------------
    // 对于outlineEditor的一些事件侦听
    //------------------------------

    // Add a dblclick event listener to toggle fold and unfold
    // 频率不高，双击另作他用
    /*
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
    });*/

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

    // dd,p for move items
    // Add cut method to the outlineEditor
    let cut_item = {};
    outlineEditor.addEventListener('keydown', (e) => {
        if (e.key === 'D' && e.ctrlKey) {
            e.preventDefault();
            const selection = window.getSelection();
            const currentNode = getClosestLiElement(selection.anchorNode);
            if (currentNode && currentNode.tagName === 'LI') {
                cut_item = currentNode;
                currentNode.parentNode.removeChild(currentNode);
            }
        }
    });

    // Add paste method
    outlineEditor.addEventListener('keydown', (e) => {
        if (e.key === 'P' && e.ctrlKey) {
            e.preventDefault();
            const selection = window.getSelection();
            const currentNode = getClosestLiElement(selection.anchorNode);
            if (currentNode && currentNode.tagName === 'LI') {
                console.log(JSON.stringify(cut_item));
                const parentList = currentNode.parentNode;
                parentList.insertBefore(cut_item, currentNode.nextSibling);
            }
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
    // make the last li in outliner
    outlineEditor.addEventListener('blur', (e) => {
        outlineEditor.setLastActiveNode();
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
2
    return editorContainer;
}

