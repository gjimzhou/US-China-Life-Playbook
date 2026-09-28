# US–China Life Playbook：项目交接、后续发展与长期维护手册

> 面向下一位长期维护者（Serena）  
> 当前基线：2026-09-28，仓库 `gjimzhou/US-China-Life-Playbook`，正式版本 `v1.2`。  
> 本文是整个项目的 handoff，不是某一个 issue 的处理说明。它的目标是让新的 collaborator 在不依赖原作者口头补充的情况下，能够继续内容维护、事实核验、网站开发、自动化、发布、QA 与长期 roadmap。

---

## 0. 先读这一页：这个项目到底是什么

这个仓库不是单纯的一本 Markdown 手册，也不是单纯的网站。它同时维护五套相互关联、但必须分开理解的系统：

1. **读者内容层**：40 章正文 + 场景清单，目标是给中美双栖生活提供可执行、可核验、可持续更新的生活指南。
2. **证据与事实维护层**：来源规范、事实复核 registry、evidence records、动态规则复核周期。
3. **阅读产品层**：静态网站、搜索、收藏、阅读进度、清单勾选、阅读设置、备份恢复、离线章节、分享链接、RSS、匿名统计。
4. **构建与发布层**：GitHub Actions、网站构建、PDF/EPUB/DOCX/HTML/Markdown 等离线导出、Release、Pages 部署。
5. **编辑与审计层**：写作规范、历史 editorial passes、reader QA、link audit、release readiness、回归验证。

任何改动都先判断自己是在动哪一层。**最常见的错误就是把“代码构建通过”误当成“事实已经核验”，或把“文字润色”误当成“规则已更新”。**

---

## 1. 项目的核心目标

### 1.1 面向谁

主要面向在美国生活、同时与中国保持家庭、医疗、财务、证件、社会关系或长期移动联系的人群。内容以中文为主，重要专业术语首次出现时保留英文。

### 1.2 解决什么问题

项目不是百科，而是围绕“出事以后我下一步做什么”“平时哪些高后果事项值得提前准备”“中美两个系统怎样衔接”来组织。

核心价值不是把所有生活常识写全，而是：

- 降低高后果错误；
- 给读者直接可用的官方入口；
- 解释规则的适用范围、日期与例外；
- 把一次性知识变成可重复执行的清单和维护周期；
- 明确什么时候必须找医生、律师、CPA、保险经纪或其他专业人士。

### 1.3 明确不做什么

不要把项目做成：

- 个案医疗/法律/税务/移民意见；
- 投资热点、签证投机、规避合规指南；
- 社交媒体观点集；
- 内容农场；
- 只有“AI 总结”而没有原始来源的资料库；
- 以复杂功能压倒阅读本身的账号型产品。

---

## 2. 新维护者第一天应该做什么

建议顺序：

1. 阅读根目录 `AGENTS.md`。
2. 阅读 `CONTRIBUTING.md`、`STYLE.md`、`METHODOLOGY.md`。
3. 阅读 `references/source-policy.md` 与 `references/citation-guide.md`。
4. 阅读 `docs/maintenance/development.md` 与 `docs/maintenance/maintenance-workflow.md`。
5. 阅读 `docs/maintenance/backlog.md`，再去 GitHub Issues 看“当前”任务。
6. 阅读 `docs/reader/reading-tools.md` 与 `docs/reader/reader-services.md`，理解网站当前已经有哪些能力。
7. 运行一次：
   ```bash
   python scripts/validate.py --quick
   ```
8. 环境完整后再跑：
   ```bash
   python scripts/validate.py
   ```
9. 打开线上站点，对照源码理解 build → deploy 的关系。

如果时间只够 30 分钟，至少读：`AGENTS.md`、`docs/maintenance/backlog.md`、`docs/maintenance/maintenance-workflow.md`、`docs/maintenance/development.md`。

---

## 3. 仓库地图：每个目录负责什么

### 3.1 根目录

- `README.md`：公开项目首页与主要入口。
- `HOME.md`：读者阅读导览。
- `CONTENTS.md`：完整目录。
- `METHODOLOGY.md`：证据等级、优先级、内容性质。
- `STYLE.md`：中文表达和编辑验收规范。
- `CONTRIBUTING.md`：贡献约束。
- `DISCLAIMER.md`：使用边界。
- `COPYRIGHT.md` / `LICENSING.md` / `LICENSE`：版权与授权边界。
- `CHANGELOG.md`：面向版本的变更记录。
- `VERSION`：正式版本号。

### 3.2 `book/`

40 章正文。这里是解释概念、规则、判断、例外、来源的主要位置。

不要为了目录“漂亮”随意改文件名。文件路径已经成为稳定 URL、收藏、离线和引用的一部分。

### 3.3 `checklists/`

场景型行动清单。目标是“事情发生时能照着做”，不重复大段解释。

原则：

- 正文负责“为什么”；
- checklist 负责“现在先做什么”；
- 重复数字、期限、官方规则应尽量只在主位置维护；
- 清单保留现场必须看到的安全动作和关键期限。

### 3.4 `references/`

- `source-policy.md`：什么来源能支持什么结论。
- `citation-guide.md`：读者可用的链接怎么写。
- `editorial-status.md`：历史审阅与当前已知边界。

注意：`editorial-status.md` 包含大量历史进度，不等于当前全部任务。当前任务优先看 Issues 与 `docs/maintenance/backlog.md`。

### 3.5 `maintenance/`

事实复核台账与证据记录：

- `review-registry.json`：动态范围、周期、最近复核状态。
- `reviews/`：每次实际核验留下的 evidence records。
- `reviews/README.md`：证据索引。

这是项目长期可信度的核心。

### 3.6 `site/`

阅读网站前端及稳定身份映射。

重点文件：

- `app.js`：主应用逻辑。
- `reader.js`：阅读体验。
- `tools.js`：备份、恢复、清单等读者工具。
- `style.css`：视觉样式。
- `index.html`：网站入口。
- `offline.html` / `offline.js` / `sw.js`：离线章节能力。
- `content-ids.json`：稳定内容 / 小节 ID。
- `task-ids.json`：稳定 checklist task ID。
- `anchor-aliases.json`：旧锚点兼容。
- `reading-paths.json`：编辑选择的阅读路径。
- `services.json`：读者服务开关与配置。

### 3.7 `scripts/`

构建、验证、维护报告与回归检查。

最重要的入口是：

```bash
python scripts/validate.py
```

不要复制一套平行验证逻辑到新的 workflow。

### 3.8 `.github/workflows/`

主要工作流：

- `build.yml`：共用构建步骤。
- `validate.yml`：PR 检查。
- `pages.yml`：main 网站部署。
- `release.yml`：固定版本发布。
- `link-health.yml`：外部链接检查。
- `maintenance.yml`：编辑维护队列。
- `monitor.yml`：持续故障追踪。

### 3.9 `docs/`

按用途分：

- `docs/reader/`：读者功能说明。
- `docs/maintenance/`：工程与长期维护规则。
- `docs/audits/`：历史审计证据。
- `docs/releases/`：固定版本说明。

旧路径有时只保留 redirect / moved notice；维护时使用现行入口。

### 3.10 `updates/`

`updates/entries.json` 只放“值得让读者知道的重要更新”。

不要把每个 commit 自动变成 RSS 更新。

---

## 4. 内容编辑的不可破坏原则

### 4.1 中文优先

正文必须让只读中文的人也能理解。

推荐：

> 个人超额责任险（umbrella insurance）

不推荐：

> umbrella / liability layer / risk control framework

专业英文保留用于检索，不要把普通中文词硬换成英文。

### 4.2 区分三件事

任何一段内容都尽量明确：

1. **内容性质**：规则说明 / 指南解读 / 决策框架 / 管理建议 / 专业咨询准备。
2. **证据质量**：A/B/C。
3. **优先级**：P0–P3。

三者不是一个维度。

### 4.3 不伪造“确定性”

不能因为有一个官方链接就写成绝对结论。

必须注意：

- 适用国家 / 州 / 城市；
- 身份；
- 年龄；
- 税年 / 计划年度；
- 生效日期；
- 过渡规则；
- 例外；
- 个案差异。

### 4.4 不把经验写成美国统一规则

社交、家庭管理、专业服务选择等内容可以写，但要明确是项目建议或经验框架。

### 4.5 不提交真实私人资料

绝对不要把真实：

- 姓名；
- 住址；
- 雇主；
- 薪酬；
- 病历；
- 移民编号；
- 保险号码；
- 银行 / 证券账户；
- 精确私人行程；
- 私人邮件；
- 签署文件

放进 repo。

示例必须虚构或抽象化。

---

## 5. 事实核验体系：最重要的维护纪律

### 5.1 三个完全不同的状态

项目维护必须分开：

1. **链接可访问**；
2. **来源仍然支持具体主张**；
3. **网站 / 导出能正常构建**。

任何一个通过都不能替代另外两个。

### 5.2 `last_verified` 的意义

`maintenance/review-registry.json` 中：

- `last_verified`：这个 scope 已经完整覆盖到哪一天；
- `last_review_attempt`：最近尝试核验的日期；
- `review_status`：最近尝试是 complete / partial 等；
- `latest_review_record`：最近 evidence record；
- `review_record`：完整核验对应的 evidence record。

**partial 时不能推进 `last_verified`。**

这一点以后不要为了“清队列”而破坏。

### 5.3 构建成功不等于事实成功

GitHub Actions 全绿只说明：

- 格式；
- 代码；
- 网站；
- route；
- export；
- 测试

通过。

它**绝不证明**医疗、法律、税务、移民、保险等内容已经由专业人士审定，也不证明官方政策今天仍没变。

### 5.4 evidence record 的最低标准

每次核验至少记录：

- 哪个 scope；
- 正文具体句子 / 小节；
- 实际访问了什么官方来源；
- 来源支持哪一句；
- 适用身份 / 地区 / 年度 / 例外；
- 来源发布日期 / 生效日 / 访问日；
- 哪些覆盖了；
- 哪些仍未覆盖；
- 是否需要改正文 / checklist；
- 为什么是 complete 或 partial。

不能只写“checked, no change”。

### 5.5 403 / 登录墙 / 页面加载失败怎么处理

规则：

- 记录访问失败；
- 尝试官方替代入口、法规正文、官方 PDF、官方 FAQ；
- 不用搜索摘要替代正文；
- 不把 HTTP 200 当成事实核验；
- 不为了拿绿灯把深链接全部换成机构首页。

### 5.6 动态高风险主题

优先盯：

- 移民；
- 旅行 / 入境；
- 税务；
- 福利限额；
- 医保；
- 疫苗 / 筛查；
- 表格版本与费用；
- 劳动规则；
- 保险申诉和临时延期；
- 跨境税；
- 家庭雇员 payroll。

---

## 6. maintenance queue 与自动 Issue

维护队列由程序生成。

关键行为：

- 台账到期 / 七天内到期会同步到固定 Issue；
- 全部处理后程序自动关闭；
- 如果人手动关闭但台账仍有任务，下次运行会重新打开；
- 列表没有变化时不刷屏；
- PR 只生成报告，不写维护 Issue。

**不要为了“看起来清爽”手动关闭自动维护 Issue。**

如果任务还没真实完成，让它继续存在。

---

## 7. 当前已知维护方向

截至 2026-09-28，长期维护优先级应保持：

### 第一层：动态事实

完成 registry 中所有初始 scope 的可靠 evidence baseline，并继续把过宽 scope 拆成更窄、可独立 complete 的单元。

长期目标是让：

- 一个 scope 的定义足够明确；
- complete 真能表示“范围全部覆盖”；
- 不因为某一个页面不可读就拖累完全无关的规则。

### 第二层：高价值跨章一致性

继续维护 `docs/maintenance/topic-maintenance.md`。

重点避免：

- 同一个税务数字在三处不同步；
- 同一个旅行规则在正文和 checklist 不一致；
- 同一个保险时限多处复制；
- 同一个移民窗口被不同章节各写一套。

### 第三层：实体阅读体验

项目已有浏览器回归，但真实设备仍是重要缺口：

- iPhone / Android；
- Kindle / EPUB reader；
- PDF 打印；
- 长表格；
- 中文字体；
- 跨页断行；
- 内部锚点；
- 横屏 / 小屏。

这类 QA 不能完全用 Playwright 替代。

### 第四层：官方来源变化提醒

可以做页面 diff / checksum / RSS / last-modified 监控，但它们只负责：

> “这里可能变了，请人工复核。”

绝不能自动改写医疗、法律、税务、移民结论。

---

## 8. 网站产品：现在已经有什么

当前网站是静态优先、低账号依赖的阅读器。

已有能力：

- 全文搜索；
- 内容分类；
- 阅读路线；
- 收藏；
- 继续阅读；
- Markdown checklist 勾选；
- 字号 / 行距；
- JSON 备份恢复；
- 稳定分享链接；
- 每章静态独立阅读页；
- 按章离线保存；
- RSS；
- 匿名 analytics；
- 旧链接兼容。

目前未启用：

- 评论；
- 点赞；
- 邮件订阅。

不要在没有真实后端、moderation、退订、privacy 验收前把这些 UI 假装成已上线。

---

## 9. 稳定 ID：前端维护最容易踩的坑

### 9.1 `site/content-ids.json`

章节和小节使用稳定 ID。

标题改名时：

- 不要重新生成所有 ID；
- 同一个内容应保留原 ID；
- 必要时迁移映射。

### 9.2 `site/anchor-aliases.json`

标题或 slug 改动后，旧 deep link 要继续工作。

不要为了清理 JSON 把历史 alias 删掉。

### 9.3 `site/task-ids.json`

checklist 每个 task 有稳定 ID，用来保存勾选状态。

规则：

- 同一行动只是措辞优化：迁移旧 ID；
- 行动含义改变：新建 ID；
- 删除的 ID 可以 tombstone；
- 绝不重用旧 ID；
- 不因排序变化重新生成。

可以用：

```bash
python scripts/task_identity.py
```

检查新 task 是否缺映射。

---

## 10. Reader data 与隐私

本地保存：

- 收藏；
- 阅读位置；
- checklist 完成状态；
- 字号 / 行距等阅读设置。

原则：

- 默认不上传；
- 不跨设备同步；
- 浏览器清数据可能丢；
- 备份文件最大 2 MB；
- 恢复前先校验；
- 损坏数据不能静默覆盖；
- 离线缓存不承诺永久保留。

不要为了“产品感”引入必须登录的云同步，除非未来明确决定接受：

- 账号系统；
- 身份数据；
- 数据库；
- 隐私政策；
- 删除流程；
- 安全维护

这些长期成本。

---

## 11. Analytics

当前启用 GoatCounter。

统计原则：

- 只做匿名技术统计；
- 不把一个 IP 当成一个人；
- 不发送搜索词、邮箱、收藏、原始 query 参数等；
- `page-open` 是打开次数；
- `last_section_visible` 不等于“读完”；
- 静态页 / 离线页不一定覆盖；
- 广告拦截 / DNT / GPC 会漏计。

analytics 用来判断：

- 哪些章节被使用；
- 哪些路径没人点；
- 哪些读者功能被尝试。

不要用它来做“用户画像”。

---

## 12. 搜索与信息架构的未来方向

搜索现在已经可用，但长期可以继续提升：

### 12.1 从关键词搜索升级到“任务搜索”

读者更常输入：

- “搬家后要改什么”
- “收到 USCIS notice”
- “医院账单不对”
- “父母来美国看病”
- “长期回中国住”

未来可增加：

- 同义词；
- 事件 intent；
- 中文口语表达；
- 英文官方术语；
- 内容性质 / jurisdiction filter。

### 12.2 不做黑盒 AI 搜索作为唯一入口

如果未来加 semantic search / LLM：

- 结果必须能回到稳定 section；
- 必须显示原文；
- 不能生成未经 source policy 支持的新法律 / 医疗结论；
- 高风险回答必须保留适用边界；
- 最好把 AI 当导航层，不当新的事实数据库。

---

## 13. 内容发展 roadmap

### 13.1 近期：把“全书很大”变成“按事件直接可用”

继续增加真正高价值的事件清单，而不是再加泛泛章节。

优先判断标准：

- 事情发生时很慌；
- 顺序做错会损失大；
- 机构很多；
- 中美衔接复杂；
- 当前信息散落在多个章节。

### 13.2 中期：建立“生命周期”导航

可以逐步形成：

- 刚到美国；
- 搬家；
- 工作变化；
- 结婚；
- 生育；
- 买房；
- 父母养老；
- 长期跨境生活；
- 退休；
- 失能；
- 身故。

每个 lifecycle 页面只负责导航，不复制整章内容。

### 13.3 中期：地区 overlay

很多规则在联邦层写不完整。

未来可建立轻量 jurisdiction overlays，例如：

- NJ；
- NY；
- CA；
- FL；
- 中国主要城市 / 省份。

但不要把 50 州全抄一遍。

更合理方式：

- 全国原则；
- 提醒“这一项按州变化”；
- 提供州入口；
- 只对高价值地区做精选 overlay。

### 13.4 中长期：年度版本层

每年 10 月到次年 1 月是税务、福利、表格、医保等高变动季。

可以维护：

- “2027 annual refresh” project board；
- 下一年度数字集中 diff；
- 旧年度继续保留历史适用信息；
- 避免全书机械替换年份。

### 13.5 长期：证据覆盖可视化

未来网站可显示：

- 本节最近核验日期；
- scope；
- complete / partial；
- 尚未覆盖的边界。

但必须避免制造“已认证”的错觉。

推荐语言：

> 最近核验：2026-09-24  
> 覆盖：联邦规则 + NJ 示例  
> 未覆盖：其他州 / 个案例外

而不是：

> Verified ✅

---

## 14. 不建议优先做的功能

这些很容易耗时间，但当前边际价值低：

- 用户账号；
- 社交 feed；
- 公开 profile；
- 点赞排行；
- AI 聊天机器人作为主入口；
-复杂 CMS；
- 过度动画；
- 为了 SEO 批量拆页面；
- 50 州机械复制；
- 把所有第三方服务接进来；
- 广告系统；
- 支付墙。

这个项目的优势是内容质量、可信维护和强 actionability，不是 SaaS 功能数量。

---

## 15. 构建环境

推荐：

- Python 3.12+
- Node 22
- Java 21
- Pandoc 3.11
- EPUBCheck 5.4.0
- Playwright Firefox
- WeasyPrint 系统依赖
- 中文字体

首次：

```bash
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
npm ci
npx playwright install firefox
python scripts/validate.py --quick
```

完整：

```bash
python scripts/validate.py
```

完整验证可能需要：

- Pandoc；
- EPUBCheck；
- Pango / WeasyPrint 系统库；
- 中文字体；
- 8765 端口可用。

---

## 16. 验证层级

### 16.1 只改文字

至少：

```bash
python scripts/validate.py --quick
```

但如果标题、链接、ID、导航被动到，应跑完整检查。

### 16.2 改网站 UI / JS / CSS

必须重点测：

- desktop；
- mobile；
- keyboard；
- search；
- empty results；
- filters；
- old deep links；
- checklist；
- bookmarks；
- backup / restore；
- offline；
- print。

### 16.3 改 export

必须完整验证：

- PDF；
- EPUB；
- DOCX；
- HTML；
- Markdown；
- source ZIP；
- internal anchors；
- 中文字体；
- EPUBCheck。

### 16.4 改 maintenance script

不能只看脚本“能跑”。

还要检查：

- queue 是否误报；
- due date 是否正确；
- partial 是否错误推进；
- auto Issue 是否符合真实 registry；
- review regression 是否能抓住日期后退 / evidence 缺失。

---

## 17. GitHub workflow 与 branch 纪律

推荐流程：

1. 从 main 新建 branch；
2. 做一个逻辑上集中的改动；
3. 跑验证；
4. 开 PR；
5. 看 `Validate proposed changes`；
6. review；
7. merge；
8. 看 Pages deploy；
9. 看 live site；
10. 必要时检查 downloads manifest。

不要：

- force-push main；
- 为了快速修复绕过所有验证；
- 把生成目录 commit；
- 把失败部署说成成功；
- 删除旧 Release；
- 用新版附件覆盖旧版本。

---

## 18. main 与 Release 是两件事

### main

合并后自动更新在线网站。

### formal Release

是固定可引用快照。

发布新版本时通常同步：

- `VERSION`；
- `README.md`；
- `DOWNLOADS.md`；
- `CHANGELOG.md`；
- `docs/releases/<version>.md`。

然后 Actions → **Publish a fixed edition**。

不要每个小修都 bump version。

建议：

- typo / link fix：不 bump；
- 小范围 correction：累计；
- 需要固定归档的修正版：patch；
- 成批内容 / reader feature：minor；
- 大规模不兼容重组：major。

---

## 19. 回退策略

如果 main 上线后发现问题：

1. 不改 Git 历史；
2. revert 引入问题的 commit / merge；
3. 重新让完整流程部署；
4. 检查线上是否恢复；
5. 保留事故记录。

如果 Release 有问题：

- 不覆盖原 tag；
- 不替换历史附件；
- 修复后发 patch release。

---

## 20. 版权与许可：不要随便改

当前项目不是普通 MIT / CC 开源仓库。

维护者必须先读：

- `COPYRIGHT.md`
- `LICENSING.md`
- `LICENSE`

关键点：

- 正文与网站代码分开处理；
- 新增原创内容默认不是开放内容；
- 历史上一部分材料已被 CC BY-NC 4.0 覆盖，这种既有许可不可简单撤回；
- 第三方 `marked.js` 等保留各自许可；
- 不对事实、法律、公共数据、思想本身主张排他权；
- 不要擅自把整个项目改成 MIT、CC 或 public domain。

如果未来改变许可，先做 rights inventory。

---

## 21. Serena 作为 collaborator 的推荐工作方式

建议不是“直接在 main 上随手改”，而是：

- Serena 有 write access；
- 所有正常改动走 branch + PR；
- main 保持 protected；
- `validate` 作为 required check；
- 原作者可做高后果内容 / 重大 roadmap 的最终 review；
- 小修、工程维护、链接修复、QA 可以由 Serena 独立 merge（如果双方同意）。

高后果内容推荐双人 review：

- 医疗；
- 移民；
- 税务；
- 法律；
- 保险；
- 跨境；
- 安全。

---

## 22. 任务管理建议

### GitHub Issues 才是“现在要做什么”

不要把：

- 旧 audit；
- 历史 checklist；
- editorial-status 中旧 TODO

自动当成当前任务。

### Issue 最好写清

- 问题；
- scope；
- 为什么重要；
- acceptance criteria；
- 哪些文件可能受影响；
- 是否需要事实核验；
- 是否需要设备 QA；
- 是否需要 release。

### 完成后

- PR 链接回 Issue；
- 写验证结果；
- 真正完成再 close；
- 自动 maintenance Issue 让程序维护。

---

## 23. 建议的长期节奏

### 每周

- 看 Actions；
- 看自动 maintenance queue；
- 看 external link report；
- triage Issues；
- 处理高风险 breakage。

### 每两周

- immigration / travel 动态；
- 读者端明显 bug；
- 最近重要官方公告。

### 每月

- tax / benefits / Medicare / vaccines / insurance / payroll scope；
- dependency PR；
- analytics 使用情况；
- 核对最常读页面有没有旧信息。

### 每季度

- 真机手机；
- PDF；
- EPUB；
- offline；
- accessibility；
- dead content / duplicate content。

### 每年 Q4–Q1

- 下一年度金额；
- 税务 thresholds；
- HSA/FSA；
- Medicare；
- 社保工资基数；
- 表格版次；
- 保险 enrollment；
- immigration fee / form changes；
- travel docs。

---

## 24. 新增一章时的完整 checklist

新增正文前先问：真的需要新章，还是应放入已有章 / checklist？

如果确实新增：

1. 定义读者问题；
2. 搜索已有内容，避免复制；
3. 明确内容性质；
4. 按中文优先写；
5. 对关键规则放 reader-facing 来源；
6. 高后果结论优先官方原文；
7. 加入 `CONTENTS.md`；
8. 分配稳定 content ID；
9. 检查 reading path 是否需要；
10. 如果有 checklist，分配 task IDs；
11. 检查跨章 topic-maintenance；
12. 跑完整 validation；
13. 必要时加 update entry；
14. 只有需要固定归档时才 bump version。

---

## 25. 修改标题 / 文件名时的完整 checklist

这类改动风险比看起来大。

必须检查：

- stable content ID；
- anchor alias；
- old route；
- 收藏；
- search index；
- static read page；
- checklist task ID；
- inbound Markdown links；
- RSS affected content；
- offline saved chapter；
- export anchors。

能不改文件名就不改。

---

## 26. 新增 checklist item 时

先判断是新行动还是原行动改写。

### 新行动

分配新 task ID。

### 同一行动措辞优化

迁移旧 ID 到新查找键。

不要因为脚本能自动 assign，就把所有编辑后的任务当成新任务，否则读者之前的勾选状态会丢。

---

## 27. 来源选择：优先“官方且能继续办事”

最理想的引用不是最学术，而是同时满足：

- 权威；
- 当前；
- 直接支持主张；
- 读者点进去能继续操作。

优先：

1. government landing page / FAQ / portal；
2. regulation / official PDF；
3.专业机构；
4. 高质量研究；
5. 实务来源。

论坛和 Reddit 可以发现问题，但不独立支撑高后果规则。

---

## 28. AI / Codex 的正确使用方式

这个项目可以大量利用 AI，但 AI 的角色应该是：

- 搜索候选来源；
- 比较新旧规则；
- 找跨章重复；
- 草拟结构；
- 写测试；
- 做 regression scan；
- 生成 evidence record 初稿；
- 发现文风问题；
- 辅助 code review。

不应让 AI 自动：

- 宣布法律/医疗结论“verified”；
- 推进 `last_verified`；
- 关闭维护任务；
- 根据搜索摘要改规则；
- 重写大段高后果内容后不留证据；
- 自行决定版权许可变化；
- 把私人聊天信息写进 repo。

如果 Codex / agent 额度有限，优先用于：

1. high-risk maintenance；
2. regression / automation；
3. 重复工作；
4. 大范围 repo scan。

普通 wording 小修改人工直接做更划算。

---

## 29. Serena 接手后的建议首批任务

优先做“能快速建立项目理解、又能产生真实价值”的工作：

### A. 跑完整验证并记录本机环境

目标：确认 Serena 的开发机可以完整 build / export / test。

### B. 处理当前 Issues

从 `docs/maintenance/backlog.md` 与 Issues 开始，不从旧 audit 猜。

### C. 真机阅读 QA

至少：

- iPhone；
- desktop；
- 一种 EPUB reader；
- 一次 PDF 打印预览。

### D. 检查高访问章节

结合 GoatCounter 看哪些内容最常读，优先保证这些页面：

- links；
- dates；
- mobile readability；
- actionability。

### E. 建立 2027 refresh project

提前列出每年必变数字与来源。

---

## 30. 项目可以进一步发展的几个大方向

### 30.1 从“手册”进化成“生活操作系统的公开参考层”

私人数据继续留在用户自己的系统；项目只提供：

- 应该记录什么；
- 应该检查什么；
- 应该什么时候行动；
- 去哪里办。

不要让公开项目变成保存真实家庭档案的产品。

### 30.2 更强的 event-first UX

首页进一步从“40章目录”向“我现在发生了什么”转化，例如：

- 搬家；
- 失业；
- 生病；
- 医疗拒赔；
- 证件丢失；
- 怀孕；
- 买房；
- 移民 notice；
- 父母突发情况；
- 长期回国。

### 30.3 Evidence freshness dashboard

给维护者显示：

- due；
- overdue；
- partial；
- blocked；
- source changed；
- high-impact scope。

给读者只显示简洁、避免误导的核验信息。

### 30.4 Dependency map

建立“一个事实改动会影响哪里”的 machine-readable mapping：

- chapter；
- checklist；
- search entry；
- update entry；
- reader route。

这样税务数字变了时，不靠记忆找所有副本。

### 30.5 Better diff review

对动态官方页做：

- normalized text snapshot；
- semantic diff；
- trigger review issue。

仍然坚持：**diff 只触发人工核验。**

---

## 31. 不要破坏的项目哲学

1. **读者的下一步比漂亮理论重要。**
2. **事实边界比语气自信重要。**
3. **官方来源不是装饰，是让读者继续行动的入口。**
4. **不确定就明确不确定，不猜。**
5. **动态规则要维护，不能把文章当一次性出版物。**
6. **自动化帮助发现问题，不替代事实判断。**
7. **稳定链接和读者本地数据是产品承诺。**
8. **少而可靠的功能优于大量半成品服务。**
9. **高后果领域宁可写窄，也不要写错。**
10. **构建成功从来不等于内容被专业认证。**

---

## 32. 重要文件速查

### 写内容

- `STYLE.md`
- `CONTRIBUTING.md`
- `METHODOLOGY.md`
- `references/source-policy.md`
- `references/citation-guide.md`

### 查当前维护

- `docs/maintenance/backlog.md`
- GitHub Issues
- `maintenance/review-registry.json`
- `maintenance/reviews/README.md`

### 改网站

- `site/`
- `docs/reader/reading-tools.md`
- `docs/reader/reader-services.md`
- `docs/maintenance/site-maintenance.md`

### 构建发布

- `docs/maintenance/development.md`
- `scripts/validate.py`
- `.github/workflows/`

### 历史审计

- `docs/audits/README.md`
- `references/editorial-status.md`

### 版权

- `COPYRIGHT.md`
- `LICENSING.md`
- `LICENSE`

---

## 33. 接手时的“不要做”清单

- [ ] 不要直接在 main 上无 PR 大改。
- [ ] 不要手改 `_site/`、`_export/`、`_maintenance/`、`_tools/`。
- [ ] 不要把 private data 放进 repo。
- [ ] 不要批量重算 stable IDs。
- [ ] 不要把语言编辑写成“事实重新核验”。
- [ ] 不要用 link checker 成功代替 source review。
- [ ] 不要在 partial evidence 下推进 `last_verified`。
- [ ] 不要手动关闭仍有任务的自动 maintenance Issue。
- [ ] 不要因为页面 403 就拿搜索摘要作为正式事实依据。
- [ ] 不要把某州规则推广全国。
- [ ] 不要把某个人经历写成普遍规则。
- [ ] 不要把 proposed rule 写成 effective rule。
- [ ] 不要把网页 update date 当作 rule effective date。
- [ ] 不要把一个 Release 的附件覆盖成新版。
- [ ] 不要随意改版权许可。

---

## 34. 推荐 Serena 的 PR 模板思路

每个 PR 最好清楚回答：

**What**
- 改了什么。

**Why**
- 为什么值得改。

**Scope**
- 哪些文件 / 内容受影响。

**Facts**
- 是否涉及动态事实。
- 如果有，证据记录在哪里。

**Compatibility**
- 是否改标题、ID、route、task。

**Validation**
- `validate --quick` / full validate；
- 设备 QA；
- live check。

**Release**
- routine maintenance 还是需要版本发布。

---

## 35. 当前正式状态

截至本文写入：

- 正式版本：`v1.2`
- 40 章正文；
- 多组事件型 checklist；
- GitHub Pages 在线站点；
- 多格式离线导出；
- 本地收藏 / 进度 / checklist / 阅读设置；
- JSON 备份；
- 离线章节；
- RSS；
- GoatCounter；
- 自动链接检查；
- 自动 maintenance queue；
- evidence registry / review records；
- PR validation；
- formal release workflow。

历史上已经完成大量语言、结构、链接、动态事实和 reader QA 工作，但项目仍是持续维护状态。**任何“已完成”都必须理解成具体 scope 的完成，不是对全书永久正确的认证。**

---

## 36. 最后给下一位维护者的一句话

维护这个项目时，最重要的问题不是：

> “怎么把 repo 变得更复杂？”

而是：

> “一个真实读者今天遇到这件事时，能不能快速找到下一步，并且我们有没有诚实地说明这条信息在什么日期、什么地区、对什么人有效？”

只要持续守住这个标准，项目可以长期增长而不失控。

