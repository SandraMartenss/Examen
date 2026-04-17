# ExamensplanerCoded

React + Vite Lernplaner mit Lern-Tab und PDF-Analyse ueber eine Serverfunktion.

## Voraussetzungen

- Node.js 18+
- npm

## Setup

1. Abhaengigkeiten installieren:
   `npm install`
2. Umgebungsvariablen anlegen:
   - `.env.example` nach `.env` kopieren
   - `OPENAI_API_KEY` eintragen (optional; ohne Key nutzt die API Mock-Daten)
3. Entwicklung starten:
   `npm run dev`

## Verfuegbare Skripte

- `npm run dev` startet Frontend und API parallel
- `npm run build` baut das Frontend
- `npm run preview` startet Vite Preview

## Struktur

- `src/` Frontend (React)
- `server/` API fuer PDF-Upload und Dokumenten-KI-Auswertung
- `vite.config.js` Vite-Konfiguration inklusive API-Proxy
