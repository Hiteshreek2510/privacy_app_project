// Scan for file inputs on page load
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
  input.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      chrome.runtime.sendMessage({
        type: 'IMAGE_SELECTED',
        filename: file.name
      });
    }
  });
});

// Also listen globally for dynamically added inputs
document.addEventListener('change', function (event) {
  const target = event.target;
  if (target.tagName === 'INPUT' && target.type === 'file') {
    const file = target.files[0];
    if (file && file.type.startsWith('image/')) {
      chrome.runtime.sendMessage({
        type: 'IMAGE_SELECTED',
        filename: file.name
      });
    }
  }
});
