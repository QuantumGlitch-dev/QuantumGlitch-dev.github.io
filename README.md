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
