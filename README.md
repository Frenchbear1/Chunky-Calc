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

## Backup, custom icons, and AI themes (v18)

Settings includes **Backup & Custom App Icon**. Export Everything creates a single
readable, versioned JSON file. Save it, then use **Verify Saved Backup** to select
that same file. Browsers cannot confirm that a download was actually saved, so
reinstall/delete instructions stay locked until this read-back check succeeds
in the current page session. Import validates the complete file, asks before
replacement, and reloads the app. Storage failures roll back through a
write-ahead recovery journal. Other applications' storage is never cleared.

**Customize App Icon** renders five deterministic Canvas designs from the active
palette and its individual colors. The selected recipe is saved locally and
included in backups; its PNGs can be regenerated without a network request.
Prepare App Icon updates Apple touch icon, favicon and manifest declarations.
When a service worker controls the page, generated PNGs are served from a local
cache. Otherwise it uses data URLs. Safari's native Add to Home Screen process
may ignore locally generated/data/service-worker icons, so check its preview;
this fully client-side design cannot guarantee iPhone Home Screen acceptance.
No icon or palette is uploaded. Existing installed iOS icons cannot be changed
by the web page. Save Icon Image also exports the chosen PNG.

The **AI** button beside the soft palettes opens the external-chat workflow.
The app copies a prompt and opens the selected chatbot's regular home page;
there is no API call or undocumented prompt URL. Add inspiration images directly
in the chatbot, paste the prompt, and bring the final JSON block back to Preview
Theme. Saving creates an ordinary custom theme. Cancel leaves the current theme
unchanged. Service definitions are centralized in `CalcFeatures.SERVICES`.

Only custom themes and specific custom part overrides have delete controls.
Confirmed deletions are permanent, including if the editor is later canceled;
they clear the temporary undo history. Group colors and built-in themes cannot
be deleted. Specific selection is the separate **Select** button.

### Storage audit and schema

The pre-v18 app used only `cc_set` and `cc_hist` in localStorage. There were no
IndexedDB stores, cookies, sessionStorage, or persistent calculator input/mode.
The service worker stored only replaceable app assets. The existing three-day
history display/retention policy is unchanged. Legacy numeric history results
and old custom palette migration remain supported.

| Store | Contents |
| --- | --- |
| `cc_set` | Active theme, named custom themes and IDs, category colors, individual overrides, sound/volume preferences, preserved legacy preference fields |
| `cc_hist` | All stored calculation records, expressions, results, timestamps |
| `cc_icon` | Selected icon's version, seed, variation, theme name and palette |
| `cc_ai` | Selected chatbot, written preferences, pasted import draft |

`CalcData.stores` is the single persistence registry. All registered stores are
exported automatically; unregistered `cc_` keys stop export instead of silently
omitting data. The internal `cc_restore_journal_v1` is recovery state, not user
content. App-shell caches are replaceable. `chunky-calc-user-icons-v1` contains
only reproducible images from `cc_icon`; the worker preserves it during updates
and deletes only this app's old versioned shell caches.

`CalcThemes.properties` derives from the same category and exact-part definitions
used by the editor. AI prompts, strict version-1 theme validation, backup
validation, and icon validation use those definitions. This editor supports
six-digit hex colors, including individual fill/text/shadow colors. It does not
support arbitrary CSS, gradients, transparency, fonts, geometry or executable
code. Unsupported properties and future format versions fail with a message.
Imported history is rendered as text, never as HTML.

### Verification

```sh
node --test tests/*.test.cjs
# With Playwright installed, and the HTTP server running:
node tests/browser.cjs
```

The browser suite covers calculator operation, specific selection and Undo,
permanent deletion, AI validation/preview/save, prompt creation and service
selection, real backup downloads and file imports, the current-session reinstall
gate, cached icon metadata, offline startup, and mobile/desktop popup bounds.
Actual iPhone Safari installation must still be checked on the device.
