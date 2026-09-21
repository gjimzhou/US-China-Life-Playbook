# Reading site maintenance

The site builds directly from the Markdown sources using Python's standard library. The bundled Marked parser is distributed with its MIT license. No runtime CDN or analytics is used.

## Enable hosting once

1. Open repository Settings → Pages.
2. Under Build and deployment, set Source to **GitHub Actions**.
3. Open Actions → Build and deploy reading site and run the workflow, or rerun the latest failed run.
4. Wait for the deployment job to succeed. The public URL is https://gjimzhou.github.io/US-China-Life-Playbook/.

Repository contents permission alone does not allow the connector to change Pages settings. A successful build without a successful deploy is not a live site.

## Content updates

Edit the Markdown under `book/` or `checklists/`, then commit to main. The workflow rebuilds the data and deploys it. Reference documents are explicitly allowlisted in `scripts/build_site.py`. Do not upload private household documents.

Priority and evidence filters only use explicit labels inside a section. Missing labels are not inferred. Search results are sections, not an asserted count of independent recommendations.

## Local build

```sh
python scripts/build_site.py
python -m http.server --directory _site 8765
```

The generated `_site/` directory is ignored. Never publish the entire repository directory as the artifact; it may include development or administrative files later.

## Validation

Check chapter navigation, Chinese and English queries, no-result state, P0 and A filters, relative Markdown links, deep links, keyboard focus, mobile layout, and print output. Source fact checks remain a separate editorial task documented in `references/editorial-status.md`.

Current automated checks cover all 57 rendered documents, search, filters, reset and internal routing. Visual viewport QA remains pending until an accessible preview or public deployment is available.
