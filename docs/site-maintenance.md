# Reading site maintenance

The site builds from Markdown with Python's standard library and the bundled MIT-licensed Marked parser. Core reading has no runtime CDN dependency. Optional analytics and chapter interactions are disabled until owner-controlled services are configured and verified; see [reader services](reader-services.md). Editorial cadence, evidence records and link triage are defined in [持续维护工作流](maintenance-workflow.md).

## Hosting and deployment

GitHub Settings → Pages must use GitHub Actions. Only main deploys to https://gjimzhou.github.io/US-China-Life-Playbook/. A successful build alone is not proof of deployment; check the deploy job and live site.

Edit `book/` or `checklists/` on a maintenance branch, review changes and merge into main. Reference documents are explicitly allowlisted in `scripts/build_site.py`. Never include private household documents. Publish only `_site/`, never the repository directory.

The site and offline files come from the same commit and deploy together after all conversions and checks pass. Failed conversion leaves the previously deployed version in place. Formal releases use VERSION, `docs/releases/<version>.md` and the workflow's `Release v...` commit convention; routine maintenance does not create a release automatically.

## Local validation

Install Pandoc, WeasyPrint and the system fonts/libraries required by `.github/workflows/pages.yml`, then run:

```sh
python scripts/build_site.py
python scripts/check_review_regressions.py
python scripts/build_exports.py
python scripts/check_site.py
python -m unittest discover -s scripts -p 'test_maintenance_report.py'
python scripts/maintenance_report.py
python -m http.server --directory _site 8765
```

Generated `_site/`, `_export/` and `_maintenance/` are ignored. The route compatibility baseline is commit `543c79b6a837d5d6d2980638d5e21f056f1a91e2`; builds require full Git history. Preserve explicit mappings when headings change. Unknown renumbering before that baseline is not guaranteed compatible. Broken export fragments fail the build.

Check Chinese and English search, empty results, filters, reset, navigation, old deep links, keyboard focus, mobile layout and print output when relevant UI behavior changes. v1.1 received desktop/mobile viewport checks; full PDF and real e-reader device QA remains a separate backlog item. Use build output for current document counts instead of stale hand-maintained totals.

Search priority/evidence filters use explicit section labels; missing labels are not inferred. Event search entries and content-type notices are editorial mappings. Their coverage is not a fact-certification rate.

## Operational checks

The External link report detects HTTP failures, restrictions and redirects; it cannot prove a destination supports the claim. The Editorial maintenance queue validates the review registry and assigns due scopes and a full-content rotation. Neither automatically refreshes verification dates. Follow the editorial workflow to record evidence and fix dependent pages.

After merging, inspect Actions, the affected live page and downloads manifest. For a bad published change, use a revert commit and verify the replacement deployment. Keep VERSION and release history accurate; do not label old exports as a new version.
