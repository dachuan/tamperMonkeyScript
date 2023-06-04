/*
 * 2023/6/4 下午12:34
 * 大纲编辑器
 * todo: 折叠子级
 * */

function outliner() {

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

  // Add a createNewItem method to the outlineEditor element
  outlineEditor.createNewItem = function(itemText) {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const currentNode = range.startContainer.parentNode;
    if (currentNode.tagName === 'LI') {
      const newItem = document.createElement('li');
      newItem.textContent = '\u200B'+itemText; // Zero-width space
      currentNode.parentNode.insertBefore(newItem, currentNode.nextSibling);
      const newRange = document.createRange();
      newRange.setStart(newItem.firstChild, 1);
      newRange.setEnd(newItem.firstChild, 1);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  };

  // Add an indent method to the outlineEditor element
  outlineEditor.indent = function(currentNode, sel, range) {
    if (currentNode.tagName === 'LI') {
      const previousItem = currentNode.previousElementSibling;
      if (previousItem) {
        const nestedList = previousItem.querySelector('ul') || document.createElement('ul');
        previousItem.appendChild(nestedList);
        nestedList.appendChild(currentNode);
        const newRange = document.createRange();

        // Get the length of the previous text node and adjust the offset accordingly
        const previousTextNode = nestedList.previousSibling;
        const previousTextLength = previousTextNode.textContent.length;
        const newOffset = range.startOffset - previousTextLength;

        newRange.setStart(currentNode.firstChild, range.startOffset);
        newRange.setEnd(currentNode.firstChild, range.endOffset);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
  };

  // Add an outdent method to the outlineEditor element
  outlineEditor.outdent = function(currentNode, sel, range) {
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

   // Check if is chinese input ongoing
   let isComposing = false;
   function checkChineseInput(inputDom){

        inputDom.addEventListener('compositionstart', function() {
            //console.log('Input method editor started composing.');
            isComposing = true;
        });
        
        inputDom.addEventListener('compositionend', function() {
            //console.log('Input method editor finished composing.');
            isComposing = false;
        });
   }
  checkChineseInput(editorContainer);

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
