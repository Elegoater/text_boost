let zoomEnabled = true;

// Load zoom setting from storage
chrome.storage.sync.get(['zoomEnabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving zoomEnabled:', chrome.runtime.lastError);
      return;
    }
    toggle.checked = result.zoomEnabled ?? true;
  });

// Listen for toggle messages from popup
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
    padding: 10px;
    background: rgba(255, 255, 255, 0.95);
    color: #000;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 300px;
    word-wrap: break-word;
    display: none;
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

    zoomBox.textContent = meaningfulText.slice(0, 300); // Limit text length
    zoomBox.style.top = `${e.clientY + 20}px`;
    zoomBox.style.left = `${e.clientX + 20}px`;
    zoomBox.style.display = 'block';
  } else {
    zoomBox.style.display = 'none';
  }
});