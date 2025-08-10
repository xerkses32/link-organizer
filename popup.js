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
    historyToggleBtn: document.getElementById("historyToggleBtn"),
    closeHistoryBtn: document.getElementById("closeHistoryBtn"),
    historySearchInput: document.getElementById("historySearchInput"),
    historyTimeFilter: document.getElementById("historyTimeFilter"),
    selectAllHistory: document.getElementById("selectAllHistory"),
    selectedHistoryCount: document.getElementById("selectedHistoryCount"),
    historyList: document.getElementById("historyList"),
    addSelectedToFolderBtn: document.getElementById("addSelectedToFolderBtn"),
    fullPageBtn: document.getElementById("fullPageBtn"),
    sidebarFullPageBtn: document.getElementById("sidebarFullPageBtn")
  };

// ===== STATE MANAGEMENT =====
const State = {
  currentFolder: null,
  currentLinks: [],
  currentTab: null,
  currentSort: { ...CONFIG.DEFAULT_SORT },
  draggedElement: null,
  
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
  showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = type === 'error' ? 'error-message' : 'success-message';
    messageEl.textContent = message;
    
    // Clear messages container safely
    while (DOM.messagesContainer.firstChild) {
      DOM.messagesContainer.removeChild(DOM.messagesContainer.firstChild);
    }
    DOM.messagesContainer.appendChild(messageEl);
    
    setTimeout(() => {
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
      .replace(/[<>]/g, '') // Basis HTML-Tags entfernen
      .replace(/javascript:/gi, '') // JavaScript-URLs blockieren
      .replace(/on\w+=/gi, '') // Event-Handler entfernen
      .replace(/data:/gi, '') // Data-URLs blockieren
      .replace(/vbscript:/gi, '') // VBScript blockieren
      .trim();
  },

  generateId() {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  clearElement(element) {
    if (!element) {
      console.error('Cannot clear element - element is null');
      return;
    }
    
    try {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    } catch (error) {
      console.error('Error clearing element:', error);
    }
  },

  // History utility functions
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Gerade eben';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
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
    
    // Ensure all folders have arrays
    for (const folderName in folders) {
      if (!Array.isArray(folders[folderName])) {
        console.warn('Folder is not an array:', folderName, folders[folderName]);
        folders[folderName] = [];
      }
    }
    
    return folders;
  },

  async setFolders(folders) {
    return this.set({ folders });
  }
};

// ===== HISTORY MANAGER =====
const HistoryManager = {
  historyItems: [],
  selectedItems: new Set(),
  isOpen: false,

  async loadHistory(timeFilter = '168') {
    try {
      // Show loading state
      this.showLoadingState();
      
      // Calculate time range
      const now = Date.now();
      const hoursAgo = timeFilter === 'all' ? 0 : parseInt(timeFilter);
      const startTime = hoursAgo > 0 ? now - (hoursAgo * 60 * 60 * 1000) : 0;
      
      console.log('Loading history with timeFilter:', timeFilter, 'startTime:', startTime);
      
      // Check if chrome.history is available
      if (!chrome.history || !chrome.history.search) {
        throw new Error('History API nicht verfügbar. Stelle sicher, dass die "history" Permission aktiviert ist.');
      }
      
      // Query Chrome history
      const historyItems = await new Promise((resolve, reject) => {
        chrome.history.search({
          text: '',
          startTime: startTime,
          maxResults: 1000
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome history error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log('History results:', results);
            resolve(results || []);
          }
        });
      });
      
      console.log('Raw history items:', historyItems);
      
      // Filter and process history items
      this.historyItems = historyItems
        .filter(item => item.url && !item.url.startsWith('chrome://'))
        .map(item => ({
          id: item.id,
          url: item.url,
          title: item.title || item.url,
          lastVisitTime: item.lastVisitTime,
          visitCount: item.visitCount || 1,
          favicon: Utils.getFaviconUrl(item.url)
        }))
        .sort((a, b) => b.lastVisitTime - a.lastVisitTime); // Sort by most recent first
      
      console.log('Processed history items:', this.historyItems);
      console.log('History items count:', this.historyItems.length);
      
      this.renderHistoryList();
      this.updateSelectedCount();
      
    } catch (error) {
      console.error('Error loading history:', error);
      this.showErrorState(error);
    }
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
        <h4>Fehler beim Laden</h4>
        <p>${errorMessage}</p>
        <p style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
          Stelle sicher, dass die "history" Permission aktiviert ist.
        </p>
        <button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">
          Extension neu laden
        </button>
      </div>
    `;
  },

  renderHistoryList() {
    console.log('Rendering history list with', this.historyItems.length, 'items');
    Utils.clearElement(DOM.historyList);
    
    if (this.historyItems.length === 0) {
      console.log('No history items to render');
      DOM.historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h4>Kein Verlauf</h4>
          <p>Keine Browserverlauf-Einträge gefunden.</p>
        </div>
      `;
      return;
    }
    
    let currentDay = null;
    let renderedCount = 0;
    
    this.historyItems.forEach((item, index) => {
      console.log('Processing history item:', item.title, 'at index:', index);
      
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
      renderedCount++;
      
      console.log('History item added to DOM:', historyItem);
      console.log('History item in DOM:', DOM.historyList.contains(historyItem));
    });
    
    console.log('Rendered', renderedCount, 'history items');
  },

  createDayHeader(date) {
    const header = document.createElement('div');
    header.className = 'history-day-header';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dayText;
    if (date.toDateString() === today.toDateString()) {
      dayText = 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dayText = 'Gestern';
    } else {
      dayText = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    header.innerHTML = `
      <div class="history-day-title">${dayText}</div>
    `;
    
    return header;
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
    
    li.innerHTML = `
      <input type="checkbox" class="history-item-checkbox" ${isSelected ? 'checked' : ''}>
      <img src="${item.favicon}" alt="" class="history-item-favicon" onerror="this.style.display='none'">
      <div class="history-item-content">
        <div class="history-item-title">${Utils.sanitizeInput(item.title)}</div>
        <div class="history-item-url">${Utils.sanitizeInput(item.url)}</div>
      </div>
    `;
    
    // Add event listeners
    const checkbox = li.querySelector('.history-item-checkbox');
    const favicon = li.querySelector('.history-item-favicon');
    const content = li.querySelector('.history-item-content');
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
      
      // Visuelles Feedback für Drop-Zonen
      const folders = document.querySelectorAll('#folderList li');
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          folder.classList.add('folder-drop-target');
        } else {
          folder.classList.remove('folder-drop-target');
        }
      });
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
        folder.classList.remove('folder-drop-target');
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
        setTimeout(() => {
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
      
      if (li) {
        li.style.opacity = '';
        li.style.transform = '';
      }
      
      // Event-Listener entfernen
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Verzögerte Zurücksetzung der Drag-Daten, um Click-Outside-Handler zu vermeiden
      setTimeout(() => {
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
      
      // Visuelles Feedback für Drop-Zonen
      const folders = document.querySelectorAll('#folderList li');
      folders.forEach(folder => {
        const rect = folder.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          folder.classList.add('folder-drop-target');
        } else {
          folder.classList.remove('folder-drop-target');
        }
      });
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
        folder.classList.remove('folder-drop-target');
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
        setTimeout(() => {
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
      
      if (li) {
        li.style.opacity = '';
        li.style.transform = '';
      }
      
      // Event-Listener entfernen
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Verzögerte Zurücksetzung der Drag-Daten, um Click-Outside-Handler zu vermeiden
      setTimeout(() => {
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
    const lastSelectedIndex = this.getLastSelectedIndex();
    
    if (lastSelectedIndex === -1) {
      // No previous selection, just select the clicked item
      this.toggleHistoryItem(this.historyItems[endIndex].id, items[endIndex]);
      return;
    }
    
    const startIndex = Math.min(lastSelectedIndex, endIndex);
    const endIdx = Math.max(lastSelectedIndex, endIndex);
    
    // Select all items in range
    for (let i = startIndex; i <= endIdx; i++) {
      const item = this.historyItems[i];
      const element = items[i];
      if (item && element) {
        this.selectedItems.add(item.id);
        element.classList.add('selected');
        element.querySelector('.history-item-checkbox').checked = true;
      }
    }
    
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  getLastSelectedIndex() {
    const selectedItems = Array.from(this.selectedItems);
    if (selectedItems.length === 0) return -1;
    
    const lastSelectedId = selectedItems[selectedItems.length - 1];
    return this.historyItems.findIndex(item => item.id === lastSelectedId);
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
    } else {
      this.selectedItems.add(itemId);
      element.classList.add('selected');
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
    this.historyItems.forEach(item => {
      this.selectedItems.add(item.id);
    });
    this.renderHistoryList();
    this.updateSelectedCount();
    this.updateSelectAllState();
  },

  deselectAllHistory() {
    this.selectedItems.clear();
    this.renderHistoryList();
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
    
    this.renderFilteredHistory(filteredItems);
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
      DOM.historyToggleBtn.classList.add('active');
      this.loadHistory(DOM.historyTimeFilter.value);
    } else {
      console.log('Closing history overlay');
      DOM.historyOverlay.classList.remove('open');
      DOM.historyToggleBtn.classList.remove('active');
    }
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
    State.draggedElement = e.target;
    State.draggedElement.style.opacity = '0.5';
    State.draggedElement.style.transform = 'scale(1.05)';
    State.draggedElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', State.draggedElement.outerHTML);
    
    const linkId = State.draggedElement.dataset.linkId;
    const linkIndex = State.draggedElement.dataset.index;
    console.log('Drag start - Link ID:', linkId, 'Index:', linkIndex, 'Element:', State.draggedElement);
    
    // Store the link data in the transfer
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
    document.querySelectorAll('.folder-drop-target').forEach(element => {
      element.classList.remove('folder-drop-target');
    });
    
    // Reset dragged element styles
    if (State.draggedElement) {
      State.draggedElement.style.opacity = '';
      State.draggedElement.style.transform = '';
      State.draggedElement.style.boxShadow = '';
      State.draggedElement = null;
    }
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
    
    // Check if folder is shared and add share indicator
    const shares = await this.getSharedFolders();
    if (shares[name] && shares[name].length > 0) {
      const shareIndicator = document.createElement("span");
      shareIndicator.className = "folder-share-indicator";
      shareIndicator.title = `${shares[name].length} Share(s)`;
      shareIndicator.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M15 3C15 2.44772 15.4477 2 16 2C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4C15.4477 4 15 3.55228 15 3Z" fill="currentColor"/>
          <path d="M3.70663 12.7845L3.16104 12.2746L3.70664 12.7845C4.09784 12.3659 4.62287 11.8265 5.17057 11.3274C5.72852 10.8191 6.26942 10.3905 6.69641 10.1599C7.06268 9.96208 7.75042 9.84035 8.40045 9.84848C8.62464 9.85128 8.81365 9.86944 8.9559 9.89472C8.96038 10.5499 8.95447 11.7469 8.95145 12.2627C8.94709 13.0099 9.83876 13.398 10.3829 12.8878L14.9391 8.61636C15.2845 8.2926 15.2988 7.74908 14.971 7.4076L10.4132 2.65991C9.88293 2.10757 8.95 2.48291 8.95 3.24856V5.16793C8.5431 5.13738 8.0261 5.11437 7.47937 5.13009C6.5313 5.15734 5.30943 5.30257 4.4722 5.88397C4.36796 5.95636 4.26827 6.03539 4.17359 6.11781C2.49277 7.58092 2.11567 9.90795 1.8924 11.7685L1.87242 11.935C1.74795 12.9722 3.02541 13.5134 3.70663 12.7845ZM9.35701 11.7935L9.70204 12.1615L9.35701 11.7935C9.35715 11.7934 9.35729 11.7932 9.35744 11.7931L9.35701 11.7935Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
      folderName.appendChild(shareIndicator);
    }
    
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
    
    // Share icon
    const shareIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    shareIcon.setAttribute("viewBox", "0 0 24 24");
    shareIcon.classList.add('folder-action-icon', 'share-folder');
    shareIcon.innerHTML = '<path d="M15 3C15 2.44772 15.4477 2 16 2C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4C15.4477 4 15 3.55228 15 3Z" fill="currentColor"/><path d="M3.70663 12.7845L3.16104 12.2746L3.70664 12.7845C4.09784 12.3659 4.62287 11.8265 5.17057 11.3274C5.72852 10.8191 6.26942 10.3905 6.69641 10.1599C7.06268 9.96208 7.75042 9.84035 8.40045 9.84848C8.62464 9.85128 8.81365 9.86944 8.9559 9.89472C8.96038 10.5499 8.95447 11.7469 8.95145 12.2627C8.94709 13.0099 9.83876 13.398 10.3829 12.8878L14.9391 8.61636C15.2845 8.2926 15.2988 7.74908 14.971 7.4076L10.4132 2.65991C9.88293 2.10757 8.95 2.48291 8.95 3.24856V5.16793C8.5431 5.13738 8.0261 5.11437 7.47937 5.13009C6.5313 5.15734 5.30943 5.30257 4.4722 5.88397C4.36796 5.95636 4.26827 6.03539 4.17359 6.11781C2.49277 7.58092 2.11567 9.90795 1.8924 11.7685L1.87242 11.935C1.74795 12.9722 3.02541 13.5134 3.70663 12.7845ZM9.35701 11.7935L9.70204 12.1615L9.35701 11.7935C9.35715 11.7934 9.35729 11.7932 9.35744 11.7931L9.35701 11.7935Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
    shareIcon.title = "Ordner freigeben";
    shareIcon.addEventListener("click", (e) => {
      console.log('Share icon clicked for folder:', name);
      e.stopPropagation();
      this.showShareDialog(name);
    });
    
    IconManager.removeInlineStyles(shareIcon);
    
    actionsContainer.appendChild(editIconClone);
    actionsContainer.appendChild(copyIcon);
    actionsContainer.appendChild(shareIcon);
    actionsContainer.appendChild(deleteIconClone);
    
    return actionsContainer;
  },

  async createFolder() {
    const name = Utils.sanitizeInput(DOM.newFolderInput.value.trim());
    if (name === "") {
      Utils.showMessage('Bitte geben Sie einen Ordnernamen ein.', 'error');
      return;
    }
    
    if (name.length > CONFIG.MAX_FOLDER_NAME_LENGTH) {
      Utils.showMessage(`Ordnername zu lang (max. ${CONFIG.MAX_FOLDER_NAME_LENGTH} Zeichen).`, 'error');
      return;
    }
    
    try {
      const folders = await Storage.getFolders();
      if (folders[name]) {
        Utils.showMessage('Ordner existiert bereits.', 'error');
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
      
      Utils.showMessage('Ordner erfolgreich erstellt.');
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
             Utils.showMessage('Ordner erfolgreich gelöscht.');
     } catch (error) {
       Utils.showMessage('Fehler beim Löschen des Ordners: ' + error.message, 'error');
     }
   },

   async showShareDialog(folderName) {
     try {
       console.log('showShareDialog called for folder:', folderName);
       const folders = await Storage.getFolders();
       const links = folders[folderName] || [];
       
       if (links.length === 0) {
         Utils.showMessage('Keine Links in diesem Ordner zum Freigeben.', 'error');
         return;
       }
       
       // Get link count
       const linkCount = links.length.toString();
       
       // Create share dialog
       const dialog = this.createShareDialog(folderName, linkCount);
       document.body.appendChild(dialog);
       console.log('Dialog added to DOM');
       

       
     } catch (error) {
       Utils.showMessage('Fehler beim Öffnen des Share-Dialogs: ' + error.message, 'error');
     }
   },

   createShareDialog(folderName, linkCount = '0') {
     console.log('Creating share dialog for folder:', folderName);
     const dialog = document.createElement('div');
     dialog.className = 'share-dialog-overlay';
     dialog.innerHTML = `
       <div class="share-dialog">
         <div class="share-dialog-header">
           <div class="share-icon">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M15 3C15 2.44772 15.4477 2 16 2C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4C15.4477 4 15 3.55228 15 3Z" fill="currentColor"/>
               <path d="M3.70663 12.7845L3.16104 12.2746L3.70664 12.7845C4.09784 12.3659 4.62287 11.8265 5.17057 11.3274C5.72852 10.8191 6.26942 10.3905 6.69641 10.1599C7.06268 9.96208 7.75042 9.84035 8.40045 9.84848C8.62464 9.85128 8.81365 9.86944 8.9559 9.89472C8.96038 10.5499 8.95447 11.7469 8.95145 12.2627C8.94709 13.0099 9.83876 13.398 10.3829 12.8878L14.9391 8.61636C15.2845 8.2926 15.2988 7.74908 14.971 7.4076L10.4132 2.65991C9.88293 2.10757 8.95 2.48291 8.95 3.24856V5.16793C8.5431 5.13738 8.0261 5.11437 7.47937 5.13009C6.5313 5.15734 5.30943 5.30257 4.4722 5.88397C4.36796 5.95636 4.26827 6.03539 4.17359 6.11781C2.49277 7.58092 2.11567 9.90795 1.8924 11.7685L1.87242 11.935C1.74795 12.9722 3.02541 13.5134 3.70663 12.7845ZM9.35701 11.7935L9.70204 12.1615L9.35701 11.7935C9.35715 11.7934 9.35729 11.7932 9.35744 11.7931L9.35701 11.7935Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
             </svg>
           </div>
           <h3>Share-Code generieren</h3>
           <button class="close-btn" id="closeShareBtn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
               <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
             </svg>
           </button>
         </div>
         <div class="share-dialog-content">
           <div class="share-folder-info">
             <span class="folder-name">${folderName}</span>
             <span class="folder-count">${linkCount} Links</span>
             <p class="share-info-text">Ein kurzer Code wird generiert, den Sie per Email oder Chat teilen können.</p>
           </div>
           
           <div class="share-code-display" id="shareCodeDisplay" style="display: none;">
             <div class="code-field">
               <input type="text" id="generatedCode" readonly placeholder="Code wird generiert..." />
               <button class="copy-code-btn" id="copyCodeBtn" title="Code kopieren">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                   <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z" fill="currentColor"/>
                 </svg>
               </button>
             </div>
           </div>

           <div class="share-permissions">
             <div class="permission-tabs">
               <button class="permission-tab active" data-permission="view">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                   <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                 </svg>
                 Nur anzeigen
               </button>
               <button class="permission-tab" data-permission="edit">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                   <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                   <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                 </svg>
                 Bearbeiten
               </button>
             </div>
           </div>
           <div class="share-actions">
             <button class="share-btn" id="generateShareBtn" data-folder-name="${folderName}">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                 <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" stroke-width="2"/>
                 <polyline points="16,6 12,2 8,6" stroke="currentColor" stroke-width="2"/>
                 <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" stroke-width="2"/>
               </svg>
               Code generieren
             </button>
           </div>
         </div>
       </div>
     `;
     
     // Add event listeners for permission tabs
     setTimeout(() => {
       const tabs = dialog.querySelectorAll('.permission-tab');
       tabs.forEach(tab => {
         tab.addEventListener('click', () => {
           tabs.forEach(t => t.classList.remove('active'));
           tab.classList.add('active');
  });
});

       // Add event listeners for buttons
       const closeBtn = dialog.querySelector('#closeShareBtn');
       const generateBtn = dialog.querySelector('#generateShareBtn');
       
       if (closeBtn) {
         closeBtn.addEventListener('click', () => {
           console.log('Close button clicked');
           dialog.remove();
         });
       }
       
       if (generateBtn) {
         generateBtn.addEventListener('click', async () => {
           console.log('Generate button clicked');
           const folderName = generateBtn.dataset.folderName;
           try {
             const shareCode = await FolderManager.generateShareCodeAndDisplay(folderName, dialog);
             // Don't close dialog automatically, let user copy the code
           } catch (error) {
             console.error('Error generating share code:', error);
           }
         });
       }
       
       // Add copy button event listener
       const copyBtn = dialog.querySelector('#copyCodeBtn');
       if (copyBtn) {
         copyBtn.addEventListener('click', async () => {
           const codeInput = dialog.querySelector('#generatedCode');
           if (codeInput && codeInput.value) {
             try {
               await navigator.clipboard.writeText(codeInput.value);
               Utils.showMessage('Code in Zwischenablage kopiert!');
             } catch (error) {
               console.error('Error copying code:', error);
               Utils.showMessage('Fehler beim Kopieren: ' + error.message, 'error');
             }
           }
         });
       }
     }, 0);
     
     console.log('Share dialog created successfully');
     return dialog;
   },

  async getFolderLinkCount(folderName) {
     try {
       const folders = await Storage.getFolders();
       const links = folders[folderName] || [];
       return links.length.toString();
     } catch (error) {
       return '0';
     }
   },

       async generateShareCode(folderName) {
      try {
        const activeTab = document.querySelector('.permission-tab.active');
        
        if (!activeTab) {
          Utils.showMessage('Bitte eine Berechtigung auswählen.', 'error');
          return;
        }
        
        const permission = activeTab.dataset.permission;
        
        // Generate share code
        const shareCode = this.generateShareCodeString(folderName, permission);
        console.log('Share code generated:', shareCode);
        
        // Store share data
        await this.storeShareData(folderName, permission, shareCode);
        
        // Copy code to clipboard
        await navigator.clipboard.writeText(shareCode);
        
        Utils.showMessage(`✅ Share-Code generiert: ${shareCode}`);
        
        return shareCode;
      } catch (error) {
        Utils.showMessage('Fehler beim Generieren: ' + error.message, 'error');
        throw error;
      }
    },

    async generateShareCodeAndDisplay() { return; },

   generateShareCodeString() { return ''; },

   async storeShareData() { return; },

   async getSharedFolders() { return {}; },

   async removeShare() { return; },

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
     
     // Check if folder is shared and show share code display
     // Share Code removed
     const shareCodeDisplaySection = document.getElementById('shareCodeDisplaySection');
     const displayedShareCode = document.getElementById('displayedShareCode');
     const copyDisplayedCodeBtn = document.getElementById('copyDisplayedCodeBtn');
     
     if (shares[name] && shares[name].length > 0) {
       // Show share code display and populate with first share code
       if (shareCodeDisplaySection) {
         shareCodeDisplaySection.classList.remove('is-hidden');
         shareCodeDisplaySection.classList.add('is-visible');
       }
       if (displayedShareCode) {
         displayedShareCode.value = shares[name][0].code;
       }
       
       // Add copy functionality
       if (copyDisplayedCodeBtn) {
         copyDisplayedCodeBtn.onclick = async () => {
           try {
             await navigator.clipboard.writeText(shares[name][0].code);
             Utils.showMessage('Share-Code in Zwischenablage kopiert.');
           } catch (error) {
             Utils.showMessage('Fehler beim Kopieren: ' + error.message, 'error');
           }
         };
       }
       
       // Add remove share functionality
       const removeShareBtn = document.getElementById('removeShareBtn');
       if (removeShareBtn) {
         // Load trash SVG icon
         const trashIcon = await IconManager.loadSvgIcon('trash.svg');
         if (trashIcon) {
           trashIcon.classList.add('delete-icon');
           IconManager.removeInlineStyles(trashIcon);
           removeShareBtn.appendChild(trashIcon);
         }
         
         removeShareBtn.onclick = async () => {
           try {
                       await this.removeShare(name, shares[name][0].code);
          // Hide the share code display
          if (shareCodeDisplaySection) {
            shareCodeDisplaySection.classList.remove('is-visible');
            shareCodeDisplaySection.classList.add('is-hidden');
          }
          // Update only share indicators, not full reload
          await this.updateFolderShareIndicators();
             Utils.showMessage('Teilen erfolgreich beendet.');
           } catch (error) {
             Utils.showMessage('Fehler beim Beenden des Teilens: ' + error.message, 'error');
           }
         };
       }
     } else {
       // Hide share code display if folder is not shared
       if (shareCodeDisplaySection) {
         shareCodeDisplaySection.classList.remove('is-visible');
         shareCodeDisplaySection.classList.add('is-hidden');
       }
     }
     
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



   createSharedFolderElement(folderName, share) {
     const li = document.createElement('li');
     li.className = 'shared-folder-item';
     
     // Sichere DOM-Erstellung ohne innerHTML
     const infoDiv = document.createElement('div');
     infoDiv.className = 'shared-folder-info';
     
     const nameSpan = document.createElement('span');
     nameSpan.className = 'shared-folder-name';
     nameSpan.textContent = Utils.sanitizeInput(folderName);
     
     const codeSpan = document.createElement('span');
     codeSpan.className = 'shared-folder-code';
     codeSpan.textContent = Utils.sanitizeInput(share.code);
     
     const permissionSpan = document.createElement('span');
     permissionSpan.className = 'shared-folder-permission';
     permissionSpan.textContent = share.permission === 'view' ? 'Nur anzeigen' : 'Bearbeiten';
     
     const removeBtn = document.createElement('button');
     removeBtn.className = 'remove-share-btn';
     removeBtn.textContent = '✕';
     removeBtn.addEventListener('click', () => {
       FolderManager.removeShare(folderName, share.code);
     });
     
     infoDiv.appendChild(nameSpan);
     infoDiv.appendChild(codeSpan);
     infoDiv.appendChild(permissionSpan);
     li.appendChild(infoDiv);
     li.appendChild(removeBtn);
     
     return li;
   },

   async enterShareCode() {
     try {
       const code = DOM.shareCodeInput.value.trim().toUpperCase();
       
       if (!code) {
         Utils.showMessage('Bitte einen Share-Code eingeben.', 'error');
         return;
       }
       
       if (!code.startsWith('LINK-')) {
         Utils.showMessage('Ungültiger Share-Code Format. Erwartet: LINK-XXXXXX', 'error');
         return;
       }
       
       const shares = await this.getSharedFolders();
       
       // Search for the code in all shares
       for (const [folderName, shareList] of Object.entries(shares)) {
         const share = shareList.find(s => s.code === code);
         if (share) {
           // Check if share is expired
           const expiresAt = new Date(share.expiresAt);
           if (expiresAt < new Date()) {
             Utils.showMessage('Share-Code ist abgelaufen.', 'error');
             return;
           }
           
           // Open the folder with fresh links from storage
           const folders = await Storage.getFolders();
           const folderLinks = folders[folderName] || [];
           await this.openFolder(folderName, folderLinks);
           DOM.shareCodeInput.value = '';
           Utils.showMessage(`Ordner "${folderName}" erfolgreich geöffnet.`);
           return;
         }
       }
       
       Utils.showMessage('Ungültiger Share-Code.', 'error');
       
     } catch (error) {
       Utils.showMessage('Fehler beim Öffnen des Share-Codes: ' + error.message, 'error');
     }
   },

  // Efficient update functions to avoid full reload
   async updateFolderShareIndicators() {
    try {
      const shares = {}; // removed
      const folderItems = document.querySelectorAll('#folderList li[data-folder-name]');
      
      folderItems.forEach(item => {
        const folderName = item.dataset.folderName;
        const shareIndicator = item.querySelector('.folder-share-indicator');
        
        if (shares[folderName] && shares[folderName].length > 0) {
          if (!shareIndicator) {
            // Add share indicator
            const newIndicator = document.createElement('span');
            newIndicator.className = 'folder-share-indicator';
            newIndicator.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3C15 2.44772 15.4477 2 16 2C19.3137 2 22 4.68629 22 8V16C22 19.3137 19.3137 22 16 22H8C4.68629 22 2 19.3137 2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4C15.4477 4 15 3.55228 15 3Z"/></svg>`;
            item.querySelector('.folder-name').appendChild(newIndicator);
          }
        } else {
          if (shareIndicator) {
            shareIndicator.remove();
          }
        }
      });
    } catch (error) {
      console.error('Error updating share indicators:', error);
    }
  }
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
      dateDiv.textContent = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } else {
      dateDiv.textContent = "Unbekannt";
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
    
    if (linkObj.starred) {
      starSvg.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
      starSvg.classList.add('starred');
    } else {
      starSvg.innerHTML = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="2"/>';
    }
    
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
        Utils.showMessage('Name zu lang (max. 100 Zeichen).', 'error');
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
        Utils.showMessage('Link konnte nicht gefunden werden.', 'error');
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
      
      Utils.showMessage('Link erfolgreich gelöscht.');
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
      Utils.showMessage('Kein Ordner ausgewählt.', 'error');
      return;
    }
    
    const folders = await Storage.getFolders();
    const freshLinks = folders[State.currentFolder] || [];
    
    if (!freshLinks || freshLinks.length === 0) {
      Utils.showMessage('Keine Links zum Exportieren vorhanden.', 'error');
      return;
    }
    
    try {
      // CSV Header
      const csvHeader = 'Name,URL,Hinzugefügt am\n';
      
      // CSV Rows
      const csvRows = freshLinks.map(link => {
        const name = (link.name || link.url || '').replace(/"/g, '""'); // Escape quotes
        const url = link.url.replace(/"/g, '""'); // Escape quotes
        const date = link.addedAt ? new Date(link.addedAt).toLocaleDateString('de-DE') : 'Unbekannt';
        
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
        Utils.showMessage('Kein Ordner ausgewählt.', 'error');
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
      Utils.showMessage('Kein Ordner ausgewählt.', 'error');
      return;
    }
    
    const folders = await Storage.getFolders();
    const freshLinks = folders[State.currentFolder] || [];
    
    if (!freshLinks || freshLinks.length === 0) {
      Utils.showMessage('Keine Links zum Öffnen vorhanden.', 'error');
      return;
    }
    
    try {
      const validLinks = freshLinks.filter(link => {
        return Utils.isValidUrl(link.url);
      });
      
      if (validLinks.length === 0) {
        Utils.showMessage('Keine gültigen Links zum Öffnen gefunden.', 'error');
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
     
     const sourceFolder = State.currentFolder;
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
      Utils.showMessage('Link konnte nicht gefunden werden.', 'error');
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

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgText;

      const svg = tempDiv.querySelector('svg');
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
      Utils.showMessage('Bitte zuerst einen Ordner auswählen.', 'error');
      return;
    }
    
    if (!State.currentTab) {
      Utils.showMessage('Aktueller Tab konnte nicht geladen werden.', 'error');
      return;
    }
    
    const url = State.currentTab.url;
    
    if (!Utils.isValidUrl(url)) {
      Utils.showMessage('Ungültige URL vom aktuellen Tab.', 'error');
      return;
    }
    
    try {
      const folders = await Storage.getFolders();
      
      if (!folders[State.currentFolder]) {
        folders[State.currentFolder] = [];
      }
      
      const exists = folders[State.currentFolder].some(link => link.url === url);
      if (exists) {
        Utils.showMessage('Link bereits vorhanden.', 'error');
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
        Utils.showMessage('Tab erfolgreich hinzugefügt.');
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
        Utils.showMessage('Willkommen bei Link Organizer! 🎉');
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
    
    // History Overlay Event Listeners
    DOM.historyToggleBtn.addEventListener('click', () => HistoryManager.toggleHistoryOverlay());
    DOM.closeHistoryBtn.addEventListener('click', () => HistoryManager.toggleHistoryOverlay());
    DOM.historySearchInput.addEventListener('input', (e) => HistoryManager.filterHistory(e.target.value));
    DOM.historyTimeFilter.addEventListener('change', (e) => HistoryManager.loadHistory(e.target.value));
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
          !DOM.historyToggleBtn.contains(e.target)) {
        HistoryManager.toggleHistoryOverlay();
      }
    };
    
    document.addEventListener('click', clickOutsideHandler);
    
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


