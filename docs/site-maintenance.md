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

## 2026-09-23 搜索、性质提示与发布边界

高级筛选默认折叠，并显示实际标注覆盖范围；它不是全书事实审定率。自然问法的事件入口由编辑显式维护，出现在关键词结果之前，不推断医疗或法律结论。性质提示仅按已写出的类别显示；未映射类别使用通用提示，不自动推断为法律规则。

旧序号路由固定读取提交543c79b6的标题顺序，构建需要完整Git历史。标题变更仍须维护显式映射；早于该基线的未知重编号不能保证兼容。电子书失效片段现在使构建失败，不再静默退回章首。

外链报告纳入下载页；明确404／410使该报告工作流失败，访问受限与暂时故障仍单列。报告工作流与网站发布独立；它不能证明页面仍支持原主张。

网站与离线版保持同一次提交、全部成功后一起发布。转换失败时保留上一已部署版本，修复后重新发布，不把旧电子书标为新版本。此轮保留串行一致性策略，尚未实现独立导出发布。PDF／真实Kindle视觉体验仍需设备验证。
