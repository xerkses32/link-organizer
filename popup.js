/*
 * Link Organizer - Chrome Extension
 * Copyright (c) 2024 Markus Fackler. All rights reserved.
 * 
 * This software is proprietary and confidential. Unauthorized copying,
 * distribution, modification, or use is strictly prohibited.
 * 
 * Licensed under proprietary license - see LICENSE file for details.
 */

// ===== CONFIGURATION =====
const CONFIG = {
  MESSAGE_TIMEOUT: 3000,
  DEFAULT_SORT: { field: 'date', direction: 'desc' },
  MAX_FOLDER_NAME_LENGTH: 50,
  SVG_ICONS: ['pen.svg', 'trash.svg']
};

// ===== DOM ELEMENTS =====
const   DOM = {
    folderList: document.getElementById("folderList"),
    linkList: document.getElementById("linkList"),
    newFolderInput: document.getElementById("newFolderName"),
    createFolderBtn: document.getElementById("createFolderBtn"),
    saveLinkBtn: document.getElementById("saveLinkBtn"),
    exportCsvBtn: document.getElementById("exportCsvBtn"),
    openAllLinksBtn: document.getElementById("openAllLinksBtn"),
    searchInput: document.getElementById("searchInput"),
    selectedFolderTitle: document.getElementById("selectedFolderTitle"),
    messagesContainer: document.getElementById("messagesContainer"),
    emptyState: document.getElementById("emptyState"),
    // Share Code removed
    // History Overlay Elements
    historyOverlay: document.getElementById("historyOverlay"),
  quickHistoryBtn: document.getElementById("quickHistoryBtn"),
    closeHistoryBtn: document.getElementById("closeHistoryBtn"),
    historySearchInput: document.getElementById("historySearchInput"),


    selectAllHistory: document.getElementById("selectAllHistory"),
    selectedHistoryCount: document.getElementById("selectedHistoryCount"),
    historyList: document.getElementById("historyList"),
    addSelectedToFolderBtn: document.getElementById("addSelectedToFolderBtn"),
    fullPageBtn: document.getElementById("fullPageBtn"),
    sidebarFullPageBtn: document.getElementById("sidebarFullPageBtn"),
    // Language Elements
    languageToggle: document.getElementById("languageToggle"),
    languageDropdown: document.getElementById("languageDropdown"),
    currentFlag: document.getElementById("currentFlag")
  };

// ===== INTERNATIONALIZATION =====
const I18N = {
  currentLanguage: 'en', // English als Standard
  
  // Translation data
  translations: {
    de: {
      // Sidebar
      folders: 'Ordner',
      newFolderPlaceholder: 'Neuer Ordner...',
      createButton: 'Erstellen',
      openInNewTab: 'In neuem Tab öffnen',
      
      // Main content
      addTab: '+ Tab hinzufügen',
      searchPlaceholder: 'Links durchsuchen...',
      name: 'Name',
      addedOn: 'Hinzugefügt am',
      actions: 'Aktionen',
      openAll: 'Alle öffnen',
      exportCsv: 'Export CSV',
      fullscreen: 'Vollbild',
      emptyState: 'Keine Links in diesem Ordner. Füge deinen ersten Link hinzu!',
      
      // History
      openHistory: 'Browserverlauf öffnen',
      browserHistory: 'Browserverlauf',
      searchHistory: 'Verlauf durchsuchen...',
      selectAll: 'Alle auswählen',
      selected: 'ausgewählt',
      
      // Messages
      folderCreated: 'Ordner erstellt',
      linkAdded: 'Link hinzugefügt',
      linkDeleted: 'Link gelöscht',
      folderDeleted: 'Ordner gelöscht',
      
      // Date labels
      today: 'Heute',
      
      // History specific
      noActivities: 'Keine Aktivitäten',
      noActivityBlocks: 'Keine Aktivitätsblöcke gefunden.',
      noHistory: 'Kein Verlauf',
      noHistoryEntries: 'Keine Browserverlauf-Einträge gefunden.',
      errorLoading: 'Fehler beim Laden',
      historyLoadError: 'Fehler beim Laden der Historie',
      ensureHistoryPermission: 'Stelle sicher, dass die "history" Permission aktiviert ist.',
      retryButton: 'Extension neu laden',
      pages: 'Seiten',
      page: 'Seite',
      
      // Language selector
      selectLanguage: 'Sprache wählen',
      
      // Error messages
      folderNameRequired: 'Bitte geben Sie einen Ordnernamen ein.',
      folderNameTooLong: 'Ordnername zu lang (max. 50 Zeichen).',
      folderExists: 'Ordner existiert bereits.',
      linkNameTooLong: 'Name zu lang (max. 100 Zeichen).',
      linkAlreadyExists: 'Link bereits vorhanden.',
      noFolderSelected: 'Bitte zuerst einen Ordner auswählen.',
      noLinksToExport: 'Keine Links zum Exportieren vorhanden.',
      noLinksToOpen: 'Keine Links zum Öffnen vorhanden.',
      noValidLinks: 'Keine gültigen Links zum Öffnen gefunden.',
      invalidUrl: 'Ungültige URL vom aktuellen Tab.',
      linkNotFound: 'Link konnte nicht gefunden werden.',
      linkAlreadyInFolder: 'Link ist bereits in diesem Ordner.',
      linkAlreadyInTargetFolder: 'Link ist bereits im Zielordner vorhanden.',
      selectFolderFirst: 'Bitte wähle zuerst einen Ordner aus.',
      noLinksInFolder: 'Keine Links in diesem Ordner zum Kopieren.',
      currentTabError: 'Aktueller Tab konnte nicht geladen werden.',
      tooManyTabs: 'Zu viele Tabs in kurzer Zeit. Bitte warten Sie einen Moment.',
      
      // Success messages
      folderRenamed: 'Ordner erfolgreich umbenannt.',
      linkRenamed: 'Link erfolgreich umbenannt.',
      linkMoved: 'Link erfolgreich verschoben',
      linkMovedTo: 'Link erfolgreich nach "{folder}" verschoben.',
      linkStarred: 'Link als Favorit markiert',
      linkUnstarred: 'Favorit entfernt',
      folderReordered: 'Ordner "{name}" wurde neu angeordnet.',
      linksCopied: '{count} Links aus "{folder}" in Zwischenablage kopiert.',
      csvExported: 'CSV Export erfolgreich: {count} Links exportiert',
      linksAdded: '{count} Link{s} zum Ordner "{folder}" hinzugefügt.',
      linksOpened: '{count} Links in neuen Tabs geöffnet.',
      linksAddedSkipped: '{added} Links hinzugefügt, {skipped} übersprungen (bereits vorhanden).',
      welcomeMessage: 'Willkommen bei Link Organizer! 🎉',
      
      // UI updates and cleanup
      oldDataCleaned: 'Alte Daten wurden automatisch bereinigt.',
      storageWarning: 'Speicher wird knapp: {size}MB von 7MB verwendet.',
      linkSavedUIFailed: 'Link gespeichert, aber UI-Update fehlgeschlagen.',
      maxTabsLimit: 'Nur {max} Tabs pro Minute erlaubt.'
    },
    
    en: {
      // Sidebar
      folders: 'Folders',
      newFolderPlaceholder: 'New folder...',
      createButton: 'Create',
      openInNewTab: 'Open in new tab',
      
      // Main content
      addTab: '+ Add tab',
      searchPlaceholder: 'Search links...',
      name: 'Name',
      addedOn: 'Added on',
      actions: 'Actions',
      openAll: 'Open all',
      exportCsv: 'Export CSV',
      fullscreen: 'Fullscreen',
      emptyState: 'No links in this folder. Add your first link!',
      
      // History
      openHistory: 'Open browser history',
      browserHistory: 'Browser History',
      searchHistory: 'Search history...',
      selectAll: 'Select all',
      selected: 'selected',
      
      // Messages
      folderCreated: 'Folder created',
      linkAdded: 'Link added',
      linkDeleted: 'Link deleted',
      folderDeleted: 'Folder deleted',
      
      // Date labels
      today: 'Today',
      
      // History specific
      noActivities: 'No Activities',
      noActivityBlocks: 'No activity blocks found.',
      noHistory: 'No History',
      noHistoryEntries: 'No browser history entries found.',
      errorLoading: 'Error loading',
      historyLoadError: 'Error loading history',
      ensureHistoryPermission: 'Make sure the "history" permission is enabled.',
      retryButton: 'Reload extension',
      pages: 'pages',
      page: 'page',
      
      // Language selector
      selectLanguage: 'Select Language',
      
      // Error messages
      folderNameRequired: 'Please enter a folder name.',
      folderNameTooLong: 'Folder name too long (max. 50 characters).',
      folderExists: 'Folder already exists.',
      linkNameTooLong: 'Name too long (max. 100 characters).',
      linkAlreadyExists: 'Link already exists.',
      noFolderSelected: 'Please select a folder first.',
      noLinksToExport: 'No links to export.',
      noLinksToOpen: 'No links to open.',
      noValidLinks: 'No valid links found to open.',
      invalidUrl: 'Invalid URL from current tab.',
      linkNotFound: 'Link could not be found.',
      linkAlreadyInFolder: 'Link is already in this folder.',
      linkAlreadyInTargetFolder: 'Link is already in target folder.',
      selectFolderFirst: 'Please select a folder first.',
      noLinksInFolder: 'No links in this folder to copy.',
      currentTabError: 'Current tab could not be loaded.',
      tooManyTabs: 'Too many tabs in short time. Please wait a moment.',
      
      // Success messages
      folderRenamed: 'Folder successfully renamed.',
      linkRenamed: 'Link successfully renamed.',
      linkMoved: 'Link successfully moved',
      linkMovedTo: 'Link successfully moved to "{folder}".',
      linkStarred: 'Link marked as favorite',
      linkUnstarred: 'Favorite removed',
      folderReordered: 'Folder "{name}" was reordered.',
      linksCopied: '{count} links from "{folder}" copied to clipboard.',
      csvExported: 'CSV export successful: {count} links exported',
      linksAdded: '{count} link{s} added to folder "{folder}".',
      linksOpened: '{count} links opened in new tabs.',
      linksAddedSkipped: '{added} links added, {skipped} skipped (already exist).',
      welcomeMessage: 'Welcome to Link Organizer! 🎉',
      
      // UI updates and cleanup
      oldDataCleaned: 'Old data was automatically cleaned up.',
      storageWarning: 'Storage is running low: {size}MB of 7MB used.',
      linkSavedUIFailed: 'Link saved, but UI update failed.',
      maxTabsLimit: 'Only {max} tabs per minute allowed.'
    }
  },
  
  // Language data with flags
  languages: {
    de: {
      name: 'Deutsch',
      flag: 'gyflag.svg',
      code: 'DE'
    },
    en: {
      name: 'English',
      flag: 'usflag.svg',
      code: 'EN'
    }
  },
  
  // Get translation with variable substitution
  t(key, variables = {}) {
    let translation = this.translations[this.currentLanguage][key] || key;
    
    // Replace variables in format {variableName}
    Object.keys(variables).forEach(varKey => {
      const regex = new RegExp(`\\{${varKey}\\}`, 'g');
      translation = translation.replace(regex, variables[varKey]);
    });
    
    return translation;
  },
  
  // Load saved language
  async loadLanguage() {
    try {
      const result = await Storage.get('language');
      if (result && this.translations[result]) {
        this.currentLanguage = result;
      }
      
      // Ensure all dropdown options are visible on load
      Utils.setSafeTimeout(() => {
        this.updateDropdownActiveStates();
      }, 100);
    } catch (error) {
      console.error('Error loading language:', error);
    }
  },
  
  // Save language
  async saveLanguage(lang) {
    try {
      await Storage.set({ language: lang });
      this.currentLanguage = lang;
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
  
  // Switch language
  async switchLanguage(newLang) {
    if (newLang && newLang !== this.currentLanguage) {
      await this.saveLanguage(newLang);
      this.updateUI();
    }
  },
  
  // Toggle dropdown
  toggleDropdown() {
    if (!DOM.languageDropdown) return;
    
    const isOpen = !DOM.languageDropdown.classList.contains('is-hidden');
    
    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },
  
  // Open dropdown
  openDropdown() {
    if (!DOM.languageDropdown || !DOM.languageToggle) return;
    
    DOM.languageDropdown.classList.remove('is-hidden');
    DOM.languageToggle.setAttribute('aria-expanded', 'true');
    
    // Update active states
    this.updateDropdownActiveStates();
    
    // Close on outside click
    Utils.setSafeTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    }, 100);
  },
  
  // Close dropdown
  closeDropdown() {
    if (!DOM.languageDropdown || !DOM.languageToggle) return;
    
    DOM.languageDropdown.classList.add('is-hidden');
    DOM.languageToggle.setAttribute('aria-expanded', 'false');
    
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  },
  
  // Handle outside click
  handleOutsideClick(event) {
    if (!DOM.languageDropdown) return;
    
    const isClickInsideDropdown = DOM.languageDropdown.contains(event.target);
    const isClickOnToggle = DOM.languageToggle && DOM.languageToggle.contains(event.target);
    
    if (!isClickInsideDropdown && !isClickOnToggle) {
      this.closeDropdown();
    }
  },
  
  // Update dropdown active states
  updateDropdownActiveStates() {
    if (!DOM.languageDropdown) return;
    
    const options = DOM.languageDropdown.querySelectorAll('.language-option');
    options.forEach(option => {
      const lang = option.getAttribute('data-lang');
      // Ensure all options are always visible
      option.style.display = 'flex';
      option.style.visibility = 'visible';
      
      if (lang === this.currentLanguage) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  },
  
  // Update language button
  updateLanguageButton() {
    if (!DOM.currentFlag) return;
    
    const langData = this.languages[this.currentLanguage];
    DOM.currentFlag.src = langData.flag;
    DOM.currentFlag.alt = langData.code;
  },
  
  // Update all UI text
  updateUI() {
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      element.textContent = translation;
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      element.placeholder = translation;
    });
    
    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      element.title = translation;
    });
    
    // Update language button
    this.updateLanguageButton();
    
      // Update document language
    document.documentElement.lang = this.currentLanguage;
  },
  
  // Format date according to current language
  formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (this.currentLanguage === 'en') {
      // English format: MM/DD/YYYY or January 1, 2024
      if (options.short) {
        return dateObj.toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        });
      } else {
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } else {
      // German format: DD.MM.YYYY or 1. Januar 2024
      if (options.short) {
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      } else {
        return dateObj.toLocaleDateString('de-DE', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    }
  },
  
  // Format time according to current language
  formatTime(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (this.currentLanguage === 'en') {
      // English format: 2:30 PM
      return dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      // German format: 14:30
      return dateObj.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
  },
  
  // Format datetime according to current language
  formatDateTime(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (this.currentLanguage === 'en') {
      // English format: Jan 1, 2024 at 2:30 PM
      if (options.short) {
        return dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } else {
      // German format: 1. Jan 2024 um 14:30
      if (options.short) {
        return dateObj.toLocaleDateString('de-DE', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        return dateObj.toLocaleDateString('de-DE', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
    }
  }
  };

// ===== STATE MANAGEMENT =====
const State = {
  currentFolder: null,
  currentLinks: [],
  currentTab: null,
  currentSort: { ...CONFIG.DEFAULT_SORT },
  draggedElement: null,
  activeTimeouts: new Set(), // Track active timeouts
  
  update(updates) {
    Object.assign(this, updates);
    this.notifyListeners();
  },
  
  listeners: new Set(),
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this));
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  showMessage(message, type = 'success', variables = {}) {
    // Try to translate message if it's a translation key
    const translatedMessage = I18N.t(message, variables);
    
    const messageEl = document.createElement('div');
    messageEl.className = type === 'error' ? 'error-message' : 'success-message';
    messageEl.textContent = translatedMessage;
    
    // Clear messages container safely
    while (DOM.messagesContainer.firstChild) {
      DOM.messagesContainer.removeChild(DOM.messagesContainer.firstChild);
    }
    DOM.messagesContainer.appendChild(messageEl);
    
    Utils.setSafeTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, CONFIG.MESSAGE_TIMEOUT);
  },

  isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    
    try {
      const url = new URL(string);
      
      // Nur erlaubte Protokolle
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        return false;
      }
      
      // Gefährliche Protokolle explizit blockieren
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      if (dangerousProtocols.some(protocol => string.toLowerCase().startsWith(protocol))) {
        return false;
      }
      
      return true;
    } catch (_) {
      return false;
    }
  },

  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[<>&"']/g, (char) => {
        // HTML Entity Encoding
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return entities[char] || char;
      })
      .replace(/javascript:/gi, '') // JavaScript-URLs blockieren
      .replace(/data:/gi, '') // Data-URLs blockieren
      .replace(/vbscript:/gi, '') // VBScript blockieren
      .replace(/file:/gi, '') // File-URLs blockieren
      .replace(/on\w+\s*=/gi, '') // Event-Handler entfernen
      .replace(/expression\s*\(/gi, '') // CSS Expression attacks
      .replace(/url\s*\(/gi, '') // CSS URL injections
      .trim();
  },

  // Neue sichere Funktion für URLs
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url);
      // Nur sichere Protokolle erlauben
      const allowedProtocols = ['http:', 'https:', 'ftp:', 'mailto:'];
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.href;
    } catch {
      return '';
    }
  },

  generateId() {
    return `link-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  },

  clearElement(element) {
    if (!element) {
      console.error('Cannot clear element - element is null');
      return;
    }
    
    try {
      // Only clear event listeners for dynamic content areas, not core UI
      if (element.id === 'linkList' || element.id === 'historyList' || element.id === 'folderList') {
        this.removeAllEventListeners(element);
      }
      
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    } catch (error) {
      console.error('Error clearing element:', error);
    }
  },

  // Remove all event listeners from element and its children (selective)
  removeAllEventListeners(element) {
    if (!element) return;
    
    try {
      // Only remove listeners from specific dynamic elements, not core UI
      const dynamicSelectors = [
        '.link-item',
        '.folder-item', 
        '.activity-entry',
        '.activity-header',
        '.entry-checkbox',
        '.drag-handle'
      ];
      
      dynamicSelectors.forEach(selector => {
        const elements = element.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.parentNode) {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
          }
        });
      });
    } catch (error) {
      console.error('Error removing event listeners:', error);
    }
  },

  // Safe timeout management to prevent race conditions
  setSafeTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      State.activeTimeouts.delete(timeoutId);
      callback();
    }, delay);
    State.activeTimeouts.add(timeoutId);
    return timeoutId;
  },

  clearSafeTimeout(timeoutId) {
    if (timeoutId && State.activeTimeouts.has(timeoutId)) {
      clearTimeout(timeoutId);
      State.activeTimeouts.delete(timeoutId);
    }
  },

  clearAllTimeouts() {
    State.activeTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    State.activeTimeouts.clear();
  },

  // History utility functions
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (I18N.currentLanguage === 'en') {
      // English relative time
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    } else {
      // German relative time
    if (diff < 60000) return 'Gerade eben';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    }
    
    return I18N.formatDate(date, { short: true });
  },

  getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return '';
    }
  }
};

// Direct folder count update function
async function updateFolderCountDirect(folderName) {
  try {
    const folders = await Storage.getFolders();
    const links = folders[folderName] || [];
    
    const countElement = document.getElementById(`folder-count-${folderName}`);
    if (countElement) {
      countElement.textContent = `(${links.length})`;
    }
  } catch (error) {
    console.error('Error updating folder count:', error);
  }
}

// ===== STORAGE API =====
const Storage = {
  async get(key, defaultValue = {}) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get({ [key]: defaultValue }, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  },

  async set(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  async getFolders() {
    const folders = await this.get('folders', {});
    
    // Validiere und bereinige Ordner-Daten
    const validatedFolders = {};
    
    for (const folderName in folders) {
      // Validiere Ordnername
      const sanitizedName = Utils.sanitizeInput(folderName);
      if (!sanitizedName || sanitizedName.length > CONFIG.MAX_FOLDER_NAME_LENGTH) {
        console.warn('Invalid folder name:', folderName);
        continue;
      }
      
      // Validiere Links-Array
      if (!Array.isArray(folders[folderName])) {
        console.warn('Folder is not an array:', folderName, folders[folderName]);
        validatedFolders[sanitizedName] = [];
        continue;
      }
      
      // Validiere jeden Link im Ordner
      const validatedLinks = folders[folderName].filter(link => {
        if (!link || typeof link !== 'object') return false;
        if (!link.url || !Utils.isValidUrl(link.url)) return false;
        if (link.name && typeof link.name !== 'string') return false;
        return true;
      }).map(link => ({
        id: link.id || Utils.generateId(),
        url: Utils.sanitizeUrl(link.url),
        name: link.name ? Utils.sanitizeInput(link.name) : '',
        addedAt: link.addedAt || Date.now(),
        starred: Boolean(link.starred)
      }));
      
      validatedFolders[sanitizedName] = validatedLinks;
    }
    
    return validatedFolders;
  },

  async setFolders(folders) {
    // Validiere vor dem Speichern
    if (!folders || typeof folders !== 'object') {
      throw new Error('Invalid folders data: must be an object');
    }
    
    // Storage monitoring and cleanup
    const storageResult = await this.checkStorageHealth(folders);
    if (!storageResult.canSave) {
      throw new Error(storageResult.message);
    }
    
    return this.set({ folders });
  },

  // Advanced storage health monitoring
  async checkStorageHealth(newData) {
    try {
      // Get current storage usage
      const currentData = await this.get('folders');
      const currentSize = JSON.stringify(currentData).length;
      const newSize = JSON.stringify(newData).length;
      
      // Chrome storage.local limit: 10MB, use 7MB as safe limit
      const SAFE_LIMIT = 7 * 1024 * 1024; // 7MB
      const WARNING_LIMIT = 6 * 1024 * 1024; // 6MB
      
      if (newSize > SAFE_LIMIT) {
        // Try to cleanup old data
        const cleanedData = await this.performStorageCleanup(newData);
        const cleanedSize = JSON.stringify(cleanedData).length;
        
        if (cleanedSize > SAFE_LIMIT) {
          return {
            canSave: false,
            message: `Speicher voll (${(newSize / 1024 / 1024).toFixed(1)}MB). Bitte löschen Sie alte Ordner oder Links.`
          };
        }
        
        // Use cleaned data
        Object.assign(newData, cleanedData);
        Utils.showMessage('Alte Daten wurden automatisch bereinigt.', 'info');
      } else if (newSize > WARNING_LIMIT) {
        Utils.showMessage(`Speicher wird knapp: ${(newSize / 1024 / 1024).toFixed(1)}MB von 7MB verwendet.`, 'warning');
      }
      
      return { canSave: true };
    } catch (error) {
      console.error('Storage health check failed:', error);
      return { canSave: true }; // Fall back to normal save
    }
  },

  // Automatic storage cleanup
  async performStorageCleanup(folders) {
    const cleanedFolders = { ...folders };
    let totalRemoved = 0;
    
    // Strategy 1: Remove empty folders
    Object.keys(cleanedFolders).forEach(folderName => {
      if (!cleanedFolders[folderName] || 
          !cleanedFolders[folderName].links || 
          cleanedFolders[folderName].links.length === 0) {
        delete cleanedFolders[folderName];
        totalRemoved++;
      }
    });
    
    // Strategy 2: Remove oldest links if still too large
    const currentSize = JSON.stringify(cleanedFolders).length;
    if (currentSize > 6 * 1024 * 1024) { // Still too large
      Object.keys(cleanedFolders).forEach(folderName => {
        const folder = cleanedFolders[folderName];
        if (folder.links && folder.links.length > 50) {
          // Keep only newest 50 links per folder
          folder.links = folder.links
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 50);
          totalRemoved += folder.links.length - 50;
        }
      });
    }
    
    if (totalRemoved > 0) {
      console.log(`Storage cleanup: removed ${totalRemoved} items`);
    }
    
    return cleanedFolders;
  }
};

// ===== ACTIVITY SNAPSHOT MANAGER =====
const ActivitySnapshotManager = {
  // Configuration for activity detection
  config: {
    INACTIVITY_THRESHOLD: 30 * 60 * 1000, // 30 minutes of inactivity starts new block
    MIN_ACTIVITY_DURATION: 5 * 60 * 1000, // Minimum 5 minutes for an activity block
    MAX_ACTIVITY_DURATION: 4 * 60 * 60 * 1000, // Maximum 4 hours for an activity block
    MIN_ENTRIES_FOR_BLOCK: 2, // Minimum entries to form an activity block
  },

  // Simple time-based activity detection
  config: {
    INACTIVITY_THRESHOLD: 15 * 60 * 1000, // 15 minutes of inactivity starts new block
    MIN_ENTRIES_FOR_BLOCK: 2, // Minimum entries to form an activity block
  },

  // Detect activity blocks from history entries
  detectActivityBlocks(historyEntries) {
    if (!historyEntries || historyEntries.length === 0) {
      return [];
    }

    // CRITICAL FIX: Sort entries chronologically first!
    const sortedEntries = [...historyEntries].sort((a, b) => a.lastVisitTime - b.lastVisitTime);

    console.log('Detecting activity blocks from', sortedEntries.length, 'entries');
    console.log('First entry:', new Date(sortedEntries[0].lastVisitTime));
    console.log('Last entry:', new Date(sortedEntries[sortedEntries.length - 1].lastVisitTime));

    const blocks = [];
    let currentBlock = {
      startTime: sortedEntries[0].lastVisitTime,
      endTime: sortedEntries[0].lastVisitTime,
      entries: [sortedEntries[0]]
    };

    for (let i = 1; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const prevEntry = sortedEntries[i - 1];
      const timeDiff = entry.lastVisitTime - prevEntry.lastVisitTime;

      // Debug logging for large time differences
      if (timeDiff > 5 * 60 * 1000) { // Log gaps > 5 minutes
        console.log(`Large gap detected: ${Math.round(timeDiff / 60000)}min between entries`);
        console.log('Previous:', new Date(prevEntry.lastVisitTime), prevEntry.title);
        console.log('Current:', new Date(entry.lastVisitTime), entry.title);
      }

      // Check if this should start a new activity block
      if (timeDiff > this.config.INACTIVITY_THRESHOLD) {
        // Finalize current block if it meets minimum criteria
        if (currentBlock.entries.length >= this.config.MIN_ENTRIES_FOR_BLOCK) {
          currentBlock.endTime = prevEntry.lastVisitTime;
          const block = this.finalizeActivityBlock(currentBlock);
          console.log('Created block:', block.startTimeFormatted, `(${block.entryCount} entries)`);
          blocks.push(block);
        }

        // Start new block
        currentBlock = {
          startTime: entry.lastVisitTime,
          endTime: entry.lastVisitTime,
          entries: [entry]
        };
      } else {
        // Continue current block
        currentBlock.entries.push(entry);
        currentBlock.endTime = entry.lastVisitTime;
      }
    }

    // Add final block if it meets criteria
    if (currentBlock.entries.length >= this.config.MIN_ENTRIES_FOR_BLOCK) {
      const block = this.finalizeActivityBlock(currentBlock);
      console.log('Created final block:', block.startTimeFormatted, `(${block.entryCount} entries)`);
      blocks.push(block);
    }

    console.log('Total blocks created:', blocks.length);
    // Sort blocks by start time (newest first for timeline display)
    return blocks.sort((a, b) => b.startTime - a.startTime);
  },



  // Finalize an activity block with additional metadata
  finalizeActivityBlock(block) {
    const duration = block.endTime - block.startTime;
    
    return {
      ...block,
      id: `activity-${block.startTime}-${block.entries.length}`,
      duration: duration,
      entryCount: block.entries.length,
      startTimeFormatted: this.formatTimeRange(block.startTime, block.endTime),
      durationFormatted: this.formatDuration(duration)
    };
  },

  // Format time range according to current language
  formatTimeRange(startTime, endTime) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    const startTime24 = I18N.formatTime(startDate);
    const endTime24 = I18N.formatTime(endDate);
    
    // Just show start time for the snapshot header
    return startTime24;
  },

  // Format duration in human readable format
  formatDuration(duration) {
    const minutes = Math.floor(duration / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  // Create activity snapshot element
  createActivitySnapshotElement(block) {
    const snapshotEl = document.createElement('div');
    snapshotEl.className = 'activity-snapshot';
    snapshotEl.dataset.activityId = block.id;
    
    snapshotEl.innerHTML = `
      <div class="activity-header" tabindex="0" role="button" aria-expanded="false">
        <div class="activity-main">
          <div class="activity-info">
            <span class="activity-time">${block.startTimeFormatted}</span>
                            <span class="activity-duration">${block.entryCount} ${block.entryCount === 1 ? I18N.t('page') : I18N.t('pages')}</span>
          </div>
        </div>
        <div class="activity-meta">
          <span class="activity-caret"></span>
        </div>
      </div>
      <div class="activity-details" style="display: none;"></div>
    `;

    // Add click handler for expanding details
    const header = snapshotEl.querySelector('.activity-header');
    const details = snapshotEl.querySelector('.activity-details');
    
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        // Collapse
        header.setAttribute('aria-expanded', 'false');
        details.style.display = 'none';
      } else {
        // Expand
        header.setAttribute('aria-expanded', 'true');
        details.style.display = 'block';
        this.renderActivityDetails(block, details);
      }
    });

    // Keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });

    return snapshotEl;
  },

  // Render detailed view of activity block
  renderActivityDetails(block, container) {
    container.innerHTML = `
      <div class="activity-entries">
        ${block.entries.map(entry => `
          <div class="activity-entry" data-history-id="${entry.id}">
            <img src="${entry.favicon}" alt="" class="entry-favicon" onerror="this.style.display='none'">
            <div class="entry-content">
              <div class="entry-title">${entry.title || entry.url}</div>
              <div class="entry-url">${entry.url}</div>
            </div>
            <div class="entry-actions">
              <input type="checkbox" class="entry-checkbox" ${HistoryManager.selectedItems.has(entry.id) ? 'checked' : ''}>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Add event listeners for checkboxes and drag & drop
    container.querySelectorAll('.entry-checkbox').forEach((checkbox, index) => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const entry = block.entries[index];
        const entryEl = checkbox.closest('.activity-entry');
        HistoryManager.toggleHistoryItem(entry.id, entryEl);
      });
    });

    // Add drag & drop to activity entries
    container.querySelectorAll('.activity-entry').forEach((entryEl, index) => {
      const entry = block.entries[index];
      HistoryManager.setupHistoryItemDragAndDrop(entryEl, entry, index);
    });
  },

  // Render all activity snapshots
  renderActivitySnapshots(historyItems) {
    const blocks = this.detectActivityBlocks(historyItems);
    
    Utils.clearElement(DOM.historyList);
    
    // Create vertical timeline line (will be adjusted later)
    const timelineLine = document.createElement('div');
    timelineLine.className = 'timeline-line';
    timelineLine.style.cssText = `
      position: absolute;
      left: 24px;
      top: 0;
      width: 2px;
      background: #e1e5e9;
      z-index: 1;
      height: 100px;
      border-radius: 1px;
    `;
    DOM.historyList.appendChild(timelineLine);
    
    if (blocks.length === 0) {
      DOM.historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h4>${I18N.t('noActivities')}</h4>
          <p>${I18N.t('noActivityBlocks')}</p>
        </div>
      `;
      return;
    }



    // Add activity snapshots to the list
    let lastDate = null;
    
    blocks.forEach((block, index) => {
      const blockDate = new Date(block.startTime);
      const currentDate = blockDate.toDateString();
      
      // Add date separator if it's a new day
      if (currentDate !== lastDate) {
        const dateSeparator = document.createElement('div');
        dateSeparator.className = 'timeline-date-separator';
        
        const today = new Date();
        const isToday = blockDate.toDateString() === today.toDateString();
        
        const labelClass = isToday ? 'timeline-date-label today' : 'timeline-date-label';
        const labelText = isToday ? I18N.t('today') : I18N.formatDate(blockDate, { short: true });
        
        dateSeparator.innerHTML = `<span class="${labelClass}">${labelText}</span>`;
        DOM.historyList.appendChild(dateSeparator);
        
        lastDate = currentDate;
      }
      
      const snapshotEl = this.createActivitySnapshotElement(block);
      DOM.historyList.appendChild(snapshotEl);
    });

    // Add minimal timeline end spacer
    const timelineEnd = document.createElement('div');
    timelineEnd.className = 'timeline-end';
    DOM.historyList.appendChild(timelineEnd);

    // Dynamically adjust timeline line height to match content
    Utils.setSafeTimeout(() => {
      const timelineLine = DOM.historyList.querySelector('.timeline-line');
      const lastElement = DOM.historyList.lastElementChild;
      if (timelineLine && lastElement) {
        const lastElementTop = lastElement.offsetTop;
        const contentHeight = lastElementTop + 80; // 80px buffer for bottom spacing
        timelineLine.style.height = contentHeight + 'px';
      }
    }, 100);

    // Update selected count
    HistoryManager.updateSelectedCount();
  }
};

// ===== HISTORY MANAGER =====
const HistoryManager = {
  historyItems: [],
  selectedItems: new Set(),
  isOpen: false,

  // Day groups for lazy rendering per day
  dayGroups: new Map(),
  _renderedGroupCount: 0,
  _groupsOrdered: [],
  _loadingMore: false,
  _pagination: { endTime: null, hasMore: true },

  async loadHistory(timeFilter = 'all') {
    try {
      // Show loading state
      this.showLoadingState();
      
      // Calculate time range
      const now = Date.now();
      const hoursAgo = timeFilter === 'all' ? 0 : parseInt(timeFilter);
      const startTime = hoursAgo > 0 ? now - (hoursAgo * 60 * 60 * 1000) : 0;
      
      console.log('Loading history with timeFilter:', timeFilter, 'startTime:', startTime, 'hoursAgo:', hoursAgo);
      console.log('startTime as date:', new Date(startTime));
      
      // Check if chrome.history is available
      if (!chrome.history || !chrome.history.search) {
        throw new Error('History API nicht verfügbar. Stelle sicher, dass die "history" Permission aktiviert ist.');
      }
      
      // Query Chrome history (initial batch)
      const historyItems = await this.fetchHistoryBatch({ startTime, endTime: null, maxResults: 10000 });
      
      console.log('Raw history items count:', historyItems.length);
      if (historyItems.length > 0) {
        console.log('Date range:', new Date(Math.min(...historyItems.map(i => i.lastVisitTime))), 'to', new Date(Math.max(...historyItems.map(i => i.lastVisitTime))));
      }
      
      // Filter and normalize
      this.historyItems = historyItems
        .filter(item => item.url && !item.url.startsWith('chrome://'))
        .map(item => ({
          id: item.id || `${item.url}-${item.lastVisitTime}`,
          url: item.url,
          title: item.title || item.url,
          lastVisitTime: item.lastVisitTime,
          visitCount: item.visitCount || 1,
          favicon: Utils.getFaviconUrl(item.url)
        }))
        .sort((a, b) => b.lastVisitTime - a.lastVisitTime); // Sort by most recent first

      console.log('Processed history items:', this.historyItems.length);
      
      // Setup pagination marker
      this._pagination.endTime = this.historyItems.length ? Math.min(...this.historyItems.map(i => i.lastVisitTime)) : null;
      this._pagination.hasMore = (historyItems.length >= 10000);
      this.renderHistoryList();
      this.updateSelectedCount();
      
    } catch (error) {
      console.error('Error loading history:', error);
      this.showErrorState(error);
    }
  },

  fetchHistoryBatch({ startTime = 0, endTime = null, maxResults = 10000 }) {
    return new Promise((resolve, reject) => {
      const query = { text: '', startTime, maxResults };
      if (endTime && Number.isFinite(endTime)) {
        query.endTime = endTime;
      }
      chrome.history.search(query, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome history error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(results || []);
        }
      });
    });
  },

  showLoadingState() {
    Utils.clearElement(DOM.historyList);
    DOM.historyList.innerHTML = `
      <div class="history-loading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2v6h-6M3 12a9 9 0 015-8.163M3 22v-6h6"/>
        </svg>
        Lade Browserverlauf...
      </div>
    `;
  },

  showErrorState(error = null) {
    Utils.clearElement(DOM.historyList);
    const errorMessage = error ? error.message : 'Der Browserverlauf konnte nicht geladen werden.';
    DOM.historyList.innerHTML = `
      <div class="history-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
                  <h4>${I18N.t('errorLoading')}</h4>
        <p>${errorMessage}</p>
        <p style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
          ${I18N.t('ensureHistoryPermission')}
        </p>
        <button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">
          ${I18N.t('retryButton')}
        </button>
      </div>
    `;
  },

  renderHistoryList() {
    console.log('Rendering history list with', this.historyItems.length, 'items');
    
    if (this.historyItems.length === 0) {
      console.log('No history items to render');
      Utils.clearElement(DOM.historyList);
      DOM.historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h4>${I18N.t('noHistory')}</h4>
          <p>${I18N.t('noHistoryEntries')}</p>
        </div>
      `;
      return;
    }

    // Clear any existing day-based groups
    this.dayGroups.clear();
    this._groupsOrdered = [];
    this._renderedGroupCount = 0;

    // Always use activity snapshots
    ActivitySnapshotManager.renderActivitySnapshots(this.historyItems);
  },





  createHistoryItem(item, index) {
    console.log('Creating history item:', item.title, 'at index:', index);
    
    const li = document.createElement('div');
    li.className = 'history-item';
    li.dataset.historyId = item.id;
    // li.draggable = true; // Entfernt - verwende Mouse-Events
    console.log('History item created (no longer draggable)');
    
    const isSelected = this.selectedItems.has(item.id);
    if (isSelected) {
      li.classList.add('selected');
    }
    
    // Sichere DOM-Erstellung ohne innerHTML
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'history-item-checkbox';
    checkbox.checked = isSelected;
    
    const favicon = document.createElement('img');
    favicon.src = item.favicon;
    favicon.alt = '';
    favicon.className = 'history-item-favicon';
    favicon.onerror = () => favicon.style.display = 'none';
    
    const content = document.createElement('div');
    content.className = 'history-item-content';
    
    const title = document.createElement('div');
    title.className = 'history-item-title';
    title.textContent = item.title || 'Unbekannter Titel';
    
    const url = document.createElement('div');
    url.className = 'history-item-url';
    url.textContent = item.url || '';
    
    content.appendChild(title);
    content.appendChild(url);
    
    li.appendChild(checkbox);
    li.appendChild(favicon);
    li.appendChild(content);
    
    // Add event listeners (use already created elements)
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      this.toggleHistoryItem(item.id, li);
    });
    
    li.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        this.handleHistoryItemClick(e, item.id, li, index);
      }
    });
    
    // --- NEU: Manuelle Drag & Drop mit Mouse-Events ---
    let isDragging = false;
    let dragStartX, dragStartY;
    let draggedElement = null;
    
    li.addEventListener('mousedown', (e) => {
      // Nur links-klick für Drag starten
      if (e.button !== 0) return;
      
      console.log('Mouse down on history item:', item.title);
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      draggedElement = li;
      
      // Visuelles Feedback
      li.style.opacity = '0.5';
      li.style.transform = 'scale(0.95)';
      
      // Drag-Daten vorbereiten
      const dragData = {
        type: 'history-item',
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        index: index,
        isBulkDrag: this.selectedItems.has(item.id),
        selectedItems: this.selectedItems.has(item.id) ? Array.from(this.selectedItems) : [item.id]
      };
      
      // Globale Drag-Daten setzen
      window.currentDragData = dragData;
      
      // Event-Listener für Drag-Bewegung und Drop
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      e.preventDefault();
    });
    
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Drag Preview Position aktualisieren
      if (dragPreview) {
        dragPreview.style.left = (e.clientX + 10) + 'px';
        dragPreview.style.top = (e.clientY - 10) + 'px';
      }
      
      // Visuelles Feedback für Drop-Zonen
      const folders = document.querySelectorAll('#folderList li');
      let hoveredFolder = null;
      
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          folder.classList.add('drag-over');
          hoveredFolder = folder;
        } else {
          folder.classList.remove('drag-over');
        }
      });
      
      // Drop Indicator Position und Text aktualisieren
      if (dropIndicator) {
        if (hoveredFolder) {
          const folderName = hoveredFolder.querySelector('.folder-name').textContent;
          const selectedCount = window.currentDragData.selectedItems.length;
          dropIndicator.textContent = selectedCount > 1 ? 
            `${selectedCount} Einträge zu "${folderName}" hinzufügen` : 
            `Zu "${folderName}" hinzufügen`;
          dropIndicator.style.left = (e.clientX - dropIndicator.offsetWidth / 2) + 'px';
          dropIndicator.style.top = (e.clientY - 50) + 'px';
          dropIndicator.style.display = 'block';
        } else {
          dropIndicator.style.display = 'none';
        }
      }
    };
    
    const handleMouseUp = (e) => {
      if (!isDragging) return;
      
      console.log('Mouse up - checking for drop target');
      
      // Drop-Zone finden
      const folders = document.querySelectorAll('#folderList li');
      let dropTarget = null;
      
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          dropTarget = folder;
        }
        folder.classList.remove('drag-over');
      });
      
      // Drop ausführen
      if (dropTarget && window.currentDragData) {
        const folderName = dropTarget.getAttribute('data-folder-name');
        console.log('Dropping history item on folder:', folderName);
        
        // Visuelles Feedback: Ordner kurz hervorheben
        dropTarget.style.transition = 'all 0.3s ease';
        dropTarget.style.backgroundColor = 'rgba(16, 163, 127, 0.1)';
        dropTarget.style.borderLeft = '3px solid var(--accent)';
        
        // Feedback nach 500ms zurücksetzen
        Utils.setSafeTimeout(() => {
          dropTarget.style.backgroundColor = '';
          dropTarget.style.borderLeft = '';
        }, 500);
        
        // Simuliere ein Drop-Event
        const dropEvent = new Event('drop');
        dropEvent.dataTransfer = {
          types: ['text/plain'],
          getData: () => JSON.stringify(window.currentDragData)
        };
        
        // Setze Ghost-Click-Flag NUR für History-Drop
        window.ignoreNextClick = 'history-drop';
        HistoryManager.handleHistoryItemDrop(dropEvent, folderName);
      }
      
      // Aufräumen
      isDragging = false;
      draggedElement = null;
      
      // Visuelles Cleanup für das gedraggte Element
      if (li) {
        li.classList.remove('dragging', 'selected');
      }
      
      // Drag Preview entfernen
      if (dragPreview && dragPreview.parentNode) {
        dragPreview.parentNode.removeChild(dragPreview);
        dragPreview = null;
      }
      
      // Drop Indicator entfernen
      if (dropIndicator && dropIndicator.parentNode) {
        dropIndicator.parentNode.removeChild(dropIndicator);
        dropIndicator = null;
      }
      
      // Alle Ordner Drop-Highlights entfernen
      const allFolders = document.querySelectorAll('#folderList li');
      allFolders.forEach(folder => {
        folder.classList.remove('drag-over');
      });
      
      // Event-Listener entfernen
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Verzögerte Zurücksetzung der Drag-Daten, um Click-Outside-Handler zu vermeiden
      Utils.setSafeTimeout(() => {
        window.currentDragData = null;
      }, 200);
    };
    // --- ENDE NEU ---
    
    // Drag & Drop functionality
    this.setupHistoryItemDragAndDrop(li, item, index);
    
    console.log('History item created and setup complete:', item.title, 'draggable:', li.draggable, 'element:', li);
    
    return li;
  },

  setupHistoryItemDragAndDrop(li, item, index) {
    console.log('Setting up drag and drop for history item:', item.title);
    
    // --- NEU: Manuelle Drag & Drop mit Mouse-Events ---
    let isDragging = false;
    let dragStartX, dragStartY;
    let draggedElement = null;
    let dragPreview = null;
    let dropIndicator = null;
    
    li.addEventListener('mousedown', (e) => {
      // Nur links-klick für Drag starten
      if (e.button !== 0) return;
      
      console.log('Mouse down on history item:', item.title);
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      draggedElement = li;
      
      // Visuelles Feedback für den gedraggten Eintrag
      li.classList.add('dragging');
      if (this.selectedItems.has(item.id)) {
        li.classList.add('selected');
      }
      
      // Drag-Daten vorbereiten
      const dragData = {
        type: 'history-item',
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        index: index,
        isBulkDrag: this.selectedItems.has(item.id),
        selectedItems: this.selectedItems.has(item.id) ? Array.from(this.selectedItems) : [item.id]
      };
      
      // Drag Preview erstellen
      dragPreview = this.createDragPreview(dragData);
      document.body.appendChild(dragPreview);
      
      // Drop Indicator erstellen
      dropIndicator = this.createDropIndicator();
      document.body.appendChild(dropIndicator);
      
      // Globale Drag-Daten setzen
      window.currentDragData = dragData;
      
      // Event-Listener für Drag-Bewegung und Drop
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      e.preventDefault();
    });
    
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Drag Preview Position aktualisieren
      if (dragPreview) {
        dragPreview.style.left = (e.clientX + 10) + 'px';
        dragPreview.style.top = (e.clientY - 10) + 'px';
      }
      
      // Visuelles Feedback für Drop-Zonen
      const folders = document.querySelectorAll('#folderList li');
      let hoveredFolder = null;
      
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          folder.classList.add('drag-over');
          hoveredFolder = folder;
        } else {
          folder.classList.remove('drag-over');
        }
      });
      
      // Drop Indicator Position und Text aktualisieren
      if (dropIndicator) {
        if (hoveredFolder) {
          const folderName = hoveredFolder.querySelector('.folder-name').textContent;
          const selectedCount = window.currentDragData.selectedItems.length;
          dropIndicator.textContent = selectedCount > 1 ? 
            `${selectedCount} Einträge zu "${folderName}" hinzufügen` : 
            `Zu "${folderName}" hinzufügen`;
          dropIndicator.style.left = (e.clientX - dropIndicator.offsetWidth / 2) + 'px';
          dropIndicator.style.top = (e.clientY - 50) + 'px';
          dropIndicator.style.display = 'block';
        } else {
          dropIndicator.style.display = 'none';
        }
      }
    };
    
    const handleMouseUp = (e) => {
      if (!isDragging) return;
      
      console.log('Mouse up - checking for drop target');
      
      // Drop-Zone finden
      const folders = document.querySelectorAll('#folderList li');
      let dropTarget = null;
      
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          dropTarget = folder;
        }
        folder.classList.remove('drag-over');
      });
      
      // Drop ausführen
      if (dropTarget && window.currentDragData) {
        const folderName = dropTarget.getAttribute('data-folder-name');
        console.log('Dropping history item on folder:', folderName);
        
        // Visuelles Feedback: Ordner kurz hervorheben
        dropTarget.style.transition = 'all 0.3s ease';
        dropTarget.style.backgroundColor = 'rgba(16, 163, 127, 0.1)';
        dropTarget.style.borderLeft = '3px solid var(--accent)';
        
        // Feedback nach 500ms zurücksetzen
        Utils.setSafeTimeout(() => {
          dropTarget.style.backgroundColor = '';
          dropTarget.style.borderLeft = '';
        }, 500);
        
        // Simuliere ein Drop-Event
        const dropEvent = new Event('drop');
        dropEvent.dataTransfer = {
          types: ['text/plain'],
          getData: () => JSON.stringify(window.currentDragData)
        };
        
        // Setze Ghost-Click-Flag NUR für History-Drop
        window.ignoreNextClick = 'history-drop';
        HistoryManager.handleHistoryItemDrop(dropEvent, folderName);
      }
      
      // Aufräumen
      isDragging = false;
      draggedElement = null;
      
      // Visuelles Cleanup für das gedraggte Element
      if (li) {
        li.classList.remove('dragging', 'selected');
      }
      
      // Drag Preview entfernen
      if (dragPreview && dragPreview.parentNode) {
        dragPreview.parentNode.removeChild(dragPreview);
        dragPreview = null;
      }
      
      // Drop Indicator entfernen
      if (dropIndicator && dropIndicator.parentNode) {
        dropIndicator.parentNode.removeChild(dropIndicator);
        dropIndicator = null;
      }
      
      // Alle Ordner Drop-Highlights entfernen
      const allFolders = document.querySelectorAll('#folderList li');
      allFolders.forEach(folder => {
        folder.classList.remove('drag-over');
      });
      
      // Event-Listener entfernen
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Verzögerte Zurücksetzung der Drag-Daten, um Click-Outside-Handler zu vermeiden
      Utils.setSafeTimeout(() => {
        window.currentDragData = null;
      }, 200);
    };
    // --- ENDE NEU ---
    
    // Entferne das alte native Drag & Drop
    // li.addEventListener('dragstart', ...);
    // li.addEventListener('dragend', ...);
  },

  handleHistoryItemClick(e, itemId, li, index) {
    const isShiftPressed = e.shiftKey;
    const isCmdPressed = e.metaKey || e.ctrlKey;
    
    if (isShiftPressed || isCmdPressed) {
      // Bulk selection
      if (isShiftPressed) {
        this.selectHistoryRange(index);
      } else if (isCmdPressed) {
        this.toggleHistoryItem(itemId, li);
      }
    } else {
      // Single selection
      this.toggleHistoryItem(itemId, li);
    }
  },

  selectHistoryRange(endIndex) {
    const items = Array.from(DOM.historyList.querySelectorAll('.history-item'));
    const lastSelectedIndex = this.getLastSelectedIndexVisible(items);
    if (lastSelectedIndex === -1) {
      const el = items[endIndex];
      if (!el) return;
      this.toggleHistoryItem(el.dataset.historyId, el);
      return;
    }
    const startIndex = Math.min(lastSelectedIndex, endIndex);
    const endIdx = Math.max(lastSelectedIndex, endIndex);
    for (let i = startIndex; i <= endIdx; i++) {
      const el = items[i];
      if (!el) continue;
      const id = el.dataset.historyId;
      this.selectedItems.add(id);
      el.classList.add('selected');
      const cb = el.querySelector('.history-item-checkbox');
      if (cb) cb.checked = true;
    }
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  getLastSelectedIndexVisible(visibleNodes) {
    const selectedItems = Array.from(this.selectedItems);
    if (selectedItems.length === 0) return -1;
    const lastSelectedId = selectedItems[selectedItems.length - 1];
    return visibleNodes.findIndex(el => el.dataset.historyId === lastSelectedId);
  },

  async handleHistoryItemDrop(e, targetFolderName) {
    console.log('handleHistoryItemDrop called for folder:', targetFolderName, e);
    e.preventDefault();
    
    console.log('History item drop detected for folder:', targetFolderName);
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
      console.log('Drag data:', dragData);
      
      if (dragData.type !== 'history-item') {
        return;
      }
      
      const folders = await Storage.getFolders();
      if (!folders[targetFolderName]) {
        folders[targetFolderName] = [];
      }
      
      let addedCount = 0;
      let skippedCount = 0;
      
      if (dragData.isBulkDrag && dragData.selectedItems) {
        // Bulk drag - add multiple items
        for (const itemId of dragData.selectedItems) {
          const historyItem = this.historyItems.find(item => item.id === itemId);
          if (historyItem) {
            const newLink = {
              id: Utils.generateId(),
              url: historyItem.url,
              name: historyItem.title,
              addedAt: new Date().toISOString(),
              starred: false
            };
            
            // Check if link already exists
            const exists = folders[targetFolderName].some(link => link.url === newLink.url);
            if (!exists) {
              folders[targetFolderName].push(newLink);
              addedCount++;
            } else {
              skippedCount++;
            }
          }
        }
      } else {
        // Single item drag
        const newLink = {
          id: Utils.generateId(),
          url: dragData.url,
          name: dragData.title,
          addedAt: new Date().toISOString(),
          starred: false
        };
        
        // Check if link already exists
        const exists = folders[targetFolderName].some(link => link.url === newLink.url);
        if (exists) {
          Utils.showMessage('Link bereits im Zielordner vorhanden.', 'error');
          return;
        }
        
        folders[targetFolderName].push(newLink);
        addedCount = 1;
      }
      
      await Storage.setFolders(folders);
      
      // Update UI if we're currently viewing the target folder
      if (State.currentFolder === targetFolderName) {
        State.update({ currentLinks: folders[targetFolderName] });
        await LinkManager.renderLinks(folders[targetFolderName]);
      }
      
      // Update folder count
      await updateFolderCountDirect(targetFolderName);
      
      if (addedCount > 0) {
        if (skippedCount > 0) {
          Utils.showMessage(`${addedCount} Links hinzugefügt, ${skippedCount} übersprungen (bereits vorhanden).`);
        } else {
          Utils.showMessage(`${addedCount} Link${addedCount > 1 ? 's' : ''} zum Ordner "${targetFolderName}" hinzugefügt.`);
        }
      }
      
    } catch (error) {
      console.error('Error dropping history item:', error);
      Utils.showMessage('Fehler beim Hinzufügen des Links: ' + error.message, 'error');
    }
  },

  toggleHistoryItem(itemId, element) {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
      element.classList.remove('selected');
      const cb = element.querySelector('.history-item-checkbox');
      if (cb) cb.checked = false;
    } else {
      this.selectedItems.add(itemId);
      element.classList.add('selected');
      const cb = element.querySelector('.history-item-checkbox');
      if (cb) cb.checked = true;
    }
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  updateSelectedCount() {
    const count = this.selectedItems.size;
    DOM.selectedHistoryCount.textContent = count;
    DOM.addSelectedToFolderBtn.disabled = count === 0;
  },

  updateSelectAllState() {
    const allSelected = this.historyItems.length > 0 && 
                      this.selectedItems.size === this.historyItems.length;
    DOM.selectAllHistory.checked = allSelected;
    DOM.selectAllHistory.indeterminate = this.selectedItems.size > 0 && 
                                        this.selectedItems.size < this.historyItems.length;
  },

  selectAllHistory() {
    this.historyItems.forEach(item => { this.selectedItems.add(item.id); });
    // Update only currently rendered items
    const nodes = DOM.historyList.querySelectorAll('.history-item');
    nodes.forEach((el) => {
      el.classList.add('selected');
      const cb = el.querySelector('.history-item-checkbox');
      if (cb) cb.checked = true;
    });
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  deselectAllHistory() {
    this.selectedItems.clear();
    const nodes = DOM.historyList.querySelectorAll('.history-item');
    nodes.forEach((el) => {
      el.classList.remove('selected');
      const cb = el.querySelector('.history-item-checkbox');
      if (cb) cb.checked = false;
    });
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  async addSelectedToFolder() {
    if (this.selectedItems.size === 0) return;
    
    const selectedItems = this.historyItems.filter(item => 
      this.selectedItems.has(item.id)
    );
    
    // Get current folder
    const currentFolder = State.currentFolder;
    if (!currentFolder) {
      Utils.showMessage('Bitte wähle zuerst einen Ordner aus.', 'error');
      return;
    }
    
    try {
      // Get current folders
      const folders = await Storage.getFolders();
      const currentLinks = folders[currentFolder] || [];
      
      // Add selected history items to folder
      const newLinks = selectedItems.map(item => ({
        id: Utils.generateId(),
        name: item.title,
        url: item.url,
        date: new Date().toISOString(),
        starred: false,
        favicon: item.favicon
      }));
      
      // Update folder - add new links to existing ones
      folders[currentFolder] = [...newLinks, ...currentLinks];
      await Storage.setFolders(folders);
      
      // Update UI
      await FolderManager.loadFolders();
      await LinkManager.renderLinks(folders[currentFolder]);
      
      // Update folder count
      await updateFolderCountDirect(currentFolder);
      
      // Clear selection
      this.selectedItems.clear();
      this.renderHistoryList();
      this.updateSelectedCount();
      
      Utils.showMessage(`${selectedItems.length} Links zum Ordner "${currentFolder}" hinzugefügt.`);
      
    } catch (error) {
      console.error('Error adding history items to folder:', error);
      Utils.showMessage('Fehler beim Hinzufügen der Links.', 'error');
    }
  },

  filterHistory(searchTerm) {
    const filteredItems = this.historyItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (searchTerm.trim() === '') {
      // If no search term, use activity snapshots
      ActivitySnapshotManager.renderActivitySnapshots(this.historyItems);
    } else {
      // If searching, use traditional list view
    this.renderFilteredHistory(filteredItems);
    }
  },

  renderFilteredHistory(filteredItems) {
    Utils.clearElement(DOM.historyList);
    
    if (filteredItems.length === 0) {
      DOM.historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h4>Keine Ergebnisse</h4>
          <p>Keine Verlauf-Einträge gefunden.</p>
        </div>
      `;
      return;
    }
    
    let currentDay = null;
    
    filteredItems.forEach((item, index) => {
      const itemDate = new Date(item.lastVisitTime);
      const itemDay = itemDate.toDateString();
      
      // Add day header if it's a new day
      if (itemDay !== currentDay) {
        const dayHeader = this.createDayHeader(itemDate);
        DOM.historyList.appendChild(dayHeader);
        currentDay = itemDay;
      }
      
      const historyItem = this.createHistoryItem(item, index);
      DOM.historyList.appendChild(historyItem);
    });
  },

  toggleHistoryOverlay() {
    this.isOpen = !this.isOpen;
    
    console.log('Toggling history overlay, isOpen:', this.isOpen);
    console.log('chrome.history available:', !!chrome.history);
    console.log('chrome.history.search available:', !!(chrome.history && chrome.history.search));
    
    if (this.isOpen) {
      console.log('Opening history overlay');
      console.log('DOM.historyOverlay exists:', !!DOM.historyOverlay);
      console.log('DOM.historyList exists:', !!DOM.historyList);
      DOM.historyOverlay.classList.add('open');
      if (DOM.quickHistoryBtn) {
        DOM.quickHistoryBtn.classList.add('active');
      }
      this.loadHistory('all');
    } else {
      console.log('Closing history overlay');
      DOM.historyOverlay.classList.remove('open');
      if (DOM.quickHistoryBtn) {
        DOM.quickHistoryBtn.classList.remove('active');
      }
    }
  },

  // Create drag preview element
  createDragPreview(dragData) {
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    
    if (dragData.isBulkDrag && dragData.selectedItems.length > 1) {
      preview.classList.add('multi-item');
      preview.setAttribute('data-count', dragData.selectedItems.length);
      preview.textContent = `${dragData.selectedItems.length} Einträge verschieben`;
    } else {
      preview.textContent = dragData.title || 'Link verschieben';
    }
    
    return preview;
  },

  // Create drop indicator element
  createDropIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    indicator.style.display = 'none';
    indicator.textContent = 'Zu Ordner hinzufügen';
    return indicator;
  }
};

// ===== EVENT HANDLERS =====
const EventHandlers = {
  handleFolderClick(name, folders) {
    return (e) => {
      if (!e.target.closest('.folder-actions')) {
        FolderManager.openFolder(name, folders[name]);
      }
    };
  },

  handleFolderNameClick(name, folders) {
    return (e) => {
      e.stopPropagation();
      FolderManager.openFolder(name, folders[name]);
    };
  },

  handleDragStart(e) {
    // Always use the element that registered the listener
    const li = e.currentTarget || e.target.closest('[data-link-id]');
    if (!li) return;
    State.draggedElement = li;

    li.style.opacity = '0.5';
    li.style.transform = 'scale(1.05)';
    li.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', li.outerHTML);

    const linkId = li.dataset.linkId || '';
    const linkIndex = li.dataset.index || '';
    console.log('Drag start - Link ID:', linkId, 'Index:', linkIndex, 'Element:', li);

    // Store the link data in the transfer (prefer stable ID)
    e.dataTransfer.setData('text/plain', linkId || `index-${linkIndex}`);

    // Also store the current folder for reference
    e.dataTransfer.setData('application/json', JSON.stringify({
      linkId: linkId,
      linkIndex: linkIndex,
      sourceFolder: State.currentFolder
    }));
  },

  handleDragEnd(e) {
    e.target.style.opacity = '';
    e.target.style.transform = '';
    e.target.style.boxShadow = '';
  },

  handleFolderDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },

  handleFolderDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('folder-drop-target');
    e.dataTransfer.dropEffect = 'copy';
  },

  handleFolderDragLeave(e) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('folder-drop-target');
    }
  },

  handleDragEnd(e) {
    // Remove all folder drop targets when drag ends
    document.querySelectorAll('.folder-drop-target, .drag-over').forEach(element => {
      element.classList.remove('folder-drop-target', 'drag-over');
    });
    
    // Remove all dragging states
    document.querySelectorAll('.dragging').forEach(element => {
      element.classList.remove('dragging', 'selected');
    });
    
    // Remove drag preview and drop indicator if they exist
    const dragPreview = document.querySelector('.drag-preview');
    if (dragPreview && dragPreview.parentNode) {
      dragPreview.parentNode.removeChild(dragPreview);
    }
    
    const dropIndicator = document.querySelector('.drop-indicator');
    if (dropIndicator && dropIndicator.parentNode) {
      dropIndicator.parentNode.removeChild(dropIndicator);
    }
    
    // Reset dragged element styles
    if (State.draggedElement) {
      State.draggedElement.style.opacity = '';
      State.draggedElement.style.transform = '';
      State.draggedElement.style.boxShadow = '';
      State.draggedElement = null;
    }
    
    // Clear global drag data
    window.currentDragData = null;
  }
};

// ===== FOLDER MANAGEMENT =====
const FolderManager = {
  // Debouncing for folder switching
  _folderSwitchDebounceTimer: null,
  _debouncedOpenFolder: null,

async loadFolders() {
    try {
      const folders = await Storage.getFolders();
      const folderOrder = await Storage.get('folderOrder', []);
      console.log('Loaded folders:', folders);
      console.log('Folder order:', folderOrder);
      
      // Load SVG icons once
      const [editIcon, deleteIcon] = await Promise.all(
        CONFIG.SVG_ICONS.map(icon => IconManager.loadSvgIcon(icon))
      );
      
      DOM.folderList.innerHTML = ''; // Fast clear instead of while-loop
      
      // Get ordered folder names
      const folderNames = Object.keys(folders);
      const orderedFolderNames = this.getOrderedFolderNames(folderNames, folderOrder);
      
      for (const name of orderedFolderNames) {
        const folderLinks = folders[name];
        // Ensure folder links is an array
        if (!Array.isArray(folderLinks)) {
          console.warn('Folder links is not an array for folder:', name, folderLinks);
          folders[name] = [];
        }
        const folderElement = await this.createFolderElement(name, folders[name], editIcon, deleteIcon);
        DOM.folderList.appendChild(folderElement);
      }
      
      // Mark current folder as active if one is open
      if (State.currentFolder) {
        const currentFolderItem = document.querySelector(`#folderList li[data-folder-name="${State.currentFolder}"]`);
        if (currentFolderItem) {
          currentFolderItem.classList.add('active');
        }
      }
      
      console.log('Folders loaded successfully');
    } catch (error) {
      console.error('Error loading folders:', error);
      Utils.showMessage('Fehler beim Laden der Ordner: ' + error.message, 'error');
    }
  },

  getOrderedFolderNames(folderNames, folderOrder) {
    // If no order is saved, use alphabetical order
    if (!folderOrder || folderOrder.length === 0) {
      return folderNames.sort();
    }
    
    // Create ordered list based on saved order
    const ordered = [];
    const unordered = [];
    
    // Add folders in saved order
    for (const name of folderOrder) {
      if (folderNames.includes(name)) {
        ordered.push(name);
      }
    }
    
    // Add any new folders that weren't in the saved order
    for (const name of folderNames) {
      if (!ordered.includes(name)) {
        unordered.push(name);
      }
    }
    
    return [...ordered, ...unordered.sort()];
  },

  async createFolderElement(name, links, editIcon, deleteIcon) {
    console.log('Creating folder element:', name, links);
    
    // Ensure links is an array
    if (!Array.isArray(links)) {
      console.warn('Links is not an array for folder:', name, links);
      links = [];
    }
    
      const li = document.createElement("li");
    li.setAttribute('data-folder-name', name); // Add data attribute for easy identification
    
    // Folder name with count
    const folderName = document.createElement("span");
    folderName.className = "folder-name";
    
    // Create inner span for text truncation
    const folderNameText = document.createElement("span");
    folderNameText.textContent = Utils.sanitizeInput(name);
    folderName.appendChild(folderNameText);
    
    const countElement = document.createElement("span");
    countElement.className = "folder-count";
    countElement.id = `folder-count-${name}`; // Add ID for easy updating
    countElement.textContent = `(${links ? links.length : 0})`;
    folderName.appendChild(countElement);
    

    
    // Actions container
    const actionsContainer = this.createFolderActions(name, li, editIcon, deleteIcon);
    
    li.appendChild(folderName);
    li.appendChild(actionsContainer);
    
    // Mark current folder as active
    if (name === State.currentFolder) {
      li.classList.add('active');
    }
    
    // Single click handler - only on folderName to avoid double events
    folderName.addEventListener("click", (e) => {
      e.stopPropagation();
      this.debouncedOpenFolder(name, links || []);
    });
    
    // Drag & drop handlers for links (when dragging links TO folders)
    li.addEventListener('dragover', (e) => {
      console.log('DRAGOVER on folder:', name, e);
      if ((e.dataTransfer.types.includes('application/json') && !e.dataTransfer.types.includes('folder-drag')) ||
          e.dataTransfer.types.includes('text/plain')) {
        EventHandlers.handleFolderDragOver(e);
      }
    });
    li.addEventListener('drop', (e) => {
      console.log('DROP EVENT on folder:', name, e);
      console.log('DataTransfer types:', e.dataTransfer.types);
      console.log('DataTransfer data:', e.dataTransfer.getData('text/plain'));
      
      if (e.dataTransfer.types.includes('application/json') && !e.dataTransfer.types.includes('folder-drag')) {
        LinkManager.handleFolderDrop(e, name);
      } else if (e.dataTransfer.types.includes('text/plain')) {
        HistoryManager.handleHistoryItemDrop(e, name);
      }
    });
    li.addEventListener('dragenter', (e) => {
      if ((e.dataTransfer.types.includes('application/json') && !e.dataTransfer.types.includes('folder-drag')) ||
          e.dataTransfer.types.includes('text/plain')) {
        EventHandlers.handleFolderDragEnter(e);
      }
    });
    li.addEventListener('dragleave', (e) => {
      if ((e.dataTransfer.types.includes('application/json') && !e.dataTransfer.types.includes('folder-drag')) ||
          e.dataTransfer.types.includes('text/plain')) {
        EventHandlers.handleFolderDragLeave(e);
      }
    });
    
    // Drag & drop handlers for folder reordering
    li.draggable = true;
    li.addEventListener('dragstart', (e) => this.handleFolderDragStart(e, name));
    li.addEventListener('dragover', (e) => {
      if (e.dataTransfer.types.includes('folder-drag')) {
        this.handleFolderDragOver(e);
      }
    });
    li.addEventListener('drop', (e) => {
      if (e.dataTransfer.types.includes('folder-drag')) {
        this.handleFolderDrop(e, name);
      }
    });
    li.addEventListener('dragenter', (e) => {
      if (e.dataTransfer.types.includes('folder-drag')) {
        this.handleFolderDragEnter(e);
      }
    });
    li.addEventListener('dragleave', (e) => {
      if (e.dataTransfer.types.includes('folder-drag')) {
        this.handleFolderDragLeave(e);
      }
    });
    li.addEventListener('dragend', (e) => this.handleFolderDragEnd(e));
    
    console.log('Folder element created:', li);
    return li;
  },

  // Folder reordering drag & drop handlers
  handleFolderDragStart(e, folderName) {
    e.dataTransfer.setData('text/plain', folderName);
    e.dataTransfer.setData('folder-drag', 'true');
    e.dataTransfer.effectAllowed = 'move';
    
    // Visual feedback
    const draggedElement = e.target.closest('li');
    if (draggedElement) {
      draggedElement.style.opacity = '0.7';
      draggedElement.style.transform = 'scale(1.02)';
    }
  },

  handleFolderDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },

  handleFolderDragEnter(e) {
    e.preventDefault();
    const targetLi = e.target.closest('li');
    if (targetLi) {
      // Remove styling from all folders first
      document.querySelectorAll('#folderList li').forEach(item => {
        item.classList.remove('folder-drop-target');
      });
      // Add styling to target
      targetLi.classList.add('folder-drop-target');
    }
  },

  handleFolderDragLeave(e) {
    // Only remove styling if we're leaving the folder list entirely
    const folderList = document.getElementById('folderList');
    if (!folderList.contains(e.relatedTarget)) {
      document.querySelectorAll('#folderList li').forEach(item => {
        item.classList.remove('folder-drop-target');
      });
    }
  },

  async handleFolderDrop(e, droppedFolderName) {
    e.preventDefault();
    const draggedFolderName = e.dataTransfer.getData('text/plain');
    
    if (draggedFolderName === droppedFolderName) {
      return; // Same folder
    }
    
    try {
      const folders = await Storage.getFolders();
      const folderOrder = await Storage.get('folderOrder', []);
      
      // Get current folder names in display order
      const currentFolderNames = Array.from(document.querySelectorAll('#folderList li'))
        .map(li => li.getAttribute('data-folder-name'))
        .filter(name => name && folders[name]); // Only include existing folders
      
      // Find positions
      const draggedIndex = currentFolderNames.indexOf(draggedFolderName);
      const targetIndex = currentFolderNames.indexOf(droppedFolderName);
      
      if (draggedIndex === -1 || targetIndex === -1) {
        console.error('Could not find folder positions');
        return;
      }
      
      // Create new order
      const newOrder = [...currentFolderNames];
      newOrder.splice(draggedIndex, 1); // Remove from old position
      newOrder.splice(targetIndex, 0, draggedFolderName); // Insert at new position
      
      // Save the new order
      await Storage.set({ folderOrder: newOrder });
      
      // Reload folders to reflect the new order
      await this.loadFolders();
      
      Utils.showMessage(`Ordner "${draggedFolderName}" wurde neu angeordnet.`);
    } catch (error) {
      console.error('Error reordering folders:', error);
      Utils.showMessage('Fehler beim Neuordnen der Ordner: ' + error.message, 'error');
    }
  },

  handleFolderDragEnd(e) {
    // Reset visual feedback
    const draggedElement = e.target.closest('li');
    if (draggedElement) {
      draggedElement.style.opacity = '';
      draggedElement.style.transform = '';
      draggedElement.style.boxShadow = '';
    }
    
    // Remove drop target styling from all folders
    document.querySelectorAll('#folderList li').forEach(item => {
      item.classList.remove('folder-drop-target');
    });
  },

  createFolderActions(name, li, editIcon, deleteIcon) {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "folder-actions";
    
    const editIconClone = editIcon.cloneNode(true);
    editIconClone.classList.add('folder-action-icon', 'edit-folder');
    editIconClone.title = "Ordner bearbeiten";
    editIconClone.addEventListener("click", (e) => {
      e.stopPropagation();
      this.startEditingFolder(name, li);
    });
    
    IconManager.removeInlineStyles(editIconClone);
    
    const deleteIconClone = deleteIcon.cloneNode(true);
    deleteIconClone.classList.add('folder-action-icon', 'delete-folder');
    deleteIconClone.title = "Ordner löschen";
    deleteIconClone.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteFolder(name);
    });
    
    IconManager.removeInlineStyles(deleteIconClone);
    
    // Copy to clipboard icon
    const copyIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    copyIcon.setAttribute("viewBox", "0 0 24 24");
    copyIcon.classList.add('folder-action-icon', 'copy-folder');
    copyIcon.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z"/>';
    copyIcon.title = "Links in Zwischenablage kopieren";
    copyIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      this.copyFolderToClipboard(name);
    });
    
    IconManager.removeInlineStyles(copyIcon);
    

    
    actionsContainer.appendChild(editIconClone);
    actionsContainer.appendChild(copyIcon);
    actionsContainer.appendChild(deleteIconClone);
    
    return actionsContainer;
  },

  async createFolder() {
    const name = Utils.sanitizeInput(DOM.newFolderInput.value.trim());
    if (name === "") {
      Utils.showMessage('folderNameRequired', 'error');
      return;
    }
    
    if (name.length > CONFIG.MAX_FOLDER_NAME_LENGTH) {
      Utils.showMessage('folderNameTooLong', 'error');
      return;
    }
    
    try {
      const folders = await Storage.getFolders();
      if (folders[name]) {
        Utils.showMessage('folderExists', 'error');
        return;
      }
      
      folders[name] = [];
      await Storage.setFolders(folders);
      
      // Add new folder to the order
      const folderOrder = await Storage.get('folderOrder', []);
      folderOrder.push(name);
      await Storage.set({ folderOrder });
      
      await this.loadFolders();
      DOM.newFolderInput.value = "";
      
      // Check if we should hide onboarding after creating first folder
      await OnboardingManager.checkAndShowOnboarding();
      
      Utils.showMessage('folderCreated');
    } catch (error) {
      Utils.showMessage('Fehler beim Erstellen des Ordners: ' + error.message, 'error');
    }
  },

  async startEditingFolder(folderName, li) {
    const folderNameSpan = li.querySelector('.folder-name');
    const originalText = folderNameSpan.textContent;
    
    // Create input
    const input = document.createElement("input");
    input.type = "text";
    input.value = originalText;
    input.className = "folder-edit-input";
    
    // Create save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "✓";
    saveBtn.className = "folder-edit-btn";
    
    // Create cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "✕";
    cancelBtn.className = "folder-edit-btn folder-edit-btn-cancel";
    
    // Replace content
      folderNameSpan.classList.add('is-invisible');
      li.querySelector('.folder-actions').classList.add('is-invisible');
    
    const editContainer = document.createElement("div");
    editContainer.className = "folder-edit-container";
    editContainer.appendChild(input);
    editContainer.appendChild(saveBtn);
    editContainer.appendChild(cancelBtn);
    
    li.insertBefore(editContainer, li.firstChild);
    input.focus();
    input.select();
    
    // Handle save
    const handleSave = async () => {
      const newName = Utils.sanitizeInput(input.value.trim());
      if (newName === "" || newName === originalText) {
        handleCancel();
        return;
      }
      
      if (newName.length > CONFIG.MAX_FOLDER_NAME_LENGTH) {
        Utils.showMessage(`Ordnername zu lang (max. ${CONFIG.MAX_FOLDER_NAME_LENGTH} Zeichen).`, 'error');
        return;
      }
      
      try {
        const folders = await Storage.getFolders();
        if (folders[newName]) {
          Utils.showMessage('Ordner existiert bereits.', 'error');
          return;
        }
        
        // Rename folder
        const links = folders[folderName];
        delete folders[folderName];
        folders[newName] = links;
        await Storage.setFolders(folders);
        
        // Update current folder if it was the renamed one
        if (State.currentFolder === folderName) {
          State.update({ currentFolder: newName });
          DOM.selectedFolderTitle.textContent = Utils.sanitizeInput(newName);
        }
        
        await this.loadFolders();
        Utils.showMessage('Ordner erfolgreich umbenannt.');
      } catch (error) {
        Utils.showMessage('Fehler beim Umbenennen: ' + error.message, 'error');
      }
    };
    
    // Handle cancel
    const handleCancel = () => {
      folderNameSpan.style.display = 'inline';
      li.querySelector('.folder-actions').style.display = 'flex';
      editContainer.remove();
    };
    
    // Event listeners
    saveBtn.addEventListener("click", handleSave);
    cancelBtn.addEventListener("click", handleCancel);
    
    // Enter key to save, Escape to cancel
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    });
  },

  async deleteFolder(folderName) {
    if (!confirm(`Ordner "${folderName}" und alle enthaltenen Links löschen?`)) {
      return;
    }
    
    try {
      const folders = await Storage.getFolders();
      delete folders[folderName];
      await Storage.setFolders(folders);
      
      if (State.currentFolder === folderName) {
        State.update({
          currentFolder: null,
          currentLinks: []
        });
        DOM.selectedFolderTitle.textContent = 'Links';
            DOM.saveLinkBtn.disabled = true;
    DOM.exportCsvBtn.classList.add('is-disabled');
    DOM.searchInput.disabled = true;
    DOM.searchInput.classList.add('is-disabled');
    
    // No folder selected, render empty
    await LinkManager.renderLinks([]);
      }
      
      await this.loadFolders();
             Utils.showMessage('folderDeleted');
     } catch (error) {
       Utils.showMessage('Fehler beim Löschen des Ordners: ' + error.message, 'error');
     }
   },

   
   // Share code functionality removed

  async getFolderLinkCount(folderName) {
     try {
       const folders = await Storage.getFolders();
       const links = folders[folderName] || [];
       return links.length.toString();
     } catch (error) {
       return '0';
     }
   },

       



   async copyFolderToClipboard(folderName) {
     try {
       const folders = await Storage.getFolders();
       const links = folders[folderName] || [];
       
       if (links.length === 0) {
         Utils.showMessage('Keine Links in diesem Ordner zum Kopieren.', 'error');
         return;
       }
       
       // Create clipboard content
       const clipboardContent = this.createClipboardContent(folderName, links);
       
       // Copy to clipboard
       await navigator.clipboard.writeText(clipboardContent);
       
       Utils.showMessage(`${links.length} Links aus "${folderName}" in Zwischenablage kopiert.`);
     } catch (error) {
       console.error('Error copying to clipboard:', error);
       Utils.showMessage('Fehler beim Kopieren: ' + error.message, 'error');
     }
   },

   createClipboardContent(folderName, links) {
     const linksContent = links.map((link) => {
       const name = link.name || link.url;
       return `${name}: ${link.url}`;
     }).join('\n');
     
     return linksContent;
   },

     // Debounced folder opening to prevent rapid switching
     debouncedOpenFolder(name, passedLinks) {
       clearTimeout(this._folderSwitchDebounceTimer);
       this._folderSwitchDebounceTimer = setTimeout(() => {
         this.openFolder(name, passedLinks);
       }, 50);
     },

     async openFolder(name, passedLinks) {
     console.log('Opening folder:', name, 'with passed links:', passedLinks);
     
     // ALWAYS get fresh links from storage to ensure consistency
     const folders = await Storage.getFolders();
     const freshLinks = folders[name] || [];
     console.log('Fresh links from storage for folder:', name, freshLinks);
     
     // Check if we're already in this folder with same content
     if (State.currentFolder === name && 
         JSON.stringify(State.currentLinks) === JSON.stringify(freshLinks)) {
       console.log('Already in folder with same content:', name, '- skipping re-render');
       return;
     }
     
     // Use fresh links instead of passed links for consistency
     State.update({
       currentFolder: name,
       currentLinks: freshLinks
     });
     
     // Update active state in folder list
     const folderItems = document.querySelectorAll('#folderList li');
     folderItems.forEach(item => {
       item.classList.remove('active');
     });
     
     const currentFolderItem = document.querySelector(`#folderList li[data-folder-name="${name}"]`);
     if (currentFolderItem) {
       currentFolderItem.classList.add('active');
     }
     
     DOM.selectedFolderTitle.textContent = Utils.sanitizeInput(name);
     DOM.saveLinkBtn.disabled = !State.currentTab;
     
      // Share UI entfernt
     
     // Keep header layout stable: do not hide controls, just disable
     const hasLinks = Array.isArray(freshLinks) && freshLinks.length > 0;
     if (DOM.searchInput) {
       DOM.searchInput.disabled = !hasLinks;
       DOM.searchInput.classList.toggle('is-disabled', !hasLinks);
     }
     if (DOM.exportCsvBtn) {
       DOM.exportCsvBtn.classList.toggle('is-disabled', !hasLinks);
     }
     if (DOM.openAllLinksBtn) {
       DOM.openAllLinksBtn.classList.toggle('is-disabled', !hasLinks);
     }
     
     // Render the fresh links for consistency
     console.log('Rendering fresh links in openFolder:', freshLinks);
     await LinkManager.renderLinks(freshLinks);
     SortManager.updateSortIndicators(); // Update sort indicators when opening folder
   },



     // Share UI elements removed



  // Share functionality removed - no longer needed
};

// ===== LINK MANAGEMENT =====
const LinkManager = {
       async renderLinks(links) {
    try {
      console.log('renderLinks called with:', links);
      console.log('State.currentFolder:', State.currentFolder);
      
      // NEVER fetch from storage here - links should ALWAYS be provided by caller
      // This prevents racing conditions and double-fetching
      
      // Ensure links is always provided and is an array
      if (!links) {
        console.error('renderLinks called without links - this should not happen');
        links = [];
      }
      
      // Improved skip logic: compare actual content, not just count
      const existingLinksData = Array.from(DOM.linkList.children).map(el => el.dataset.linkId);
      const newLinksData = links.map(link => link.id || Utils.generateId());
      
      if (existingLinksData.length === newLinksData.length && 
          existingLinksData.every((id, index) => id === newLinksData[index])) {
        console.log('Same links already rendered, skipping re-render');
        return;
      }
      
      console.log('Final links to render:', links);
      
      // Safe DOM element checks
      if (!DOM.linkList) {
        console.error('DOM.linkList is null - cannot render links');
        return;
      }
      
      if (!DOM.emptyState) {
        console.error('DOM.emptyState is null - cannot show empty state');
        return;
      }
      
             console.log('Clearing linkList element fast');
       DOM.linkList.innerHTML = ''; // Fast clear instead of while-loop
       
       if (!links || links.length === 0) {
         console.log('No links to render, showing empty state');
         try {
           DOM.emptyState.classList.remove('is-hidden');
           DOM.emptyState.classList.add('is-visible');
         } catch (error) {
           console.error('Error showing empty state:', error);
         }
         return;
       }
       
       console.log('Hiding empty state and rendering', links.length, 'links');
       try {
         DOM.emptyState.classList.remove('is-visible');
         DOM.emptyState.classList.add('is-hidden');
       } catch (error) {
         console.error('Error hiding empty state:', error);
       }
       
       const sortedLinks = State.currentSort ? 
         SortManager.sortLinks(links, State.currentSort.field, State.currentSort.direction) : 
         links;
      
      const [editIcon, deleteIcon] = await Promise.all(
        CONFIG.SVG_ICONS.map(icon => IconManager.loadSvgIcon(icon))
      );
      
      console.log('Creating', sortedLinks.length, 'link elements');
      sortedLinks.forEach((linkObj, index) => {
        try {
          console.log('Creating link element for:', linkObj);
          const linkElement = this.createLinkElement(linkObj, index, editIcon, deleteIcon);
          if (linkElement && DOM.linkList) {
            DOM.linkList.appendChild(linkElement);
            console.log('Successfully appended link element', index);
          } else {
            console.error('Failed to create or append link element for index:', index);
          }
        } catch (error) {
          console.error('Error creating link element for index', index, ':', error);
        }
      });
      
      console.log('Finished rendering links. DOM.linkList children:', DOM.linkList.children.length);
      
      await this.saveMissingLinkIds(links);
    } catch (error) {
      console.error('Error rendering links:', error);
      Utils.showMessage('Fehler beim Laden der Links: ' + error.message, 'error');
    }
  },

  createLinkElement(linkObj, index, editIcon, deleteIcon) {
    try {
      console.log('Creating link element for:', linkObj);
      
      const li = document.createElement("div");
      
      // Ensure link has an ID and starred property
      if (!linkObj.id) {
        linkObj.id = Utils.generateId();
      }
      if (linkObj.starred === undefined) {
        linkObj.starred = false;
      }
      
      // Validate link object
      if (!linkObj.url) {
        console.error('Link object missing URL:', linkObj);
        return null;
      }
      
      // Attach stable identifiers for robust diffs
      li.dataset.linkId = linkObj.id;
      li.setAttribute('draggable', 'true');

      // Name column with thumbnail
      const nameContainer = this.createNameContainer(linkObj);
      
      // Date column
      const dateDiv = this.createDateElement(linkObj);
      
      // Actions column
      const actionIcons = this.createActionIcons(linkObj, index, li, editIcon, deleteIcon);
      
      li.appendChild(nameContainer);
      li.appendChild(dateDiv);
      li.appendChild(actionIcons);
      
      // Drag & Drop functionality
      this.setupDragAndDrop(li, linkObj, index);
      
      console.log('Successfully created link element');
      return li;
    } catch (error) {
      console.error('Error creating link element:', error);
      return null;
    }
  },

  createNameContainer(linkObj) {
    const nameContainer = document.createElement("div");
    nameContainer.className = "link-name-container";
    
    const thumbnail = document.createElement("img");
    thumbnail.className = "link-thumbnail";
    
    // Safe URL parsing for favicon
    try {
      const url = new URL(linkObj.url);
      thumbnail.src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`;
    } catch (error) {
      console.error('Invalid URL for favicon:', linkObj.url);
      thumbnail.style.display = 'none';
    }
    
      thumbnail.alt = "";
      thumbnail.addEventListener('error', () => {
        thumbnail.style.display = 'none';
      });
    
    const a = document.createElement("a");
    a.href = linkObj.url;
    a.textContent = linkObj.name || linkObj.url;
    a.target = "_blank";
    a.className = "link-text";
    a.title = linkObj.url;

    nameContainer.appendChild(thumbnail);
    nameContainer.appendChild(a);
    
    return nameContainer;
  },

  createDateElement(linkObj) {
    const dateDiv = document.createElement("div");
    dateDiv.className = "link-date";
    if (linkObj.addedAt) {
      const date = new Date(linkObj.addedAt);
      dateDiv.textContent = I18N.formatDate(date, { short: true });
    } else {
      dateDiv.textContent = I18N.currentLanguage === 'en' ? 'Unknown' : 'Unbekannt';
    }
    return dateDiv;
  },

  createActionIcons(linkObj, index, li, editIcon, deleteIcon) {
    const actionIcons = document.createElement("div");
    actionIcons.className = "action-icons";

    // Star icon
    const starSvg = this.createStarIcon(linkObj, index);
    
    // Clone the icons for each row
    const editSvg = editIcon.cloneNode(true);
    editSvg.title = "Bearbeiten";
    editSvg.addEventListener("click", () => this.startEditing(li, linkObj, index));
    
    const deleteSvg = deleteIcon.cloneNode(true);
    deleteSvg.title = "Löschen";
    deleteSvg.classList.add('delete-icon');
    IconManager.removeInlineStyles(deleteSvg);
    deleteSvg.addEventListener("click", () => this.deleteLink(index));
    
    actionIcons.appendChild(starSvg);
    actionIcons.appendChild(editSvg);
    actionIcons.appendChild(deleteSvg);

    return actionIcons;
  },

  createStarIcon(linkObj, index) {
    const starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    starSvg.setAttribute("viewBox", "0 0 24 24");
    starSvg.classList.add('star-icon');
    
    console.log('Creating star icon for link:', linkObj.id, 'starred:', linkObj.starred);
    
    // Sichere SVG-Path-Erstellung
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
    
    if (linkObj.starred) {
      starSvg.classList.add('starred');
    } else {
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2");
    }
    
    starSvg.appendChild(path);
    
    // Remove inline styles to prevent conflicts
    IconManager.removeInlineStyles(starSvg);
    
    starSvg.title = linkObj.starred ? "Favorit entfernen" : "Als Favorit markieren";
    starSvg.addEventListener("click", () => this.toggleStar(linkObj.id));
    
    return starSvg;
  },

  setupDragAndDrop(li, linkObj, index) {
    li.draggable = true;
    li.dataset.index = index;
    li.dataset.linkId = linkObj.id;
    
    li.addEventListener('dragstart', EventHandlers.handleDragStart);
     li.addEventListener('dragover', this.handleDragOver);
     li.addEventListener('drop', this.handleDrop);
     li.addEventListener('dragenter', this.handleDragEnter);
     li.addEventListener('dragleave', this.handleDragLeave);
     li.addEventListener('dragend', (e) => {
       EventHandlers.handleDragEnd(e);
       EventHandlers.handleDragEnd(e); // Also remove folder drop targets
     });
  },

  async startEditing(li, linkObj, index) {
    // Store original content by cloning
    const originalContent = li.cloneNode(true);
    
    // Create edit input
    const input = document.createElement("input");
    input.type = "text";
    input.value = linkObj.name || linkObj.url;
    input.className = "edit-input";
    input.style.marginRight = "8px";

    // Create save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "✓";
    saveBtn.className = "edit-button";
    saveBtn.style.padding = "8px 12px";
    saveBtn.style.marginRight = "4px";
    
    // Create cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "✕";
    cancelBtn.className = "edit-button edit-button-secondary";
    cancelBtn.style.padding = "8px 12px";
    
    // Replace content safely - preserve grid layout
    while (li.firstChild) {
      li.removeChild(li.firstChild);
    }
    
    // Create placeholder for date column
    const datePlaceholder = document.createElement("div");
    datePlaceholder.className = "link-date";
    datePlaceholder.textContent = "Bearbeitung...";
    
    // Create placeholder for actions column
    const actionsPlaceholder = document.createElement("div");
    actionsPlaceholder.className = "action-icons";
    
    li.appendChild(input);
    li.appendChild(datePlaceholder);
    li.appendChild(actionsPlaceholder);
    
    // Add buttons to actions column
    actionsPlaceholder.appendChild(saveBtn);
    actionsPlaceholder.appendChild(cancelBtn);
    
    // Focus and select text
    input.focus();
    input.select();
    
    // Handle save
    const handleSave = async () => {
      const newName = Utils.sanitizeInput(input.value.trim());
      if (newName.length > 100) {
        Utils.showMessage('linkNameTooLong', 'error');
        return;
      }
      
      try {
        const folders = await Storage.getFolders();
        if (!folders[State.currentFolder]) return;
        
        folders[State.currentFolder][index].name = newName || null;
        await Storage.setFolders(folders);
        
        const freshLinks = folders[State.currentFolder];
        State.update({ currentLinks: freshLinks });
        await this.renderLinks(freshLinks);
        Utils.showMessage('Link erfolgreich umbenannt.');
      } catch (error) {
        Utils.showMessage('Fehler beim Umbenennen: ' + error.message, 'error');
      }
    };
    
    // Handle cancel
    const handleCancel = () => {
      // Replace with original content safely
      while (li.firstChild) {
        li.removeChild(li.firstChild);
      }
      // Clone and append original content
      const restoredContent = originalContent.cloneNode(true);
      while (restoredContent.firstChild) {
        li.appendChild(restoredContent.firstChild);
      }
    };
    
    // Event listeners
    saveBtn.addEventListener("click", handleSave);
    cancelBtn.addEventListener("click", handleCancel);
    
    // Enter key to save, Escape to cancel
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    });
  },

  async toggleStar(linkId) {
    try {
      const folders = await Storage.getFolders();
      if (!folders[State.currentFolder]) return;
      
      // Find link by ID instead of index
      const linkIndex = folders[State.currentFolder].findIndex(link => link.id === linkId);
      if (linkIndex === -1) {
        Utils.showMessage('linkNotFound', 'error');
        return;
      }
      
      // Toggle starred status
      folders[State.currentFolder][linkIndex].starred = !folders[State.currentFolder][linkIndex].starred;
      await Storage.setFolders(folders);
      
      // Force fresh render from storage to ensure UI consistency
      const freshLinks = folders[State.currentFolder];
      await this.renderLinks(freshLinks);
      
      const isStarred = folders[State.currentFolder][linkIndex].starred;
      console.log('Star toggled for link:', linkId, 'New starred status:', isStarred);
      Utils.showMessage(isStarred ? 'Link als Favorit markiert' : 'Favorit entfernt');
    } catch (error) {
      Utils.showMessage('Fehler beim Markieren des Links: ' + error.message, 'error');
    }
  },

  async deleteLink(index) {
    if (!confirm("Link löschen?")) return;
    
    try {
      const folders = await Storage.getFolders();
      if (!folders[State.currentFolder]) return;
      
      folders[State.currentFolder].splice(index, 1);
      await Storage.setFolders(folders);
      
      const freshLinks = folders[State.currentFolder];
      State.update({ currentLinks: freshLinks });
      
      // Hide export and copy links if no links left
      if (!freshLinks || freshLinks.length === 0) {
        DOM.exportCsvBtn.classList.add('is-disabled');
      }
      
      await this.renderLinks(freshLinks);
      
      // Update folder count
      await updateFolderCountDirect(State.currentFolder);
      
      Utils.showMessage('linkDeleted');
    } catch (error) {
      Utils.showMessage('Fehler beim Löschen des Links: ' + error.message, 'error');
    }
  },

  async handleSearch() {
    const searchTerm = Utils.sanitizeInput(DOM.searchInput.value.toLowerCase().trim());
    
    if (!searchTerm) {
      // Get fresh links from storage to ensure consistency
      const folders = await Storage.getFolders();
      const freshLinks = folders[State.currentFolder] || [];
      await this.renderLinks(freshLinks);
      return;
    }
    
    const filteredLinks = freshLinks.filter(link => {
      const name = (link.name || link.url || '').toLowerCase();
      const url = link.url.toLowerCase();
      return name.includes(searchTerm) || url.includes(searchTerm);
    });
    
    await this.renderLinks(filteredLinks);
  },

  async exportCsv() {
    if (!State.currentFolder) {
      Utils.showMessage('noFolderSelected', 'error');
      return;
    }
    
    const folders = await Storage.getFolders();
    const freshLinks = folders[State.currentFolder] || [];
    
    if (!freshLinks || freshLinks.length === 0) {
      Utils.showMessage('noLinksToExport', 'error');
      return;
    }
    
    try {
      // CSV Header
      const csvHeader = 'Name,URL,Hinzugefügt am\n';
      
      // CSV Rows
      const csvRows = freshLinks.map(link => {
        const name = (link.name || link.url || '').replace(/"/g, '""'); // Escape quotes
        const url = link.url.replace(/"/g, '""'); // Escape quotes
        const date = link.addedAt ? I18N.formatDate(new Date(link.addedAt), { short: true }) : (I18N.currentLanguage === 'en' ? 'Unknown' : 'Unbekannt');
        
        return `"${name}","${url}","${date}"`;
      }).join('\n');
      
      // Complete CSV content
      const csvContent = csvHeader + csvRows;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${State.currentFolder}_links_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Utils.showMessage(`CSV Export erfolgreich: ${freshLinks.length} Links exportiert`);
    } catch (error) {
      console.error('CSV Export error:', error);
      Utils.showMessage('Fehler beim CSV Export: ' + error.message, 'error');
    }
  },

  async copyCurrentFolderLinks() {
    try {
      if (!State.currentFolder) {
        Utils.showMessage('noFolderSelected', 'error');
        return;
      }
      
      const folders = await Storage.getFolders();
      const freshLinks = folders[State.currentFolder] || [];
      
      if (freshLinks.length === 0) {
        Utils.showMessage('Keine Links zum Kopieren vorhanden.', 'error');
        return;
      }
      
      // Create clipboard content
      const clipboardContent = this.createClipboardContent(State.currentFolder, freshLinks);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(clipboardContent);
      
      Utils.showMessage(`${freshLinks.length} Links aus "${State.currentFolder}" in Zwischenablage kopiert.`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Utils.showMessage('Fehler beim Kopieren: ' + error.message, 'error');
    }
  },

  createClipboardContent(folderName, links) {
    const linksContent = links.map((link) => {
      const name = link.name || link.url;
      return `${name}: ${link.url}`;
    }).join('\n');
    
    return linksContent;
  },

  // Rate-Limiting für Tab-Erstellung
  tabCreationCount: 0,
  lastTabCreationTime: 0,
  MAX_TABS_PER_MINUTE: 10,
  TAB_CREATION_COOLDOWN: 60000, // 1 Minute

  canCreateTab() {
    const now = Date.now();
    
    // Reset counter wenn Cooldown abgelaufen ist
    if (now - this.lastTabCreationTime > this.TAB_CREATION_COOLDOWN) {
      this.tabCreationCount = 0;
      this.lastTabCreationTime = now;
    }
    
    if (this.tabCreationCount >= this.MAX_TABS_PER_MINUTE) {
      return false;
    }
    
    this.tabCreationCount++;
    return true;
  },

  async openAllLinks() {
    if (!State.currentFolder) {
      Utils.showMessage('noFolderSelected', 'error');
      return;
    }
    
    const folders = await Storage.getFolders();
    const freshLinks = folders[State.currentFolder] || [];
    
    if (!freshLinks || freshLinks.length === 0) {
      Utils.showMessage('noLinksToOpen', 'error');
      return;
    }
    
    try {
      const validLinks = freshLinks.filter(link => {
        return Utils.isValidUrl(link.url);
      });
      
      if (validLinks.length === 0) {
        Utils.showMessage('noValidLinks', 'error');
        return;
      }
      
      // Rate-Limiting prüfen
      if (!this.canCreateTab()) {
        Utils.showMessage('Zu viele Tabs in kurzer Zeit. Bitte warten Sie einen Moment.', 'error');
        return;
      }
      
      // Open all links in new tabs
      for (const link of validLinks) {
        try {
          if (!this.canCreateTab()) {
            Utils.showMessage(`Nur ${this.MAX_TABS_PER_MINUTE} Tabs pro Minute erlaubt.`, 'error');
            break;
          }
          
          await chrome.tabs.create({ url: link.url, active: false });
          // Small delay to prevent overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error opening link:', link.url, error);
        }
      }
      
      Utils.showMessage(`${validLinks.length} Links in neuen Tabs geöffnet.`);
    } catch (error) {
      console.error('Error opening all links:', error);
      Utils.showMessage('Fehler beim Öffnen der Links: ' + error.message, 'error');
    }
  },

    async moveLinkToFolder(draggedLinkId, targetFolderName, dragData = null) {
     const folders = await Storage.getFolders();
     
     // Ensure all links have IDs
     await this.ensureLinkIds(folders);
     
     // Use the folder captured at drag start if available; fallback to current
     const sourceFolder = (dragData && dragData.sourceFolder) ? dragData.sourceFolder : State.currentFolder;
     const targetFolder = targetFolderName;
     
     if (sourceFolder === targetFolder) {
       Utils.showMessage('Link ist bereits in diesem Ordner.', 'error');
       return;
     }
     
     const sourceLinks = folders[sourceFolder] || [];
     let linkIndex = sourceLinks.findIndex(link => link.id === draggedLinkId);
     
     if (linkIndex === -1) {
       if (draggedLinkId.startsWith('index-')) {
         const indexFromId = parseInt(draggedLinkId.replace('index-', ''));
         if (!isNaN(indexFromId) && indexFromId >= 0 && indexFromId < sourceLinks.length) {
           linkIndex = indexFromId;
           console.log('Found link by index from ID:', indexFromId);
         }
       }
     }
     
     // If still not found, try using the drag data
     if (linkIndex === -1 && dragData && dragData.linkIndex !== undefined) {
       const indexFromDragData = parseInt(dragData.linkIndex);
       if (!isNaN(indexFromDragData) && indexFromDragData >= 0 && indexFromDragData < sourceLinks.length) {
         linkIndex = indexFromDragData;
         console.log('Found link by drag data index:', indexFromDragData);
       }
     }
    
    if (linkIndex === -1) {
      Utils.showMessage('linkNotFound', 'error');
      return;
    }
    
    const linkToMove = sourceLinks[linkIndex];
    const targetLinks = folders[targetFolder] || [];
    
    if (targetLinks.some(link => link.url === linkToMove.url)) {
      Utils.showMessage('Link ist bereits im Zielordner vorhanden.', 'error');
      return;
    }
    
    sourceLinks.splice(linkIndex, 1);
    folders[targetFolder] = targetLinks;
    folders[targetFolder].push(linkToMove);
    
    await Storage.setFolders(folders);
    
         // Update current view if we're in the source folder
     if (State.currentFolder === sourceFolder) {
       State.update({ currentLinks: sourceLinks });
       await this.renderLinks(sourceLinks);
     }
     
     // Update current view if we're in the target folder
     if (State.currentFolder === targetFolder) {
       const targetLinks = folders[targetFolder];
       State.update({ currentLinks: targetLinks });
       console.log('Updating target folder view with links:', targetLinks);
       await this.renderLinks(targetLinks);
     }
     
     // Update folder counts in the UI without full reload
     await this.updateFolderCounts(sourceFolder, targetFolder);
     
     // If we're not in the target folder, show a message to open it
     if (State.currentFolder !== targetFolder) {
       Utils.showMessage(`Link erfolgreich nach "${targetFolder}" verschoben. Öffnen Sie den Ordner um den Link zu sehen.`, 'success');
     } else {
       Utils.showMessage(`Link erfolgreich nach "${targetFolder}" verschoben.`, 'success');
     }
  },

    async saveMissingLinkIds(links) {
     try {
       const folders = await Storage.getFolders();
       let hasChanges = false;
       
       if (folders[State.currentFolder]) {
         for (let i = 0; i < folders[State.currentFolder].length; i++) {
           const storedLink = folders[State.currentFolder][i];
           const renderedLink = links[i];
           
           if (renderedLink && renderedLink.id && !storedLink.id) {
             folders[State.currentFolder][i].id = renderedLink.id;
             hasChanges = true;
           }
           
           // Ensure starred property exists
           if (storedLink.starred === undefined) {
             folders[State.currentFolder][i].starred = false;
             hasChanges = true;
           }
         }
         
          if (hasChanges) {
            await Storage.setFolders(folders);
            State.update({ currentLinks: folders[State.currentFolder] });
            console.log('Saved missing link IDs/starred and synced state');
          }
       }
     } catch (error) {
       console.error('Error saving missing link IDs:', error);
     }
   },

   async ensureLinkIds(folders) {
     try {
       let hasChanges = false;
       
       for (const folderName in folders) {
         const links = folders[folderName];
         for (let i = 0; i < links.length; i++) {
           if (!links[i].id) {
             links[i].id = Utils.generateId();
             hasChanges = true;
           }
           if (links[i].starred === undefined) {
             links[i].starred = false;
             hasChanges = true;
           }
         }
       }
       
       if (hasChanges) {
         await Storage.setFolders(folders);
         console.log('Ensured all links have IDs and starred properties');
       }
     } catch (error) {
       console.error('Error ensuring link IDs:', error);
     }
   },

     async updateFolderCounts(sourceFolder, targetFolder) {
     try {
       const folders = await Storage.getFolders();
       
       // Update source folder count
       if (sourceFolder) {
         await updateFolderCountDirect(sourceFolder);
       }
       
       // Update target folder count
       if (targetFolder) {
         await updateFolderCountDirect(targetFolder);
       }
     } catch (error) {
       console.error('Error updating folder counts:', error);
     }
   },

   async updateFolderCount(folderName) {
     try {
       const folders = await Storage.getFolders();
       const links = folders[folderName] || [];
       
       const countElement = document.getElementById(`folder-count-${folderName}`);
       if (countElement) {
         countElement.textContent = `(${links.length})`;
       }
     } catch (error) {
       console.error('Error updating folder count:', error);
     }
   },

   async handleFolderDrop(e, targetFolderName) {
     e.preventDefault();
     e.currentTarget.classList.remove('folder-drop-target');
     
     if (State.draggedElement) {
       State.draggedElement.style.opacity = '';
       State.draggedElement.style.transform = '';
       State.draggedElement.style.boxShadow = '';
     }
     
     const draggedLinkId = e.dataTransfer.getData('text/plain');
     let dragData = null;
     
     try {
       const jsonData = e.dataTransfer.getData('application/json');
       if (jsonData) {
         dragData = JSON.parse(jsonData);
       }
     } catch (error) {
       console.log('Could not parse drag data:', error);
     }
     
     console.log('Drop data:', { draggedLinkId, targetFolderName, dragData });
     
     if (!draggedLinkId || !targetFolderName) {
       console.log('Missing data:', { draggedLinkId, targetFolderName });
       return;
     }
     
     try {
       await this.moveLinkToFolder(draggedLinkId, targetFolderName, dragData);
     } catch (error) {
       console.error('Error in handleFolderDrop:', error);
       Utils.showMessage('Fehler beim Verschieben des Links: ' + error.message, 'error');
     }
   },

   handleDragOver(e) {
     e.preventDefault();
     e.dataTransfer.dropEffect = 'move';
   },

   handleDragEnter(e) {
     e.target.closest('div').style.borderTop = '2px solid var(--accent)';
   },

   handleDragLeave(e) {
     e.target.closest('div').style.borderTop = '';
   },

   async handleDrop(e) {
     e.preventDefault();
     const targetElement = e.target.closest('div');
     targetElement.style.borderTop = '';
     
     if (State.draggedElement && State.draggedElement !== targetElement) {
       const fromIndex = parseInt(State.draggedElement.dataset.index);
       const toIndex = parseInt(targetElement.dataset.index);
       
       if (fromIndex !== toIndex) {
         await this.reorderLinks(fromIndex, toIndex);
       }
     }
     
     State.draggedElement = null;
   },

   async reorderLinks(fromIndex, toIndex) {
     try {
       const folders = await Storage.getFolders();
       if (!folders[State.currentFolder]) return;
       
       const links = folders[State.currentFolder];
       const [movedLink] = links.splice(fromIndex, 1);
       links.splice(toIndex, 0, movedLink);
       
             await Storage.setFolders(folders);
      State.update({ currentLinks: links });
      await this.renderLinks(links);
       Utils.showMessage('Link erfolgreich verschoben');
     } catch (error) {
       Utils.showMessage('Fehler beim Verschieben: ' + error.message, 'error');
     }
   }
 };

// ===== ICON MANAGEMENT =====
const IconManager = {
  _cache: new Map(),

  async loadSvgIcon(filename) {
    try {
      if (this._cache.has(filename)) {
        return this._cache.get(filename).cloneNode(true);
      }

      const response = await fetch(chrome.runtime.getURL(filename));
      const svgText = await response.text();

      // Sichere SVG-Parsing nur für vertrauenswürdige lokale Dateien
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      
      // Prüfe auf Parser-Fehler
      const errorNode = svgDoc.querySelector('parsererror');
      if (errorNode) {
        throw new Error('Invalid SVG file: ' + filename);
      }

      const svg = svgDoc.querySelector('svg');
      if (svg) {
        svg.classList.add("icon-svg");
        this._cache.set(filename, svg.cloneNode(true));
        return svg;
      }
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
    
    const svgNS = "http://www.w3.org/2000/svg";
    const fallbackSvg = document.createElementNS(svgNS, "svg");
    fallbackSvg.setAttribute("viewBox", "0 0 24 24");
    fallbackSvg.classList.add("icon-svg");
    return fallbackSvg;
  },

  removeInlineStyles(svgElement) {
    const paths = svgElement.querySelectorAll('path');
    paths.forEach(path => {
      path.removeAttribute('fill');
    });
    
    const groups = svgElement.querySelectorAll('g');
    groups.forEach(group => {
      group.removeAttribute('fill');
    });
  }
};

// ===== SORT MANAGEMENT =====
const SortManager = {
  sortLinks(links, field, direction) {
    return [...links].sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case 'name':
          aValue = (a.name || a.url || '').toLowerCase();
          bValue = (b.name || b.url || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.addedAt || 0);
          bValue = new Date(b.addedAt || 0);
          break;
        default:
          return 0;
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

     updateSortIndicators() {
     const sortableHeaders = document.querySelectorAll('.sortable');
     sortableHeaders.forEach(header => {
       header.classList.remove('asc', 'desc');
       if (State.currentSort.field === header.dataset.sort) {
         header.classList.add(State.currentSort.direction);
       }
     });
   },

   async handleSort(field) {
     // Toggle direction if same field, otherwise set to asc
     if (State.currentSort.field === field) {
       State.update({
         currentSort: {
           ...State.currentSort,
           direction: State.currentSort.direction === 'asc' ? 'desc' : 'asc'
         }
       });
     } else {
       State.update({
         currentSort: { field, direction: 'asc' }
       });
     }
     
     // Update sort indicators
     this.updateSortIndicators();
     
     // Get fresh links from storage and sort them
     const folders = await Storage.getFolders();
     const freshLinks = folders[State.currentFolder] || [];
     const sortedLinks = this.sortLinks(freshLinks, State.currentSort.field, State.currentSort.direction);
     await LinkManager.renderLinks(sortedLinks);
   }
 };

// ===== TAB MANAGEMENT =====
const TabManager = {
  async loadCurrentTab() {
    try {
      const tabs = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(tabs);
          }
        });
      });
      
      State.update({ currentTab: tabs[0] });
      
      // Tab info UI removed - no longer needed
      
      if (State.currentFolder) {
        DOM.saveLinkBtn.disabled = false;
      }
    } catch (error) {
      Utils.showMessage('Fehler beim Laden des aktuellen Tabs: ' + error.message, 'error');
    }
  },

  async saveCurrentTab() {
    if (!State.currentFolder) {
      Utils.showMessage('noFolderSelected', 'error');
      return;
    }
    
    if (!State.currentTab) {
      Utils.showMessage('currentTabError', 'error');
      return;
    }
    
    const url = State.currentTab.url;
    
    if (!Utils.isValidUrl(url)) {
      Utils.showMessage('invalidUrl', 'error');
      return;
    }
    
    try {
      const folders = await Storage.getFolders();
      
      if (!folders[State.currentFolder]) {
        folders[State.currentFolder] = [];
      }
      
      const exists = folders[State.currentFolder].some(link => link.url === url);
      if (exists) {
        Utils.showMessage('linkAlreadyExists', 'error');
        return;
      }
      
      const newLink = { 
        id: Utils.generateId(),
        url, 
        name: State.currentTab.title || null,
        addedAt: new Date().toISOString(),
        starred: false
      };
      
      folders[State.currentFolder].push(newLink);
      await Storage.setFolders(folders);
      
      const updatedLinks = folders[State.currentFolder];
      State.update({ currentLinks: updatedLinks });
      
      if (updatedLinks && updatedLinks.length > 0) {
        if (DOM.exportCsvBtn) {
          DOM.exportCsvBtn.classList.remove('is-disabled');
        }
      }
      
      // Update UI with error handling
      try {
        // Always re-render when adding a new link
        await LinkManager.renderLinks(updatedLinks);
        await updateFolderCountDirect(State.currentFolder);
        // Don't call checkAndShowOnboarding here as it resets the view
        Utils.showMessage('linkAdded');
      } catch (uiError) {
        console.error('Error updating UI after saving:', uiError);
        // Still show success message even if UI update fails
        Utils.showMessage('Link gespeichert, aber UI-Update fehlgeschlagen.');
      }
    } catch (error) {
      console.error('Error saving tab:', error);
      Utils.showMessage('Fehler beim Speichern des Tabs: ' + error.message, 'error');
    }
  }
};

// ===== ONBOARDING MANAGEMENT =====
const OnboardingManager = {
  async checkAndShowOnboarding() {
    try {
      const folders = await Storage.getFolders();
      const hasFolders = Object.keys(folders).length > 0;
      
      if (!hasFolders) {
        this.showOnboarding();
      } else {
        this.hideOnboarding();
        // Auto-open the first folder
        await this.openFirstFolder(folders);
      }
    } catch (error) {
      console.error('Error checking onboarding state:', error);
      this.showOnboarding();
    }
  },

  async openFirstFolder(folders) {
    try {
      const folderNames = Object.keys(folders);
      if (folderNames.length > 0) {
        const firstFolderName = folderNames[0];
        const firstFolderLinks = folders[firstFolderName] || [];
        
        console.log('Auto-opening first folder:', firstFolderName);
        await FolderManager.openFolder(firstFolderName, firstFolderLinks);
      }
    } catch (error) {
      console.error('Error opening first folder:', error);
    }
  },

  showOnboarding() {
    const onboardingFlow = document.getElementById('onboardingFlow');
    const linksTable = document.querySelector('.links-table');
    const emptyState = document.getElementById('emptyState');
    
    if (onboardingFlow) {
      onboardingFlow.classList.remove('is-hidden');
      onboardingFlow.classList.add('is-visible');
    }
    if (linksTable) {
      linksTable.classList.remove('is-visible');
      linksTable.classList.add('is-hidden');
    }
    if (emptyState) {
      emptyState.classList.remove('is-visible');
      emptyState.classList.add('is-hidden');
    }
    
    // Hide other UI elements during onboarding
    const quickSaveInfo = document.querySelector('.quick-save-info');
    if (quickSaveInfo) {
      quickSaveInfo.classList.add('is-invisible'); // behält Platz, versteckt Inhalt
    }
  },

  hideOnboarding() {
    const onboardingFlow = document.getElementById('onboardingFlow');
    const linksTable = document.querySelector('.links-table');
    
    if (onboardingFlow) {
      onboardingFlow.classList.remove('is-visible');
      onboardingFlow.classList.add('is-hidden');
    }
    if (linksTable) {
      linksTable.classList.remove('is-hidden');
      linksTable.classList.add('is-visible');
    }
    
    // Show other UI elements
    const quickSaveInfo = document.querySelector('.quick-save-info');
    if (quickSaveInfo) {
      quickSaveInfo.classList.remove('is-invisible');
    }
  },

  async setupOnboardingEvents() {
    // Step 1: Create first folder
    const createFirstFolderBtn = document.getElementById('createFirstFolderBtn');
    if (createFirstFolderBtn) {
      createFirstFolderBtn.addEventListener('click', async () => {
        try {
          await FolderManager.createFolder();
          this.showStep(2);
        } catch (error) {
          Utils.showMessage('Fehler beim Erstellen des Ordners: ' + error.message, 'error');
        }
      });
    }

    // Step 2: Save first link
    const saveFirstLinkBtn = document.getElementById('saveFirstLinkBtn');
    if (saveFirstLinkBtn) {
      saveFirstLinkBtn.addEventListener('click', async () => {
        try {
          await TabManager.saveCurrentTab();
          this.showStep(3);
        } catch (error) {
          Utils.showMessage('Fehler beim Speichern des Links: ' + error.message, 'error');
        }
      });
    }

    // Step 3: Finish onboarding
    const finishOnboardingBtn = document.getElementById('finishOnboardingBtn');
    if (finishOnboardingBtn) {
      finishOnboardingBtn.addEventListener('click', () => {
        this.hideOnboarding();
        Utils.showMessage('welcomeMessage');
      });
    }
  },

  showStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= 3; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.classList.add('is-hidden');
      }
    }
    
    // Show current step
    const currentStep = document.getElementById(`step${stepNumber}`);
    if (currentStep) {
      currentStep.classList.remove('is-hidden');
    }
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOMContentLoaded - Starting initialization...');
    
    // Initialize internationalization first
    await I18N.loadLanguage();
    I18N.updateUI();
    
    // Full-Page Modus Erkennung
    if (window.location.search.includes('fullpage=true') || 
        window.innerWidth > 600) {
      document.body.classList.add('full-page');
      console.log('Full-Page Modus aktiviert');
      
      // Vollbild-Button im Full-Page Modus ausblenden
      if (DOM.fullPageBtn) {
        DOM.fullPageBtn.style.display = 'none';
      }
      
      // Sidebar Vollbild-Button im Full-Page Modus ausblenden
      if (DOM.sidebarFullPageBtn) {
        DOM.sidebarFullPageBtn.style.display = 'none';
      }
    }
    
    // Verify all DOM elements are available
    const requiredElements = [
      'folderList', 'linkList', 'newFolderName', 'createFolderBtn', 
      'saveLinkBtn', 'exportCsvBtn', 'openAllLinksBtn', 'searchInput', 'selectedFolderTitle', 
      'messagesContainer', 'emptyState', 'fullPageBtn', 'sidebarFullPageBtn'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.error('Missing DOM elements:', missingElements);
      throw new Error(`Required DOM elements not found: ${missingElements.join(', ')}`);
    }
    
    console.log('All required DOM elements found');
    
    console.log('Loading current tab...');
    await TabManager.loadCurrentTab();
    console.log('Loading folders...');
    await FolderManager.loadFolders();
    
    // Debug: Check if we have any folders and links
    const debugFolders = await Storage.getFolders();
    console.log('Debug - All folders:', debugFolders);
    console.log('Debug - Current folder:', State.currentFolder);
    console.log('Debug - Current links:', State.currentLinks);
    
      // Check and show onboarding if needed
      await OnboardingManager.checkAndShowOnboarding();
      OnboardingManager.setupOnboardingEvents();
    
    // Event listeners
    DOM.createFolderBtn.addEventListener('click', () => FolderManager.createFolder());
    DOM.saveLinkBtn.addEventListener('click', () => TabManager.saveCurrentTab());
    DOM.searchInput.addEventListener('input', () => LinkManager.handleSearch());
    DOM.exportCsvBtn.addEventListener('click', () => LinkManager.exportCsv());
    DOM.openAllLinksBtn.addEventListener('click', () => LinkManager.openAllLinks());
    // Share Code removed
    
    // Full-Page Button Event Handler
    DOM.fullPageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('popup.html?fullpage=true') 
      });
      window.close(); // Popup schließen
    });
    
    // Sidebar Full-Page Button Event Handler
    console.log('Setting up sidebar full-page button:', DOM.sidebarFullPageBtn);
    DOM.sidebarFullPageBtn.addEventListener('click', () => {
      console.log('Sidebar full-page button clicked!');
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('popup.html?fullpage=true') 
      });
      window.close(); // Popup schließen
    });
    
    // Language Dropdown Event Handlers
    if (DOM.languageToggle) {
      DOM.languageToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        I18N.toggleDropdown();
      });
    }
    
    // Language Option Event Handlers
    if (DOM.languageDropdown) {
      DOM.languageDropdown.addEventListener('click', async (e) => {
        const option = e.target.closest('.language-option');
        if (option) {
          const newLang = option.getAttribute('data-lang');
          await I18N.switchLanguage(newLang);
          I18N.closeDropdown();
        }
      });
    }
    
    // History Overlay Event Listeners
  if (DOM.quickHistoryBtn) {
    console.log('Setting up quickHistoryBtn event listener', DOM.quickHistoryBtn);
    DOM.quickHistoryBtn.addEventListener('click', () => {
      console.log('Quick history button clicked!');
      HistoryManager.toggleHistoryOverlay();
    });
  } else {
    console.error('DOM.quickHistoryBtn not found!');
  }
    DOM.closeHistoryBtn.addEventListener('click', () => HistoryManager.toggleHistoryOverlay());
    DOM.historySearchInput.addEventListener('input', (e) => HistoryManager.filterHistory(e.target.value));

    

    DOM.selectAllHistory.addEventListener('change', (e) => {
      if (e.target.checked) {
        HistoryManager.selectAllHistory();
      } else {
        HistoryManager.deselectAllHistory();
      }
    });
    DOM.addSelectedToFolderBtn.addEventListener('click', () => HistoryManager.addSelectedToFolder());
    
    // ESC key handler for closing history overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && HistoryManager.isOpen) {
        HistoryManager.toggleHistoryOverlay();
      }
    });
    
    // Click outside handler for closing history overlay
    let clickOutsideHandler = (e) => {
      if (window.ignoreNextClick === 'history-drop') {
        window.ignoreNextClick = null;
        return; // Ignoriere diesen Click nur für History-Drop!
      }
      if (HistoryManager.isOpen && 
          !DOM.historyOverlay.contains(e.target) && 
          !(DOM.quickHistoryBtn && DOM.quickHistoryBtn.contains(e.target))) {
        HistoryManager.toggleHistoryOverlay();
      }
    };
    
    document.addEventListener('click', clickOutsideHandler);
    
  // Cleanup on page unload to prevent memory leaks
  window.addEventListener('beforeunload', () => {
    Utils.clearAllTimeouts();
    console.log('Cleaned up timeouts on page unload');
  });
    
    // Copy Links functionality removed - focusing on history feature
    
    // Debug button removed - issue fixed
    

    
    // Enter key handler for folder creation
    DOM.newFolderInput.addEventListener('keypress', (e) => {
      if (e.key === "Enter") {
        FolderManager.createFolder();
      }
    });
    
    // Sort event listeners
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
      header.addEventListener("click", () => SortManager.handleSort(header.dataset.sort));
    });
    
  } catch (error) {
    console.error('Initialization error:', error);
    Utils.showMessage('Fehler beim Initialisieren der Anwendung: ' + error.message, 'error');
  }
});

// ===== GLOBAL SCOPE EXPORTS =====
// Make managers available globally for onclick handlers
window.FolderManager = FolderManager;
window.LinkManager = LinkManager;
window.TabManager = TabManager;
window.SortManager = SortManager;
window.IconManager = IconManager;
window.EventHandlers = EventHandlers;
window.HistoryManager = HistoryManager;
window.ActivitySnapshotManager = ActivitySnapshotManager;


