# DROP — Shopify theme (drop-shoulder tees)

A clean, streetwear-minimal Shopify theme custom-built for a **drop-shoulder t-shirt**
brand — designed around two lines: **BLANKS** (plain tees) and **PRINTS** (graphic tees).

> Online Store 2.0 theme (JSON templates, sections everywhere, theme-editor friendly).
> No paid apps required. Vanilla JS, no build step.

---

## The concept

| Line | What | Strategy |
|------|------|----------|
| **BLANKS** | Plain / non-printed tees | Premium basics → repeat & bulk orders |
| **PRINTS** | Printed / graphic tees | Limited "drops" → urgency + hype + higher margin |

Homepage flow: **Hero → Blanks/Prints split → New drops grid → "The Fit" (size guide) → Reviews → Newsletter.**

---

## What's inside

```
layout/      theme.liquid, password.liquid
templates/   index, product, collection, list-collections, cart,
             search, page, blog, article, 404, password   (all JSON / OS 2.0)
sections/    header, footer, announcement-bar, hero, dual-collections,
             featured-collection, image-with-text, testimonials, newsletter,
             rich-text, main-product, main-collection, main-cart, main-search,
             main-page, main-blog, main-article, main-404, main-password,
             main-list-collections
snippets/    product-card, price, cart-drawer, icon
assets/      base.css, theme.js
config/      settings_schema.json, settings_data.json
locales/     en.default.json
```

### Features
- Sticky header + slide-out **AJAX cart drawer** with free-shipping progress bar
- Mobile slide-out menu
- Product page: image gallery + thumbnails, **size/color variant picker**, live price,
  quantity stepper, collapsible **size guide / shipping** accordions
- Quick-add from product cards (single-variant) / "choose options" (multi-variant)
- Collection page with sorting + pagination
- Fully editable in **Online Store → Customize** (colors, fonts, logo, all section content)

---

## How to upload

**Option A — Drag & drop (easiest)**
1. Zip the **contents** of the `luxe-theme/` folder (so `layout/`, `sections/`, … are at the
   root of the zip — NOT a `luxe-theme/` folder inside).
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Click **Customize** to edit, then **Publish** when ready.

**Option B — Shopify CLI (for live preview while editing)**
```bash
npm install -g @shopify/cli @shopify/theme
cd luxe-theme
shopify theme dev --store your-store.myshopify.com
```

---

## After uploading — 5-minute setup

1. **Create 2 collections** (Products → Collections):
   - `Blanks`  → handle **blanks**
   - `Prints`  → handle **prints**
   (The homepage hero & split buttons already link to these handles.)
2. **Navigation** (Online Store → Navigation): make sure a menu with handle
   **`main-menu`** exists (Home, Blanks, Prints, About). The footer uses **`footer`**.
3. **Theme settings** (Customize → Theme settings): upload your **logo**, set **colors**,
   **fonts**, social links, and the **free-shipping threshold**.
4. **Tag products** so they fall into Blanks/Prints (or add them to the collections manually).
5. Add a **page** with handle **`size-guide`** (the "View size guide" button links to it),
   or just rely on the size-guide accordion on each product page.

---

## Customising

- **Colors & fonts:** Customize → *Theme settings → Colors / Typography*
- **Homepage:** Customize → drag/drop sections, edit hero image & text, swap collections
- **Default currency note:** the free-shipping bar & labels assume PKR (Rs). Money formatting
  follows your store's **Settings → Store details → Currency** automatically.

## Optional next steps (not included to keep it lean)
- **Customer accounts:** uses Shopify's *new customer accounts* by default. If you enable
  *classic* accounts, add `templates/customers/*` (login, register, account, …).
- Product image zoom / lightbox, predictive search, product filtering — easy to add later.

---

Built as a starting point — rename "DROP" to your brand in **Theme settings** and the shop name.
