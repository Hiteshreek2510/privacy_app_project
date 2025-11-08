// Listen for file input changes
document.addEventListener('change', function (event) {
  const target = event.target;

  // Check if it's a file input and contains an image
  if (target.tagName === 'INPUT' && target.type === 'file') {
    const file = target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Send message to background or popup
      chrome.runtime.sendMessage({
        type: 'IMAGE_SELECTED',
        filename: file.name
      });
    }
  }
});
