function notifyImageSelected(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    chrome.runtime.sendMessage({
      type: 'IMAGE_SELECTED',
      filename: file.name,
      data: reader.result
    });
  };
  reader.readAsDataURL(file);
}


function attachListenersToFileInputs(root = document) {
  const inputs = root.querySelectorAll('input[type="file"]');
  inputs.forEach(input => {
    if (!input._privacyAttached) {
      input.addEventListener('change', event => {
        const file = event.target.files?.[0];
        notifyImageSelected(file);
      });
      input._privacyAttached = true;
    }
  });
}

function observeNewInputs() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches?.('input[type="file"]')) {
            attachListenersToFileInputs(node);
          } else {
            attachListenersToFileInputs(node);
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initial scan and listener setup
attachListenersToFileInputs();
observeNewInputs();
