---
name: typography
description: House typography rules for the RSI X AI site (repo root: index.html, ja.html, styles.css, main.js). Use whenever adding or editing copy, headings, buttons or a new language version of the site.
---

# Typography rules - RSI X AI

## English copy only
- **No em dashes (—) or en dashes (–) in English text.** Use a plain hyphen with spaces around it: `word - word`.
  This applies to visible text, `<title>`, meta descriptions, alt text and form messages. Code comments may keep em dashes.
- Number ranges also use a plain hyphen: `2-3 seconds`.

## All languages
- **No lone word on the last line** of a heading or paragraph.
  - CSS: `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs/list items (already in `styles.css`, "Typography clean-up").
  - JS fallback in `main.js` glues the last two words with a no-break space (`glueLast`) and wraps the last two split words in a `nowrap` span (`splitWords`).
  - Check with a script that scans every text block at 1920 / 1440 / 1280 / 1024 / 768 / 390 px widths.
- **Type scale (px):** 100 · 80 · 44 · 28 · 22 · 16 · 14. Logo 14.4 / 7.2. Body 16/130%. `h3` = 22.
- **Text → button distance: 28px everywhere** (`--to-btn` in `styles.css`). Measure it after any layout change.
- Accent words in headings: `<em>` in `--accent` (#db62b2). Italic in Latin scripts only.

## Japanese (ja.html)
- Font stack: Inter for Latin + **Noto Sans JP** for Japanese; no negative letter-spacing on Japanese text.
- `<em>` stays pink but **not italic** (Japanese has no true italics).
- Line breaking: `word-break: auto-phrase` (keeps phrases together), `line-break: strict`; slightly taller line-height (1.5 body, 1.15 headings).
- Japanese punctuation: full-width 「、」「。」, no spaces around Japanese text; Latin product names (RSI X AI, Zoom) stay in Latin.
