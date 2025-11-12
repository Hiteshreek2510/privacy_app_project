document.addEventListener('DOMContentLoaded', () => {
  const checkBtn = document.getElementById('checkPrivacy');
  const cancelBtn = document.getElementById('cancel');
  const resultDiv = document.getElementById('result');
  const filenameP = document.getElementById('filename');
  const previewImg = document.getElementById('preview');
  const sanitizedSection = document.getElementById('sanitizedSection');
  const sanitizeBtn = document.getElementById('sanitizeBtn');
  const sanitizedPreview = document.getElementById('sanitizedPreview');

  chrome.storage.local.get('selectedImage', ({ selectedImage }) => {
    if (selectedImage) {
      filenameP.textContent = `Selected image: ${selectedImage.filename}`;
      previewImg.src = selectedImage.data;
      checkBtn.disabled = false;

      checkBtn.addEventListener('click', async () => {
        resultDiv.textContent = 'Checking privacy score...';
        sanitizedSection.style.display = 'none';
        sanitizedPreview.innerHTML = '';

        try {
          const response = await fetch('https://hiteshreepatel-scoring-app.hf.space/score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: selectedImage.data })
          });

          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }

          const result = await response.json();
          resultDiv.innerHTML = `
            <p><strong>Privacy Score:</strong> ${result.score}/100</p>
            <p><strong>Risk Level:</strong> ${result.risk_level}</p>
            <p><strong>Detected Risks:</strong></p>
            <ul>${result.risks.map(f => `<li>${f}</li>`).join('')}</ul>
          `;

          sanitizedSection.style.display = 'block';
        } catch (err) {
          resultDiv.textContent = 'Error checking privacy score.';
          console.error('Fetch error:', err);
        }
      });

      sanitizeBtn.addEventListener('click', async () => {
        sanitizeBtn.disabled = true;
        sanitizeBtn.textContent = 'Sanitizing...';

        try {
          const response = await fetch('https://hiteshreepatel-sanitize.hf.space/sanitize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: selectedImage.data })
          });

          if (!response.ok) {
            throw new Error(`Sanitizer error: ${response.status}`);
          }

          const result = await response.json();

          // Replace score section with sanitized image
          resultDiv.style.display = 'none';
          sanitizedSection.style.display = 'none';
          sanitizedPreview.innerHTML = `
            <p><strong>Sanitized Image:</strong></p>
            <img src="${result.sanitized_image}" style="max-width: 100%; border: 1px solid #ccc;" />
            <div style="margin-top: 0.5em;">
              <a href="${result.sanitized_image}" download="sanitized.jpg" style="text-decoration: none;">
                <button>⬇️ Download Sanitized Image</button>
              </a>
            </div>
          `;
        } catch (err) {
          sanitizedPreview.textContent = 'Error sanitizing image.';
          console.error('Sanitize error:', err);
        } finally {
          sanitizeBtn.disabled = false;
          sanitizeBtn.textContent = '🧼 Sanitize Image';
        }
      });
    } else {
      filenameP.textContent = 'No image found. Please try again.';
      checkBtn.disabled = true;
    }
  });

  cancelBtn.addEventListener('click', () => {
    window.close();
  });
});
