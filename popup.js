document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleZoom');
  
    // Get saved state
    chrome.storage.sync.get(['zoomEnabled'], (result) => {
      toggle.checked = result.zoomEnabled ?? true;
    });
  
    toggle.addEventListener('change', () => {
      chrome.storage.sync.set({ zoomEnabled: toggle.checked });
  
      // Send a message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_ZOOM',
          enabled: toggle.checked,
        });
      });
    });
  });