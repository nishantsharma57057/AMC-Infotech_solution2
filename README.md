<<<<<<< HEAD
# AMC-Infotech_solution2
=======
# AMC Infotech Solution

A static storefront for buying, selling and comparing refurbished laptops in Agra, Uttar Pradesh. Original lilac/violet design with a Taj Mahal architectural illustration and reference laptop photographs.

## Local development

Requires Node.js 18+. No third-party packages or installation step are needed.

```sh
npm run dev
```

Open http://localhost:5173. Edit `src/` and refresh to view changes.

```sh
npm run build
npm run preview
```

Upload the contents of `dist/` to a static hosting web root. The build copies `src/` and `public/` into `dist/` without minifying the editable source.

## Project structure

- `src/index.html`: page layout, home, shop, product, saved, sell and dialog containers.
- `src/style.css`: typography, two-colour theme, responsive layouts, product image fitting and animations.
- `src/catalogue.js`: base model records and transparent photo atlas metadata/crop functions.
- `src/app.js`: sample configurations and grade prices, catalogue filters, hash routing, gallery, saved laptops, comparison, enquiry bag and sell checklist.
- `public/images/products/`: six reference PNG atlases containing multiple angles.
- `scripts/build.mjs`: build source into `dist/`.
- `scripts/serve.mjs`: development and build-preview server.
- `.openai/hosting.json`: existing Sites identity and static deployment directory; preserve this when updating the existing Site.
- `ASSET_SOURCES.md`: reference photo provenance.

## Implemented interactions

- Brand categories and text search, including processor/model keywords.
- Combined filters for brand, RAM, storage, processor, screen size, condition, operating system, use case, sample availability and price.
- OR within a filter group, AND between groups, matching RAM/storage/condition on the same configuration.
- URL-preserved filter selections, active-filter removal, clear filters, sort and grid/list views.
- Separate product routes, photo angles, zoom, keyboard and swipe controls.
- Condition and configuration options with matching sample prices.
- Browser-local saved laptops, comparison of up to three models and configuration-specific enquiry bag.
- Purchase enquiry text download and multi-step sell/exchange inspection brief download.
- Cosmetic condition guide, buying checklist, customer review connection placeholder and Sanjay Place area map.
- Approximate PIN-region guidance; it does not check a courier or promise serviceability.

## Business setup still required

This is a frontend preview. Prices, configurations and availability are samples. No online payment, stock reservation, order fulfilment, live inventory, login, admin dashboard, automated message delivery or backend database is implemented. Wishlist, comparison and enquiry bag are stored in the visitor's browser, not an account.

Downloads are prepared locally and are not submitted to the store. Replace sample inventory with actual unit photos, grades, battery health, availability and prices. Supply the business phone/email/WhatsApp, exact store pin, opening hours, written warranty/return terms and genuine review source before customer launch. The review section intentionally contains no fabricated ratings or testimonials.

The map and Google Fonts use external resources. All product images and site code are included locally. Empty ASUS/Acer/Samsung categories are supported but have no sample products; add genuine stock to populate them.

## Validation

Checked JavaScript syntax and browser flows for combined Apple + 16 GB + 512 GB filters, model/processor search, condition-price changes, photo angles, saved-laptop persistence, comparison and both text downloads. Desktop screenshots were reviewed. Mobile CSS is included; a dedicated mobile browser viewport was not available in this session.
>>>>>>> dd07cfe (Initial commit)
