function notifyImageSelected(file) {
  if (!file || !file.type.startsWith('image/')) return;

  try {
    chrome.runtime.sendMessage({
      type: 'IMAGE_SELECTED',
      filename: file.name
    });
  } catch (err) {
    console.warn('Failed to send message:', err.message);
  }
}

function attachListenersToFileInputs() {
  const inputs = document.querySelectorAll('input[type="file"]');
  inputs.forEach(input => {
    if (!input._privacyAttached) {
      input.addEventListener('change', event => {
        notifyImageSelected(event.target.files[0]);
      });
      input._privacyAttached = true;
    }
  });
}

function observeNewInputs() {
  const observer = new MutationObserver(() => {
    attachListenersToFileInputs();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('change', event => {
  const target = event.target;
  if (target.tagName === 'INPUT' && target.type === 'file') {
    notifyImageSelected(target.files[0]);
  }
});

attachListenersToFileInputs();
observeNewInputs();
