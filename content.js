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
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_ZOOM') {
    zoomEnabled = message.enabled;
    if (!zoomEnabled) {
      zoomBox.style.display = 'none';
    }
  }
});

// Create the zoom box
const zoomBox = document.createElement('div');
zoomBox.style.position = 'fixed';
zoomBox.style.pointerEvents = 'none';
zoomBox.style.zIndex = 9999;
zoomBox.style.padding = '10px';
zoomBox.style.background = 'rgba(255, 255, 255, 0.95)';
zoomBox.style.border = '1px solid #ccc';
zoomBox.style.borderRadius = '8px';
zoomBox.style.fontSize = '24px';
zoomBox.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
zoomBox.style.maxWidth = '300px';
zoomBox.style.wordWrap = 'break-word';
zoomBox.style.display = 'none';
document.body.appendChild(zoomBox);

// Track mouse movement
document.addEventListener('mousemove', (e) => {
  if (!zoomEnabled) {
    zoomBox.style.display = 'none';
    return;
  }

  const element = document.elementFromPoint(e.clientX, e.clientY);

  if (element && element.nodeType === 1) {
    const text = element.innerText || element.textContent;
    if (text && text.trim().length > 0) {
      zoomBox.textContent = text.trim().slice(0, 300); // limit text
      zoomBox.style.top = `${e.clientY + 20}px`;
      zoomBox.style.left = `${e.clientX + 20}px`;
      zoomBox.style.display = 'block';
    } else {
      zoomBox.style.display = 'none';
    }
  }
});