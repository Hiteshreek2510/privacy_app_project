document.addEventListener('DOMContentLoaded', function () {
  const checkBtn = document.getElementById('checkPrivacy');
  const cancelBtn = document.getElementById('cancel');

  checkBtn.addEventListener('click', async () => {
    // Request the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject script to extract image file from page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractImageAndSend
    });
  });

  cancelBtn.addEventListener('click', () => {
    window.close();
  });
});

// This function runs in the page context
function extractImageAndSend() {
  const input = document.querySelector('input[type="file"]');
  if (input && input.files.length > 0) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function () {
      const base64Image = reader.result;

      // Send to backend API
      fetch('https://your-backend-url.com/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      })
        .then(res => res.json())
        .then(data => {
          alert(`Privacy Score: ${data.score}\nRisk Level: ${data.risk_level}`);
        })
        .catch(err => {
          alert('Error checking privacy: ' + err.message);
        });
    };

    reader.readAsDataURL(file);
  } else {
    alert('No image found in file input.');
  }
}
