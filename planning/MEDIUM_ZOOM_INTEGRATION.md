# Medium-Zoom Integration

**Issue:** #24
**Status:** Planning
**Scope:** Add [medium-zoom](https://github.com/francoischalifour/medium-zoom) to the Starlight docs site so readers can click screenshots to enlarge them.

---

## Why medium-zoom

Screenshots in the docs are ~1440px wide source images rendered inline at page width (~700-900px). Detail is lost without zoom. Options:

| Option | Size | Pros | Cons |
|--------|------|------|------|
| medium-zoom | ~3 KB | Zero config, keyboard + mobile handled, works with Starlight | Only zoom, no galleries |
| PhotoSwipe | ~30 KB | Full gallery features, swipe between images | Overkill for docs |
| DIY CSS/JS | variable | Full control | Reinvents the wheel |
| Do nothing | 0 KB | Simplest | Poor reading experience |

**Chosen: medium-zoom.** Smallest, most battle-tested, used by Next.js docs, React docs, many Starlight sites.

---

## Decisions

### Scope: every image

Apply medium-zoom globally to every `<img>` in docs pages. Not just screenshots. Reasoning:

- Any inline image in docs benefits from zoom
- Opt-in would require adding a class (or a Starlight component override) to every screenshot — fragile, easy to forget
- The opt-out is trivial if we ever need to exclude an image (add `no-zoom` class)

### Integration: global script in Starlight layout

Starlight supports [component overrides](https://starlight.astro.build/guides/overriding-components/). The cleanest place to add medium-zoom is the `Head.astro` override — a `<script>` that activates medium-zoom on all images once the page has loaded.

Pseudocode:

```astro
---
import Default from '@astrojs/starlight/components/Head.astro';
---
<Default><slot /></Default>
<script>
  import mediumZoom from 'medium-zoom';
  mediumZoom('img:not(.no-zoom)', {
    background: 'rgba(0, 0, 0, 0.85)',
    margin: 24,
  });
</script>
```

### Mobile behaviour

medium-zoom handles mobile natively — tap to enlarge, tap again to close, pinch-zoom while open. Verify during testing that this still works (Starlight doesn't interfere).

### Accessibility

medium-zoom provides keyboard support out of the box:

- **Esc** — close the zoomed image
- **Focus** — zoomed image gets focus; background receives `aria-hidden`
- **Alt text** — preserved (zoom doesn't replace the original `<img>`, it clones it)

Spot-check with a screen reader during review.

### Scroll-while-open

medium-zoom closes the zoomed image when the user scrolls. This is standard behaviour. Good default — prevents awkward partial-scroll states.

### Dark mode

Check that the zoom background contrasts with both Starlight themes (light / dark). `rgba(0, 0, 0, 0.85)` should be fine in both but verify visually.

---

## Implementation steps

Order matters — keep each step independently committable.

1. **Install package** — `cd docs && npm install medium-zoom`
2. **Create Head override** — `docs/src/components/Head.astro` extending the default Starlight `Head` component
3. **Tell Starlight to use it** — add `components: { Head: './src/components/Head.astro' }` to `starlight()` config in `astro.config.mjs`
4. **Add the zoom script** — inside the override, a `<script>` tag invoking `mediumZoom()`
5. **Verify locally** — `npm run dev`, click a screenshot on the Creating a Workflow page
6. **Verify mobile** — open the local dev server via IP on a phone, tap a screenshot
7. **Verify dark mode** — toggle theme in the header, zoom a screenshot
8. **Ship** — commit, push, PR to main, merge, deploy

---

## Risks

- **Starlight API churn** — `Head.astro` override is a supported extension point but could change in major Starlight versions. Mitigation: pin Starlight version in `package.json`, upgrade deliberately. Low risk — this is a documented API.
- **Conflict with Starlight's own scripts** — Starlight's theme toggle and navigation use client-side JS. medium-zoom operates on `<img>` tags independently; unlikely to conflict but verify in practice.
- **Screenshot file size** — zoomed images are served at full resolution. Our PNGs are ~100KB each; at full-screen they're readable and load instantly. No action needed.
- **SSR considerations** — `mediumZoom()` runs client-side (it touches `document`). Astro's `<script>` tag runs on the client by default; no SSR issue. Don't accidentally move it to frontmatter.

---

## Testing checklist

- [ ] Click a screenshot — zooms smoothly
- [ ] Click the dimmed background — closes
- [ ] Press Esc — closes
- [ ] Scroll — closes
- [ ] Mobile tap — zooms
- [ ] Mobile pinch while zoomed — works
- [ ] Dark mode — zoom background contrasts correctly
- [ ] Alt text preserved on zoomed image
- [ ] No console errors on page load
- [ ] No console errors when closing zoom
- [ ] Works on pages with no images (no crashes on init)
- [ ] Non-screenshot images also zoom (logo? probably don't want this — add `no-zoom` class if needed)

---

## Out of scope

- **Galleries** — if we ever need multi-image carousels, revisit PhotoSwipe or build on medium-zoom's API. Not needed now.
- **Captions in the zoom view** — medium-zoom shows `alt` text as caption by default. Adequate. Custom caption styling is a future polish.
- **Zoom on hover** — tempting but overrides natural click behaviour. Skip.
- **Keyboard activation** — medium-zoom requires a click/tap to zoom, not keyboard. Triggering zoom via keyboard would need custom work. Out of scope — alt text and context serve keyboard users fine.
