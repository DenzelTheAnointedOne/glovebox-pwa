# Glovebox (PWA)

Installable web app that helps people plan and manage the move from a home into living in their car.
Works on current iPhones (iOS 16.4+) and Android phones. Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Features

- **Plan:** move-out date, vehicle, who's coming and climate. Shows a countdown, the next three tasks and tips for the situation.
- **Checklist:** 19 tasks grouped from 3–4 weeks out through the first month. Safety items are flagged.
- **Budget:** compares housing costs with car-life costs and estimates how long it takes to save a move-in fund.
- **Tonight:** a nightly safety routine that resets each day, plus tips on choosing where to park.
- **Help:** 211, 988, the domestic violence hotline and 911, with Call, Text and Copy buttons.
- **Works offline** after the first visit. Fonts and icons are bundled, so nothing loads from other sites.
- **Install prompt:** Android shows an Install button. iPhone shows "Share → Add to Home Screen" instructions.
- **Update banner:** when you deploy a new version, open apps show an "Update" button.
- **Private:** all data stays in the browser's storage on the device. There is no backend.

## Files

```
index.html             App shell and iOS/Android meta tags
styles.css             Light and dark theme, safe-area handling for notches and the home bar
app.js                 Content, state, rendering, install prompt, service worker registration
sw.js                  Service worker: offline cache and updates
manifest.webmanifest   Name, colors, icons, home-screen shortcuts (Tonight, Help)
icons/                 App icons, including maskable icons for Android and apple-touch-icon for iOS
fonts/                 Archivo and Atkinson Hyperlegible (SIL Open Font License)
```

To change checklist items, tips or hotlines, edit the arrays at the top of `app.js`.

## Run locally

Service workers need `localhost` or HTTPS.

```bash
cd glovebox-pwa
python3 -m http.server 8080      # or: npx serve .
```

Open http://localhost:8080. To test on a phone, deploy it (below), because phones need HTTPS.

## Deploy (any static HTTPS host)

**GitHub Pages:** push this folder to a repo, then go to Settings → Pages → Deploy from a branch → `main` / root.
Your app will be at `https://<username>.github.io/<repo>/`. All paths are relative, so a subfolder URL works.

**Netlify or Vercel:** drag the folder into Netlify Drop, or run `npx vercel` in this folder.

## Install on a phone

- **iPhone (Safari):** open the URL, tap Share, then Add to Home Screen.
- **Android (Chrome):** open the URL and tap Install on the card, or use ⋮ → Install app.

## Shipping an update

1. Edit your files.
2. In `sw.js`, bump `VERSION` (for example `glovebox-v1.0.1`). Also bump `APP_VERSION` in `app.js`.
3. Deploy. Installed apps show "A new version of Glovebox is ready" with an Update button.

If you add a new file, also add it to the `SHELL` list in `sw.js` so it's available offline.

## iOS notes

- On iOS, push notifications only work after the app is added to the home screen (iOS 16.4+). This version doesn't use them yet.
- Safari can clear website data for sites you haven't used in a while. Home-screen apps are exempt, so encourage users to install.
- Call and Text buttons use `tel:` and `sms:` links, which open the phone and Messages apps.

## Next steps

- Map of safe parking lots, gyms, showers and libraries
- Optional account with cloud sync so data moves between devices
- Reminder notifications for the nightly routine and morning check-in
