# PsyConf Index

PsyConf Index is an independent, open, community-driven, non-commercial directory of research conferences, colloquia, symposia, scientific days, and related events in Psychology and neighboring disciplines.

> **Preview content warning:** The three initial records in `data/series.json` and `data/editions.json` are illustrative examples using reserved `example.org` URLs. They are not real event announcements. Replace them with verified records before promoting the directory as a live listings service.

## Architecture

This is a static website intended for GitHub Pages. The frontend is semantic HTML, responsive CSS, and modular vanilla JavaScript; it has no frontend framework or external runtime dependencies. The site reads its content from JSON files in `data/`.

Persistent conference and event-series metadata is stored in `data/series.json`; dated event editions are stored in `data/editions.json` and reference their series with `series_id`. Strict JSON Schemas are in `schemas/`. Dates use ISO 8601; country codes use ISO 3166-1 alpha-2; language codes use ISO 639-1; and currencies use ISO 4217. External data URLs use HTTPS.

Node.js ESM scripts provide local validation and generate two monthly RSS 2.0 feeds:

- `rss/events-this-month.xml` lists editions whose event start date falls within the current UTC calendar month.
- `rss/deadlines-this-month.xml` lists editions whose CFP deadline falls within the current UTC calendar month.

The scripts can be run with:

```bash
npm install
npm run validate
npm run generate:rss
```

Serve the repository over HTTP to preview the site locally, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Opening `index.html` directly may prevent the browser from loading JSON data.

## Contributing and editorial policy

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a record. Researchers may use the GitHub Issue Forms to submit an event or report an update. Maintainers review public evidence, duplicates, scientific review transparency, research relevance, and organizational and financial transparency. A submission is not an automatic listing or endorsement. Objective reliability indicators are descriptive, not ratings.

Listings are excluded under the five criteria described in the contribution policy: absent review transparency or identifiable committees; commercial or training-only activity without research presentations; pseudoscientific or non-research-backed frameworks; strictly internal events; and inadequate organizational or financial transparency.

## Hosting

Enable GitHub Pages for this repository and publish the static files from the default branch root (or configure an equivalent Pages deployment). The canonical site URL is currently `https://psyconf-index.github.io/`. If the published URL changes, update the URL in the RSS generator and JSON Schema identifiers.

## Governance and citation

The project is initiated by [Ton Prénom Nom] and intended to be maintained collaboratively by a multidisciplinary curatorial committee. The committee is currently being formed; no individual committee members are named without their consent. The name placeholder in `CITATION.cff` should be replaced with the initial maintainer’s preferred citation name before public release.

## Dual licensing

Licenses are deliberately separated by content type:

- **Source code, scripts, schemas, and templates:** [MIT License](LICENSE-CODE).
- **Directory data in `data/` and generated feeds in `rss/`:** [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE-DATA) (**CC BY-NC-SA 4.0**).

The data license applies strictly to the data and generated feed files, not to the source code. Contributions to source and templates are made under the MIT License; contributions to directory data and generated feeds are made under CC BY-NC-SA 4.0. See the respective license notices for terms.
