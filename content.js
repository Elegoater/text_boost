let zoomEnabled = true;

// Load zoom setting from storage
chrome.storage.sync.get(['zoomEnabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving zoomEnabled:', chrome.runtime.lastError);
      return;
    }
    toggle.checked = result.zoomEnabled ?? true;
  });

// Listen for toggle messages from 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'TOGGLE_ZOOM') {
      zoomEnabled = message.enabled;
      console.log('Zoom enabled:', zoomEnabled);
      if (!zoomEnabled) {
        zoomBox.style.display = 'none';
      }
    }
  });

// Add zoom box styles
const style = document.createElement('style');
style.textContent = `
  #zoomBox {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    padding: 15px;
    background: linear-gradient(135deg, #ffffff, #f0f0f0);
    color: #333;
    border: 1px solid #ddd;
    border-radius: 12px;
    font-size: 30px;
    font-family: Arial, sans-serif;
    line-height: 1.5;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    max-width: 350px;
    word-wrap: break-word;
    display: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
    transform: scale(0.95);
    opacity: 0;
  }

  #zoomBox.show {
    transform: scale(1);
    opacity: 1;
  }
`;
document.head.appendChild(style);

// Create the zoom box
const zoomBox = document.createElement('div');
zoomBox.id = 'zoomBox';
document.body.appendChild(zoomBox);

// Track mouse movement
document.addEventListener('mousemove', (e) => {
  if (!zoomEnabled) {
    zoomBox.style.display = 'none';
    return;
  }

  let element = document.elementFromPoint(e.clientX, e.clientY);

  // Handle shadow DOM elements
  if (element && element.shadowRoot) {
    element = element.shadowRoot.elementFromPoint(e.clientX, e.clientY);
  }

  // Ignore invalid or non-visible elements
  if (
    !element ||
    ['HTML', 'BODY', 'SCRIPT', 'STYLE', 'HEAD'].includes(element.tagName) ||
    element.offsetParent === null // Check if the element is not visible
  ) {
    zoomBox.style.display = 'none';
    return;
  }

  const text = element.innerText || element.textContent;

  // Ensure the text is meaningful and not just whitespace
  if (text && text.trim().length > 0) {
    const meaningfulText = text.trim().replace(/\s+/g, ' ');

    // Ignore elements with excessive text (e.g., entire page content)
    if (meaningfulText.length > 300 || element.tagName === 'BODY') {
      zoomBox.style.display = 'none';
      return;
    }

    if (meaningfulText.length > 0) {
      zoomBox.textContent = meaningfulText.slice(0, 300); // Limit text length
      zoomBox.style.top = `${e.clientY + 20}px`;
      zoomBox.style.left = `${e.clientX + 20}px`;
      zoomBox.classList.add('show');
      zoomBox.style.display = 'block';
    } else {
      zoomBox.classList.remove('show');
      zoomBox.style.display = 'none';
    }
  } else {
    zoomBox.style.display = 'none';
    zoomBox.classList.remove('show');
  }
});