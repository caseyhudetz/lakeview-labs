# Lakeview Labs

The site for [Lakeview Labs](https://lakeviewlabs.org) — a small, non-commercial
workshop run by two neighbors, building little web experiments for Lakeview East
in Chicago.

It's a static site: plain HTML, one stylesheet, one script. No build step, no
dependencies, no framework.

## Run it locally

Open `index.html` in a browser, or serve the folder so relative paths behave:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Layout

```
index.html        the whole page
css/styles.css    design tokens + styles
js/main.js        project filters and the pitch modal
assets/           logo and favicon
design/           the original Claude Design source (see below)
```

## Adding or updating a project

Projects are plain HTML cards in `index.html`, inside `#project-grid`. Copy an
existing `<article class="project">`, then set:

- `data-status` — `live`, `beta`, or `idea`. The status filter buttons are
  currently off the page; re-adding them to `index.html` turns filtering back
  on, and `js/main.js` picks them up with no other changes.
- the badge class — `badge--live`, `badge--beta`, or plain `badge` for an idea.
- the name, subtitle, description, "Updated" month, and link.

An idea with no link uses a "Follow along" button that opens the pitch modal
instead of a `Try it →` link. Either way the whole card is the click target —
the CTA stretches over it — so a card should hold exactly one.

## The pitch form

By default the form has no backend: submitting opens the visitor's mail client
with the pitch pre-filled to `hello@lakeviewlabs.org`, then shows the thank-you
state.

To collect pitches properly, put a form endpoint (Formspree, a Netlify function,
a Cloudflare Worker — anything that accepts a JSON `POST`) on the modal in
`index.html`:

```html
<div class="modal" id="pitch-modal" data-endpoint="https://example.com/pitches" …>
```

The script then posts `{ "idea": "…", "email": "…" }` and falls back to a visible
error pointing at the email address if the request fails.

## Deploying

Any static host works — the repo root is the publish directory. `netlify.toml`
is set up for Netlify (drop the repo in, no build command). For GitHub Pages,
serve the default branch from the root.

## design/

The site started as a Claude Design canvas. Those files are kept for reference,
not used by the site:

- `Lakeview_Labs.dc.html` — the design source (template + component logic)
- `support.js` — the `dc-runtime` that renders it
- `preview.html` — a self-contained bundled preview you can open directly

Edits belong in `index.html` / `css/styles.css`; the design files won't pick
them up.

## License

No license — it's a neighborhood project, not a product. Say hello at
[hello@lakeviewlabs.org](mailto:hello@lakeviewlabs.org).
