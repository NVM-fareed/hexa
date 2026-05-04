# HexaHold

> The safest and most reliable global money transaction platform.

## Project Structure

```
hexahold/
├── index.html            # Landing page
├── login.html            # Login page
├── register.html         # Registration page
├── privacy-policy.html   # Privacy policy
├── css/
│   ├── style.css         # Global styles (shared across all pages)
│   ├── auth.css          # Login & register page styles
│   └── pages.css         # Inner page styles (privacy, etc.)
├── js/
│   ├── main.js           # Global JS (cursor, navbar, scroll reveal)
│   └── auth.js           # Auth form logic (password strength, etc.)
└── assets/               # Place images, icons, and fonts here
```

## Pages

| File                  | Description                        |
|-----------------------|------------------------------------|
| `index.html`          | Main landing page with hero, features, steps, testimonials, CTA |
| `login.html`          | Two-column login layout            |
| `register.html`       | Two-column registration with features panel |
| `privacy-policy.html` | Legal privacy policy page          |

## Getting Started

No build tools required. Just open `index.html` in a browser or serve with any static file server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve .

# VS Code
# Install "Live Server" extension and click "Go Live"
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch, root folder**
4. Your site will be live at `https://yourusername.github.io/hexahold`

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JS** — No frameworks or dependencies
- **Google Fonts** — Syne (display) + DM Sans (body)

## Design Tokens

```css
--accent:   #7c5cfc   /* Primary purple */
--accent2:  #a78bfa   /* Light purple */
--gold:     #f0c060   /* Gold accent */
--bg:       #0a0a0f   /* Dark background */
--surface:  #13131f   /* Card surface */
--text:     #f0eeff   /* Primary text */
--muted:    #8880aa   /* Secondary text */
```

## License

© 2026 HexaHold Inc. All rights reserved.
