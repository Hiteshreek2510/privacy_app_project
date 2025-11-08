// Utility: Send image info to background
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

// Scan existing file inputs on page load
function attachListenersToFileInputs() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', event => {
      const file = event.target.files[0];
      notifyImageSelected(file);
    });
  });
}

// Global listener for dynamically added inputs
document.addEventListener('change', event => {
  const target = event.target;
  if (target.tagName === 'INPUT' && target.type === 'file') {
    const file = target.files[0];
    notifyImageSelected(file);
  }
});

// Initialize
attachListenersToFileInputs();
