// Background Script für Link Organizer
// Reagiert auf Icon-Klicks, Kontextmenüs und speichert den aktuellen Tab

// Icon immer sichtbar machen
chrome.action.setBadgeBackgroundColor({ color: '#10a37f' });

// Kontextmenüs erstellen beim Installieren/Aktualisieren
chrome.runtime.onInstalled.addListener(() => {
  // Hauptmenü für Link Organizer
  chrome.contextMenus.create({
    id: "linkOrganizer",
    title: "Link Organizer",
    contexts: ["action"]
  });

  // Untermenüs
  chrome.contextMenus.create({
    id: "openLinkOrganizer",
    parentId: "linkOrganizer",
    title: "Link Organizer öffnen",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "saveCurrentTab",
    parentId: "linkOrganizer",
    title: "Aktuellen Tab speichern",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "separator1",
    parentId: "linkOrganizer",
    type: "separator",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "openInNewTab",
    parentId: "linkOrganizer",
    title: "In neuem Tab öffnen",
    contexts: ["action"]
  });
});

// Icon-Klick-Handler - Popup öffnen
chrome.action.onClicked.addListener(async (tab) => {
  // Popup öffnen
  chrome.action.openPopup();
});

// Kontextmenü-Handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case "openLinkOrganizer":
      // Link Organizer in neuem Tab öffnen (Full-Page)
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('popup.html?fullpage=true'),
        active: true 
      });
      break;

    case "saveCurrentTab":
      // Aktuellen Tab speichern (Popup öffnen)
      chrome.action.openPopup();
      break;

    case "openInNewTab":
      // Link Organizer in neuem Tab öffnen (Full-Page)
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('popup.html?fullpage=true'),
        active: true 
      });
      break;
  }
});

// Sichere Eingabe-Validierung für Background
const Utils = {
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/[<>&"']/g, '').trim();
  }
};

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
    iconUrl: 'logo-48.png',
    title: 'Link Organizer',
    message: Utils.sanitizeInput(message) // Nachrichten sanitisieren
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