// Handle icon update when Zoom page is detected
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "zoomPageDetected") {
    chrome.action.setIcon({ path: "icon_active.png" });
  }

  // Handle logout
  if (request.type === "logout") {
    chrome.storage.local.remove(['zoomToken']);
  }
});
