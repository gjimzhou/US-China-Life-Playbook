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

## 本地检查

Python 3.12+、Node 22、Java 21。安装 Pandoc 3.11 后，首次安装其余依赖：

```sh
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
npm ci
npx playwright install firefox
python scripts/validate.py --quick
```

完整检查：`python scripts/validate.py`。它执行单元测试、维护台账、网站、历史路由、浏览器回归、六种导出和 EPUBCheck；需要空闲的8765端口。`--quick`不包含浏览器和导出，不可作为发布验收。

完整构建还需 Pandoc 3.11、EPUBCheck 5.4.0、中文字体和 WeasyPrint 的系统库。Ubuntu 24.04 的安装步骤统一在 `.github/actions/setup/action.yml`；`scripts/install_build_tools.py`校验官方压缩包SHA256。其他系统按上游安装对应架构的Pandoc，EPUBCheck放在`_tools/epubcheck-5.4.0/`。macOS需另装Pango等WeasyPrint依赖；系统字体和底层库尚未做到逐字节可复现。

Python依赖在`requirements.txt`固定，浏览器测试依赖由`package-lock.json`锁定。Dependabot每月提出更新PR，不自动合并；工具更新须通过完整检查并抽看导出排版。

PR、main部署、正式发布共用`build.yml`；`validate`是PR最终必需检查的稳定名称。main只有完整检查通过才部署，从`verified-site`产物取文件，不在部署步骤重新构建。

正文目录没有为外观整齐而搬移：稳定 URL、收藏、永久章节／段落 ID、勾选 ID 与离线缓存依赖它们。真正分离的是项目首页与完整目录、读者文档与维护／审计文档。新增内容与标题变更显式维护 `site/content-ids.json`，不得重算既有 ID。

## 正式版本与持续更新

Git提交记录每次修改；正式版本表示可供引用和归档的发布快照，不要求每次提交都递增版本号。错字、链接和小范围校订可累计维护；需要单独归档的修正版使用补丁号，例如v1.2.1。新增阅读功能或成批内容、文风修订使用次版本号，例如v1.2；大范围重组或不兼容变化再考虑主版本号。

发布时同步修改`VERSION`、首页、下载页、变更日志和`docs/releases/<版本>.md`。离线版标识与构建清单读取`VERSION`，源码ZIP保留该文件。保留历次发布附件，不用新版覆盖旧版。

正式发布使用 Actions → **Publish a fixed edition** → **Run workflow**，选择main并填写已准备好的版本号。发布前必须通过PR同步`VERSION`、首页、下载页、变更日志与版本说明。工作流先检查版本与旧标签，再执行完整构建，最后校验源码提交、六个附件及SHA256清单后发布；不覆盖旧版本。提交标题不再触发发布。

main合并自动更新网站；正式Release是独立固定快照，附件记录自己的源码提交。若网站已有后续提交，两者SHA不同是正常的；不要用新网页版本覆盖历史附件。

## 故障与回退

PR失败时查看失败步骤与诊断附件；部署失败时保留线上上一版。通过revert提交回退main并让完整流程重新部署，不强推历史。Release失败先检查是否已产生标签或部分附件；已发布版本不覆盖，必要时修正后发布补丁版本。维护和部署失败会形成一个持续跟踪的Issue，重复失败不反复新建，恢复后自动关闭。
