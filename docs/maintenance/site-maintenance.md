# Reading site maintenance

The interactive site builds from Markdown with Python's standard library and the bundled MIT-licensed Marked parser. Independent static chapter pages use Pandoc, which is also required for the existing exports. Core reading has no runtime CDN dependency. GoatCounter analytics is enabled; comments, reactions and newsletter remain disabled. Read [reader services](../reader/reader-services.md) and `site/services.json` for service configuration and acceptance boundaries. Editorial cadence, evidence records and link triage are defined in [持续维护工作流](maintenance-workflow.md).

## Hosting and deployment

GitHub Settings → Pages must use GitHub Actions. Only main deploys to https://gjimzhou.github.io/US-China-Life-Playbook/. A successful build alone is not proof of deployment; check the deploy job and live site.

Edit `book/` or `checklists/` on a maintenance branch, review changes and merge into main. Reference documents are explicitly allowlisted in `scripts/build_site.py`. Never include private household documents. Publish only `_site/`, never the repository directory.

The site and offline files come from the same commit and deploy together after all conversions and checks pass. Failed conversion leaves the previously deployed version in place. Formal releases use VERSION, `docs/releases/<version>.md` and the **Publish a fixed edition** manual workflow. Commit titles do not trigger releases; see [开发与发布](development.md).

## Local validation

Follow [开发与发布](development.md) for the maintained toolchain and run the shared entry point:

```sh
python scripts/validate.py
```

`--quick` omits browser and export validation and is not release acceptance. The shared setup is `.github/actions/setup/action.yml`; do not duplicate its install or validation steps in other workflows.

Generated `_site/`, `_export/` and `_maintenance/` are ignored. The route compatibility baseline is commit `543c79b6a837d5d6d2980638d5e21f056f1a91e2`; builds require full Git history. Preserve explicit mappings when headings change. Unknown renumbering before that baseline is not guaranteed compatible. Broken export fragments fail the build.

Check Chinese and English search, empty results, filters, reset, navigation, old deep links, keyboard focus, mobile layout and print output when relevant UI behavior changes. v1.1 received desktop/mobile viewport checks; full PDF and real e-reader device QA remains a separate backlog item. Use build output for current document counts instead of stale hand-maintained totals.

Search priority/evidence filters use explicit section labels; missing labels are not inferred. Event search entries and content-type notices are editorial mappings. Their coverage is not a fact-certification rate.

## Operational checks

The External link report detects HTTP failures, restrictions and redirects; it cannot prove a destination supports the claim. The Editorial maintenance queue validates the review registry and assigns due scopes and a full-content rotation. Neither automatically refreshes verification dates. Follow the editorial workflow to record evidence and fix dependent pages.

After merging, inspect Actions, the affected live page and downloads manifest. For a bad published change, use a revert commit and verify the replacement deployment. Keep VERSION and release history accurate; do not label old exports as a new version.

读者清单、备份、静态分享与离线机制见 [读者工具维护](../reader/reading-tools.md)。
