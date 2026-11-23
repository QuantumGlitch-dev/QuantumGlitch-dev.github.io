# QuantumGlitch Studio

Source of the studio site, https://quantumglitch.eu/ (GitHub Pages, served as is from `main`; the old address https://quantumglitch-dev.github.io/ redirects there).

- `/` — home page: the studio and what it makes (Herding Cats, RandomizeIt, Grains of Salt, PenStranding)
- `/herding-cats/privacy/` — privacy policy of Herding Cats (the Google Play listing links to it, the path must not change)
- `/app-ads.txt` — Google AdMob sellers file (must stay in the root)
- `404.html`, `robots.txt`, `sitemap.xml`

The site is plain HTML, CSS and JavaScript with no build step and no third-party requests.

- `assets/home/` — the home page: `home.css`, `home.js`, images (`img/`) and fonts (`fonts/`).
  The room and the cat sprite sheets come from the game's own art; the cats are drawn on a canvas frame by frame.
- `assets/img/studio/` — the studio mark (wide logo, light and dark), favicons, the web manifest and the link preview, copied from the studio brand kit (`brand/` in the game repository, built by `tools/brand/make_brand_kit.py`). The logo SVGs have their text as outlines.
- `assets/site.css`, `assets/fonts/` — styles and font of the privacy page.

Fonts (latin subsets, variable): Inter, Fredoka, Playfair Display and Cormorant Garamond, all under the SIL Open Font License 1.1 (`assets/home/fonts/OFL-*.txt`, `assets/fonts/OFL.txt`).

The 3D book wears the cover of each edition. `assets/home/img/book/` holds `front-<lang>.webp`, `back-<lang>.webp` (672 × 1008) and `spine-<lang>.webp` (92 × 1008) for the nine languages, cut from the paperback cover files (the full wrap: back, spine and front) rendered at 200 dpi, without the 0.125 in bleed. Eight editions are 6 × 9 in with the front on the right of the wrap. The Japanese one is 5 × 7.4 in and bound on the right, so its front is on the left of the wrap, its spine is cut to the same width as the others, and the book on the page turns its spine to the right for it. The cover, the line "This cover reads" and the lit edition change language together; a click on the book or on "Turn the book over" shows the back. A picture is fetched only when its language first comes up, and the backs only when the book is turned over.

The book block lists the nine language editions of Grains of Salt. Two of them need letters the latin subsets lack, so `assets/home/fonts/` also has five tiny subsets that hold only those letters: `cormorant-uk`, `cormorant-italic-uk` and `inter-uk` for the Ukrainian title and language name (Зерна солі, Українська), `noto-serif-jp-title` and `noto-sans-jp-label` (Noto Serif JP, Noto Sans JP) for the Japanese ones (塩の粒, 日本語). If those words change, get new subsets from Google Fonts with the `text=` parameter of the CSS API.
