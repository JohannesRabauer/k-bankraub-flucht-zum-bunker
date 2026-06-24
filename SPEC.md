# Bankraub: Flucht zum Bunker – Spielspezifikation

## 1. Überblick

**Genre:** 2D-Plattformer / Endless-Runner-Hybrid  
**Inspiration:** Rayman Legends (flüssige Bewegung, präzises Plattforming)  
**Plattform:** Webbrowser (HTML5 Canvas)  
**Technologie:** TypeScript, Vite, GitHub Pages  

## 2. Spielkonzept

Der Spieler steuert einen Bankräuber, der nach einem erfolgreichen Raubüberfall durch die Stadt flieht. Die Polizei verfolgt ihn ständig. Ziel ist es, den geheimen Sicherheitsbunker am Ende des Levels zu erreichen, bevor die Polizei den Spieler einholt.

## 3. Spielmechaniken

### 3.1 Spieler-Steuerung

| Aktion | Taste | Beschreibung |
|--------|-------|-------------|
| Laufen links | A / Pfeil links | Bewegung nach links |
| Laufen rechts | D / Pfeil rechts | Bewegung nach rechts |
| Springen | W / Pfeil hoch / Leertaste | Sprung, hält man die Taste gedrückt springt man höher |
| Rutschen/Ducken | S / Pfeil runter | Rutschen unter Hindernissen, Ducken |

### 3.2 Physik

- **Schwerkraft:** Konstante Fallbeschleunigung
- **Laufgeschwindigkeit:** 300 px/s Basis, beschleunigt über 0.3s
- **Sprungkraft:** Variable Sprunghöhe (kurz/lang gedrückt)
- **Wandsprung:** Nicht vorhanden (einfach gehalten)
- **Bodenreibung:** Spieler verlangsamt beim Loslassen der Taste

### 3.3 Polizei-Verfolgung

Die Polizei ist ein visueller Verfolger am linken Bildschirmrand:

- **Basisabstand:** 200px hinter dem Spieler
- **Aufholen:** +2px/Frame wenn Spieler steht oder gegen Hindernis prallt
- **Abstand gewinnen:** -1px/Frame bei voller Geschwindigkeit
- **Game Over:** Polizei-Abstand ≤ 0px → Spieler gefangen
- **Visuell:** Blaulicht-Effekt am linken Rand, wird intensiver je näher

### 3.4 Sammelgegenstände

| Gegenstand | Punkte | Effekt |
|-----------|--------|--------|
| Münze | 10 | Nur Punkte |
| Geldbündel | 50 | Nur Punkte |
| Goldbarren | 100 | Nur Punkte |
| Speed-Boost | 0 | 3s doppelte Geschwindigkeit |
| Schild | 0 | 1x Hindernis-Kollision ignorieren |

### 3.5 Hindernisse

- **Kisten:** Überspringen erforderlich
- **Niedrige Barrieren:** Rutschen/Ducken erforderlich  
- **Gruben:** Überspringen, Hineinfallen = sofort Game Over
- **Bewegliche Plattformen:** Timing beim Springen
- **Bauzäune:** Nur mit Rutschen passierbar

## 4. Level-Design

### 4.1 Abschnitte (von links nach rechts)

1. **Bankausgang (0-500px):** Tutorial-Bereich, einfache Hindernisse
2. **Hausdächer (500-2500px):** Springen zwischen Dächern, Lücken
3. **Enge Gassen (2500-4000px):** Rutschen unter Hindernissen, enge Passagen
4. **Baustelle (4000-5500px):** Bewegliche Plattformen, Kräne
5. **Untergrund/Tunnel (5500-7000px):** Dunklere Atmosphäre, enge Gänge
6. **Bunker-Eingang (7000-7500px):** Finale Sequenz, Tor schließt sich

### 4.2 Level-Daten

- Level wird als Tilemap gespeichert (JSON)
- Tile-Größe: 32x32 Pixel
- Kamera scrollt horizontal mit dem Spieler

## 5. Spielzustände

```
MENU → PLAYING → WIN
                → GAME_OVER → MENU
```

- **MENU:** Startbildschirm mit "Drücke ENTER zum Starten"
- **PLAYING:** Aktives Spiel
- **WIN:** Bunker erreicht, Siegesanimation
- **GAME_OVER:** Polizei hat gefangen oder in Grube gefallen

## 6. Benutzeroberfläche (HUD)

- **Oben links:** Score (gesammelte Punkte)
- **Oben mitte:** Distanz zum Bunker (Fortschrittsbalken)
- **Oben rechts:** Polizei-Abstand (Warnanzeige)
- **Aktive Power-ups:** Icons unter dem HUD

## 7. Grafik-Stil

- Einfache, farbenfrohe 2D-Grafik
- Geometrische Formen und Blöcke (kein Pixel-Art nötig)
- Spieler: Blaue Figur mit Geldsack
- Polizei: Rot-blaues Licht am linken Rand
- Hintergründe: Gradient-basierte Stadtkulisse

## 8. Audio

- Kein Audio in Version 1.0 (Browser-Autoplay-Restriktionen)

## 9. Technische Architektur

```
src/
├── main.ts          # Entry Point
├── game.ts          # Game Loop, State Management
├── input.ts         # Keyboard Input Handler
├── player.ts        # Spieler-Klasse
├── police.ts        # Polizei-Verfolger
├── level.ts         # Level-Daten und Rendering
├── camera.ts        # Kamera-System
├── collectible.ts   # Sammelgegenstände
├── hud.ts           # UI/HUD Rendering
├── physics.ts       # Physik-Konstanten und Hilfsfunktionen
└── types.ts         # TypeScript Typen/Interfaces
```

## 10. Build & Deployment

- **Build-Tool:** Vite
- **Sprache:** TypeScript (strict mode)
- **Tests:** Vitest
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages
- **Workflow:** Push auf `main` → Build → Deploy auf Pages

## 11. Erfolgskriterien

- [ ] Spiel läuft flüssig bei 60 FPS
- [ ] Spieler kann laufen, springen und rutschen
- [ ] Polizei verfolgt den Spieler visuell
- [ ] Mindestens 5 verschiedene Hindernistypen
- [ ] Sammelgegenstände funktionieren
- [ ] Win/Lose-Bedingungen greifen korrekt
- [ ] Spiel wird automatisch auf GitHub Pages deployed
- [ ] Tests decken Kernlogik ab
