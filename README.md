# Chunky Calc

A tactile, mobile-first calculator with oversized keys, scientific functions, calculation history, themes, sound packs, and haptic feedback.

## Live app

[Open Chunky Calc](https://frenchbear1.github.io/Chunky-Calc/)

## Install as an app

- **iPhone or iPad:** Open the live app in Safari, tap **Share**, then choose **Add to Home Screen**.
- **Android:** Open the live app in Chrome and choose **Install app** or **Add to Home screen** from the browser menu.
- **Desktop:** In a supported browser, use the install button in the address bar or browser menu.

Once loaded, the calculator works offline. Settings and the last three days of calculation history are stored locally on the device.

## Features

- Basic and scientific calculator functions
- Hold-and-slide scientific function picker
- Four color themes
- Six sound packs with adjustable volume
- Optional playback through Silent Mode on supported devices
- Optional haptic feedback
- Three-day calculation history
- Keyboard support
- Responsive, safe-area-aware mobile layout
- Installable PWA with offline support

## Project structure

```text
index.html             App UI, styles, and calculator logic
manifest.webmanifest   PWA metadata and icon declarations
sw.js                  Offline app-shell cache
assets/icons/          App, browser, Safari, and platform icons
```

## Local development

Serve the repository with any static HTTP server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. A local HTTP server is required to test the service worker; opening `index.html` directly from disk is not enough.

## Deployment

GitHub Pages publishes the `main` branch from the repository root. Pushing changes to `main` updates the live app automatically after GitHub finishes the Pages build.
