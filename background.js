


chrome.action.setBadgeBackgroundColor({ color: '#10a37f' });


function handleContextMenuClick(info, tab) {
  try {
    switch (info.menuItemId) {
      case "openLinkOrganizer":
      case "openInNewTab":

        chrome.tabs.create({ 
          url: chrome.runtime.getURL('popup.html?fullpage=true'),
          active: true 
        });
        break;
    }
  } catch (error) {
    console.error('Context menu error:', error);
  }
}


chrome.runtime.onInstalled.addListener(() => {
  try {

    chrome.contextMenus.create({
      id: "openLinkOrganizer",
      title: "Link Organizer öffnen",
      contexts: ["action"]
    });

    chrome.contextMenus.create({
      id: "openInNewTab",
      title: "In neuem Tab öffnen",
      contexts: ["action"]
    });


    if (chrome.contextMenus && typeof chrome.contextMenus.onClicked !== 'undefined') {
      chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
    }
  } catch (error) {
    console.error('Context menu creation error:', error);
  }
});




const Utils = {
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/[<>&"']/g, '').trim();
  }
};


function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}


function showNotification(message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'logo-48.png',
    title: 'Link Organizer',
    message: Utils.sanitizeInput(message) // Nachrichten sanitisieren
  });
}






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