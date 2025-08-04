# Link Organizer - Chrome Extension

Eine intelligente Chrome Extension zur Organisation und Verwaltung von Links mit Drag & Drop, Sharing-Funktionen und Onboarding-Flow.

## 🚀 Features

### ✅ Kernfunktionen
- **Intelligente Link-Organisation**: Ordner-basierte Struktur
- **Drag & Drop**: Links zwischen Ordnern verschieben
- **Ordner-Reihenfolge**: Individuelle Anpassung per Drag & Drop
- **Onboarding-Flow**: Geführte Einführung für neue Nutzer

### ✅ Sharing & Kollaboration
- **Share-Codes**: Ordner mit anderen teilen
- **Berechtigungen**: View/Edit Rechte
- **CSV Export**: Links als CSV exportieren
- **Clipboard Integration**: Links kopieren

### ✅ Benutzerfreundlichkeit
- **Star-System**: Favoriten markieren
- **Intelligente Suche**: Links durchsuchen
- **Sortierung**: Nach Name und Datum
- **Thumbnails**: Automatische Favicon-Anzeige

### ✅ Moderne UI/UX
- **OpenAI-inspiriertes Design**: Sauber und minimalistisch
- **Responsive Layout**: Optimiert für verschiedene Bildschirmgrößen
- **Subtile Animationen**: Smooth Transitions
- **Accessibility**: Barrierefreie Bedienung

## 📦 Installation

### Manuelle Installation
1. **Repository klonen**:
   ```bash
   git clone https://github.com/yourusername/link-organizer.git
   cd link-organizer
   ```

2. **Chrome öffnen** und zu `chrome://extensions/` navigieren

3. **Entwicklermodus aktivieren** (oben rechts)

4. **"Entpackte Erweiterung laden"** klicken

5. **Link Organizer Ordner auswählen**

### Chrome Web Store (geplant)
- Direkte Installation über Chrome Web Store

## 🎯 Verwendung

### Erste Schritte
1. **Plugin öffnen**: Klick auf das Link Organizer Icon
2. **Onboarding folgen**: 3-Schritt Einführung
3. **Ersten Ordner erstellen**: Links organisieren
4. **Links speichern**: Aktuellen Tab hinzufügen

### Ordner verwalten
- **Ordner erstellen**: Namen eingeben und "Erstellen" klicken
- **Ordner bearbeiten**: Pen-Icon klicken
- **Ordner löschen**: Trash-Icon klicken
- **Reihenfolge ändern**: Ordner per Drag & Drop verschieben

### Links verwalten
- **Link speichern**: "+ Tab hinzufügen" Button
- **Link bearbeiten**: Pen-Icon bei jedem Link
- **Link löschen**: Trash-Icon bei jedem Link
- **Favorit markieren**: Star-Icon klicken
- **Zwischen Ordnern verschieben**: Drag & Drop

### Sharing
- **Ordner teilen**: Share-Icon klicken
- **Share-Code generieren**: Berechtigung wählen
- **Code teilen**: Mit anderen Nutzern teilen
- **Code eingeben**: Share-Code in Sidebar eingeben

## 🛠️ Technische Details

### Architektur
- **Manifest V3**: Moderne Chrome Extension API
- **Vanilla JavaScript**: Keine externen Dependencies
- **Chrome Storage API**: Lokale Datenspeicherung
- **Modulare Struktur**: Saubere Code-Organisation

### Dateien
```
link-organizer/
├── manifest.json          # Extension Konfiguration
├── popup.html            # Haupt-UI
├── popup.js              # Haupt-Logik
├── style.css             # Styling
├── background.js         # Background Script
├── *.svg                 # Icons
└── README.md            # Dokumentation
```

### Module
- **State Management**: Zentrale Datenverwaltung
- **Storage Manager**: Chrome Storage Integration
- **Folder Manager**: Ordner-Verwaltung
- **Link Manager**: Link-Verwaltung
- **Onboarding Manager**: Einführungs-Flow
- **Icon Manager**: SVG Icon Handling

## 🎨 Design-Prinzipien

### OpenAI-inspiriert
- **Minimalistisch**: Fokus auf Funktionalität
- **Subtile Effekte**: Sanfte Hover-Animationen
- **Konsistente Farben**: Einheitliche Farbpalette
- **Klarer Cursor**: Intuitive Bedienung

### Responsive Design
- **Flexible Layouts**: Anpassung an verschiedene Größen
- **Touch-friendly**: Optimiert für Touch-Geräte
- **Keyboard Navigation**: Vollständige Tastatur-Bedienung

## 🔧 Entwicklung

### Setup
```bash
# Repository klonen
git clone https://github.com/yourusername/link-organizer.git
cd link-organizer

# Chrome Extension laden
# chrome://extensions/ → Entwicklermodus → Entpackte Erweiterung laden
```

### Debugging
- **Chrome DevTools**: Rechtsklick auf Extension → Untersuchen
- **Console Logs**: Detaillierte Debug-Informationen
- **Storage Inspection**: Chrome Storage API überprüfen

### Erweiterungen
- **Neue Features**: Modulare Architektur erleichtert Erweiterungen
- **Custom Icons**: SVG-basiertes Icon-System
- **Theming**: CSS-Variablen für einfache Anpassungen

## 🤝 Beitragen

### Issues melden
- **Bug Reports**: Detaillierte Beschreibung des Problems
- **Feature Requests**: Konkrete Vorschläge für neue Features
- **UI/UX Feedback**: Verbesserungsvorschläge

### Pull Requests
1. **Fork erstellen**: Repository forken
2. **Feature Branch**: Neuen Branch erstellen
3. **Änderungen**: Code implementieren
4. **Test**: Funktionalität prüfen
5. **PR erstellen**: Pull Request mit Beschreibung

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Danksagungen

- **Chrome Extension API**: Moderne Browser-Integration
- **OpenAI Design**: Inspiration für UI/UX
- **Community**: Feedback und Verbesserungsvorschläge

## 📞 Support

- **GitHub Issues**: [Issues](https://github.com/yourusername/link-organizer/issues)
- **Email**: support@linkorganizer.com (geplant)
- **Documentation**: [Wiki](https://github.com/yourusername/link-organizer/wiki) (geplant)

---

**Link Organizer** - Intelligente Link-Organisation für Chrome 🚀 