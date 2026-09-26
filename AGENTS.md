# 维护入口

本仓库同时维护中文生活指南、静态阅读网站与离线版本。先读本页，再按任务读取对应规则；不要求每次重读历史报告。

- 正文和清单：`STYLE.md`、`CONTRIBUTING.md`；事实修改另读 `references/source-policy.md`。
- 构建与发布：`docs/maintenance/development.md`；唯一完整检查入口是 `python scripts/validate.py`。
- 维护队列：`docs/maintenance/backlog.md`、`docs/maintenance/maintenance-workflow.md`。
- 历史范围：`docs/audits/README.md`；旧报告不是当前待办或当前验收结果。

## 必须保持

1. 不提交私人资料；示例使用虚构信息。
2. 不重算既有内容、段落、任务 ID。标题变更同步 `site/anchor-aliases.json`，检查旧链接。
3. `_site/`、`_export/`、`_maintenance/`、`_tools/` 是生成目录，不直接编辑或提交。
4. 语言编辑不更新事实核验日期；访问失败不记为核验完成。
5. 修改通过分支和 PR，检查通过后合并。用户明确授权的发布继续执行，不重复索要确认。
6. main 自动部署；正式版本通过 `Publish a fixed edition` 手动工作流发布，版本与当前源码必须一致，不覆盖旧标签和附件。
7. 一般维护不递增版本；成批读者变化或需要固定归档的修订才发布新版本。
8. 修改构建时更新共用入口，不在 PR 和部署工作流复制安装／测试步骤。
9. 不把 CI 通过写成内容已获医学、法律或税务专业审定。
