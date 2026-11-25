# Contributing to PsyConf Index

Thank you for helping maintain a transparent and useful directory of research events. Contributions and all public-facing project text should be in clear academic English. PsyConf Index is non-commercial and does not sell listings or accept payment for inclusion.

## How to submit or update a record

1. Search the directory to avoid duplicating a series or edition.
2. Open the **Submit a conference or scientific event** or **Report a correction or update** form in GitHub Issues, or submit a pull request editing the JSON data.
3. Provide official HTTPS sources for event dates, organizers, the scientific committee or review process, and fees or sponsorship information. Distinguish verified facts from details that have not been announced.
4. Add persistent organization information to `data/series.json`; add a specific dated event to `data/editions.json`. Link each edition to its series using `series_id`.
5. Use ISO dates (`YYYY-MM-DD`), ISO country, language, and currency codes, lowercase tags, and all required fee keys. Use `null` when an amount or date has not been announced.
6. Keep `short_description` factual and within the 240-character maximum.
7. Run `npm install` and `npm run validate` locally. CI checks the schemas, duplicate identifiers, series references, and event date ordering.

The initial dataset entries are illustrative examples, not real announcements. Replace them with verified records before presenting the directory as an active listings service.

## Moderation workflow

Maintainers acknowledge submissions, check for duplicates and public evidence, assess the inclusion criteria below, and request clarification where needed. A submission may be accepted, declined, or deferred while evidence is gathered. Approved data changes are merged through a reviewed pull request or entered by maintainers after review. Material updates should cite a public organizer source. Records may be corrected or removed when an event is cancelled, information becomes misleading, or an organizer requests a reasonable correction.

A submitted issue is not an automatic listing or endorsement. The directory reports objective attributes, such as whether a scientific committee is identifiable or proceedings are peer-reviewed; it does not use star ratings and does not guarantee the quality of an event or its individual contributions.

## Five exclusion criteria

An event should be excluded if it meets any of the following criteria:

1. **Lack of transparent peer review or an identifiable scientific committee.** This is an anti-predatory safeguard. A committee and a credible abstract or paper review process must be verifiable; peer-review status must be represented accurately rather than assumed.
2. **Commercial, promotional, coaching, or purely training events without research presentations.** Events without a substantive research-presentation program are out of scope.
3. **Pseudoscientific or non-research-backed frameworks.** Events primarily promoting claims or methods unsupported by credible research are out of scope.
4. **Strictly internal or closed institutional seminars.** The directory is for events with a meaningful public or scholarly audience, not internal-only meetings.
5. **Lack of organizational or financial transparency.** Examples include a broken or unverifiable official site, hidden organizers or sponsors, and opaque or misleading fees.

Borderline cases may be deferred while further evidence is requested. Missing information is not, on its own, proof of misconduct, but essential details must be verifiable before a listing is approved.

## Data and editorial standards

- Include events relevant to Psychology or a clearly explained adjacent discipline.
- Use official sources; do not infer dates, fees, peer review, grants, or sponsors.
- Use `null` for dates or fees not announced and explain material context in sponsor notes where appropriate.
- Keep descriptions concise, factual, and respectful.
- Update cancelled, postponed, or expired records promptly, while retaining accurate historical editions where useful.

## Security and licensing

Do not submit private personal information. Treat URLs and contributed text as untrusted. Report suspected security issues privately to repository maintainers rather than publishing exploit details in an issue. Source code, scripts, schemas, and templates are under the MIT License. Directory data in `data/` and generated feeds in `rss/` are under CC BY-NC-SA 4.0, as detailed in the README and license files.
