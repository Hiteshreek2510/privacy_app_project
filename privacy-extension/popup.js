document.addEventListener('DOMContentLoaded', () => {
  const checkBtn = document.getElementById('checkPrivacy');
  const cancelBtn = document.getElementById('cancel');

  checkBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractImageAndSend
      });
    } catch (err) {
      alert('Failed to inject script: ' + err.message);
    }
  });

  cancelBtn.addEventListener('click', () => {
    window.close();
  });
});

// This function runs in the page context
function extractImageAndSend() {
  const input = document.querySelector('input[type="file"]');
  if (!input || input.files.length === 0) {
    alert('No image found in file input.');
    return;
  }

  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Selected file is not an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result;

    try {
      const response = await fetch('https://your-backend-url.com/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await response.json();
      alert(`Privacy Score: ${data.score}\nRisk Level: ${data.risk_level}`);
    } catch (err) {
      alert('Error checking privacy: ' + err.message);
    }
  };

  reader.readAsDataURL(file);
}
