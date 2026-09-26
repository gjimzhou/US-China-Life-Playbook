# 仓库结构、开发与发布

[文档导航](../README.md) · [网站维护](site-maintenance.md)

| 路径 | 职责 |
| --- | --- |
| `README.md` | 项目介绍与快捷入口 |
| `HOME.md` / `CONTENTS.md` | 网站阅读导览与完整主题目录 |
| `book/` / `checklists/` | 正文与场景清单，保留稳定地址 |
| `references/` | 来源规范、编辑状态与事实审查边界 |
| `docs/reader/` / `maintenance/` / `audits/` / `releases/` | 读者工具、工程维护、审计、历史版本 |
| `site/` | 阅读器、永久内容 ID、路由兼容和服务配置 |
| `scripts/` | 构建、导出、链接与回归检查 |
| `updates/` | 人工选择的新内容／重要修订，不从提交自动推送 |
| `_site/` | 生成的部署产物，不直接编辑 |

```sh
python -m unittest discover -s scripts -p 'test_*.py'
python scripts/maintenance_report.py
python scripts/build_site.py
python scripts/check_review_regressions.py
python scripts/build_exports.py
python scripts/check_site.py
python -m http.server 8765 --directory _site
```

使用 Python 3.12+、Pandoc，以及 PDF 导出所需的 WeasyPrint / 字体依赖。完整安装与浏览器测试命令以 `.github/workflows/validate.yml` 为准。`main` 通过 Pages 工作流发布。先本地验证，再提交；内容更新同步导出和有明确范围的核验记录。

正文目录没有为外观整齐而搬移：稳定 URL、收藏、永久章节／段落 ID、勾选 ID 与离线缓存依赖它们。真正分离的是项目首页与完整目录、读者文档与维护／审计文档。新增内容与标题变更显式维护 `site/content-ids.json`，不得重算既有 ID。
