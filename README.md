# SVARA · South Indian Heritage

Concept saree website with six pages: Home, Sarees, Muhurtham, Our Story, Journal and Contact.

- `index.html` … `contact.html`: one file per page
- `assets/`: shared styles (`site.css`), shared engine (`site.js`), sample data (`data.js`), one script per page
- `img/`: photography, logo, kolam motif
- `film-hd/`: every frame of every clip at 1920×1080, upscaled with Lanczos and edge-aware sharpening, packed 4 per sprite sheet
- `film-sd/`: small preview sheets that load first so each film plays at once; the HD frames replace them as they arrive

The bag and wishlist are kept in the browser across pages. Open `index.html` directly, serve the folder locally (`npx serve .`), or push it to GitHub Pages as is.

Concept website · sample products and prices · not a real store
