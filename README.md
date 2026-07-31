# Rupanti's Girlfriend's Day Website

A 5-page site: cover → love letter → photo gallery → "love you more" card → coupon.

## ⚠️ One thing you need to add: the song

I can't legally source or include copyrighted music for you, so you'll need to
drop in your own MP3:

1. Find/export the song you want as an **MP3 file**.
2. Rename it exactly to **`song.mp3`**.
3. Put it in this same top-level folder (next to `index.html`).

Every page already has an `<audio>` tag pointing at `song.mp3` with `autoplay loop`,
so once the file is there, the music will start the moment someone lands on any
page, and — because each "next" click is a real page navigation — it automatically
stops when they move to the next page and restarts fresh there.

Note: most browsers block autoplay-with-sound until the visitor has interacted
with the page at least once. I've added a fallback: if autoplay is blocked, the
music will start on the very first click/tap anywhere on the page. There's also
a small 🔊 mute button in the top-right corner of every page.

## How to deploy to Netlify

**Option A — drag and drop (easiest):**
1. Add `song.mp3` as described above.
2. Go to https://app.netlify.com/drop
3. Drag this whole folder into the browser window.
4. Netlify gives you a live link instantly.

**Option B — Netlify CLI:**
```
npm install -g netlify-cli
cd girlfriend-day
netlify deploy --prod
```

## Editing later
- Love letter text/name: `page2.html`
- Gallery photos: `images/photo1.jpeg` … `photo4.jpeg` (swap files, keep same names, or update the `src` paths in `page3.html`)
- Colors/fonts: `style.css`
