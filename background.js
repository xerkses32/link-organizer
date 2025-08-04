// Background Script für Link Organizer
// Reagiert auf Icon-Klicks und speichert den aktuellen Tab

// Icon immer sichtbar machen
chrome.action.setBadgeBackgroundColor({ color: '#10a37f' });

// Icon-Klick-Handler - Einfach Popup öffnen
chrome.action.onClicked.addListener(async (tab) => {
  // Popup öffnen
  chrome.action.openPopup();
});

// URL-Validierung
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Benachrichtigung anzeigen
function showNotification(message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Link Organizer',
    message: message
  });
}





// Icon-Status aktualisieren basierend auf Tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (isValidUrl(tab.url)) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10a37f' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    chrome.action.setBadgeText({ text: '' });
  }
}); 