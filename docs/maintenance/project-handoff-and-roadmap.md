# US–China Life Playbook：项目交接、长期发展与维护手册

> 交接对象：Serena 及后续维护者  
> 准备日期：2026-09-28  
> 当前正式版本：v1.2  
> 仓库：gjimzhou/US-China-Life-Playbook  
> 线上阅读：https://gjimzhou.github.io/US-China-Life-Playbook/

这份文档的目标不是再造一套规则，而是把整个项目的“脑内地图”集中到一个入口：项目为什么这样组织、哪些东西绝对不能误改、事实如何核验、网站如何构建、自动化如何工作、什么算完成、现在还缺什么、未来应该往哪里发展。

动态状态仍以 GitHub Issues、Actions、维护台账和仓库当前文件为准。本文件用于交接和长期方向，不要把它变成第二个手工维护队列。

---

## 0. 先理解这个项目是什么

US–China Life Playbook 不是一篇文章，也不是单纯的网站。它实际上由三套彼此独立但互相连接的系统组成：

1. **内容系统**  
   40 章正文、场景清单、目录、术语、方法论、免责声明和实用来源。目标是让在美国生活、同时与中国保持家庭和社会连接的人，在遇到医疗、税务、移民、住房、家庭、旅行、事故、跨境事务等问题时，知道先做什么、去哪里查、什么时候找专业人士。

2. **阅读产品**  
   GitHub Pages 静态阅读器、全文搜索、章节目录、收藏、阅读进度、可勾选清单、字号与行距、备份恢复、稳定分享链接、主动离线保存、RSS 和匿名访问统计。它不是把 Markdown 原样丢到网页，而是一个有稳定 ID 和兼容约束的阅读产品。

3. **持续核验与发布系统**  
   动态事实台账、证据记录、链接健康检查、自动维护队列、构建回归、六种离线导出、正式固定版本和持续部署。这里最重要的原则是：**链接能打开、构建能通过、事实被核验，是三件不同的事。**

任何后续工作都要先判断自己在改哪一层。不要因为某一层绿了，就假设另外两层也完成。

---

## 1. Serena 接手后的第一小时

建议按这个顺序进入项目，不需要把所有历史审计从头读一遍：

1. 先读 [AGENTS.md](../../AGENTS.md)。这是维护者的最短入口。
2. 再读本文件，建立整个项目的结构和边界。
3. 打开 [当前维护待办](backlog.md) 和 GitHub Issues，区分：
   - 人工 backlog；
   - 自动维护队列；
   - 构建／链接故障自动 Issue。
4. 打开最近一次 GitHub Actions，确认 main 当前是否健康。
5. 本地 clone 后先跑：
   
       python scripts/validate.py --quick

   环境完整后再跑：

       python scripts/validate.py

6. 打开线上站点，实际点一次：
   - 目录与搜索；
   - 一个正文页；
   - 一个 checklist；
   - 收藏／进度；
   - 独立分享页；
   - 离线入口；
   - 下载页。
7. 第一个 PR 尽量做一个边界清楚的小任务，确认本地环境、CI、稳定 ID 和发布链路都理解正确，再做大规模改动。

不要用“把所有历史文档都看完”作为开始工作的前置条件。历史审计主要用于追溯，不是当前任务列表。

---

## 2. 仓库结构：哪里是什么

| 路径 | 作用 | 维护时最容易犯的错 |
| --- | --- | --- |
| README.md | 项目首页、主要读者入口、当前高层状态 | 把历史数量写成永远正确的实时统计 |
| HOME.md | 阅读导览 | 和 README / CONTENTS 重复堆内容 |
| CONTENTS.md | 全书目录和清单入口 | 改标题后漏掉稳定路由兼容 |
| book/ | 40 章正文 | 语言修改顺手刷新“最后核验” |
| checklists/ | 场景执行清单 | 和正文重复维护同一动态数字 |
| references/ | 来源规范、引用规范、编辑状态 | 把历史审计状态当实时事实状态 |
| maintenance/review-registry.json | 动态事实复核台账 | partial 也推进 last_verified |
| maintenance/reviews/ | 每次复核的证据记录 | 只写“已检查，无变化”，没有逐项证据 |
| docs/reader/ | 读者功能说明 | 文档说已启用，但 services.json 实际没启用 |
| docs/maintenance/ | 开发、发布、维护、backlog | 再造重复流程 |
| docs/audits/ | 历史审计与阶段记录 | 把旧“待办”继续当当前 backlog |
| docs/releases/ | 正式版本说明 | 日常小修也新建版本 |
| site/ | 阅读器代码、稳定 ID、服务配置 | 重算 ID、破坏旧收藏和深链 |
| scripts/ | 构建、导出、检查、维护报告 | 在多个 workflow 复制同一套安装逻辑 |
| updates/entries.json | RSS / 重要更新人工条目 | 每个 commit 都发更新 |
| .github/workflows/ | PR、部署、维护、链接、发布 | 以 workflow success 代表内容事实正确 |
| _site/、_export/、_maintenance/、_tools/ | 生成物／本地工具 | 直接编辑或提交 |

当前 README 报告 40 章正文和 40 份清单；阅读工具文档还引用生成文档总数与清单任务总数。以后需要精确数字时，以当前构建结果为准，不维护一个“永远不会过时”的手写总数。

---

## 3. 十一条不可破坏的项目约束

### 3.1 不提交真实私人资料

公开仓库只能放通用规则、公开来源、虚构示例和空白模板。不要提交：

- 姓名、地址、电话、私人邮箱；
- 护照、身份证、SSN、A-number、移民收据号；
- 账户、保险会员号、税务文件；
- 病历、处方、私人通信；
- 可识别的精确行程、雇主、薪酬、家庭关系材料；
- 浏览器截图里残留的账户头像、二维码、地址或标签页信息。

这条优先级高于“例子更真实”。

### 3.2 构建通过不等于事实核验

CI 只能证明代码、链接结构、导出和回归检查满足自动化规则。它不能证明：

- 法律仍然有效；
- USCIS 当前表格版本没变；
- 医学指南没有更新；
- 税额还是当前年度；
- 州／地方规则适用于某个地址。

任何 PR 描述里都不要把“validate passed”写成“content verified”。

### 3.3 链接可访问不等于来源支持主张

External link report 解决 HTTP 层问题。一个 200 页面可能：

- 已经换了含义；
- 只剩机构首页；
- 是旧年度；
- 是搜索落地页而不是原规则；
- 仍能打开但内容已被新规则取代。

修链接时必须实际阅读目标内容，不允许为了绿灯把所有深链接换成首页。

### 3.4 partial 不能推进 last_verified

维护台账中：

- last_review_attempt = 最近一次实际尝试；
- latest_review_record = 最近一次证据记录；
- review_status = complete / partial 等本次结果；
- last_verified = **只有完整覆盖登记 scope 才更新**；
- review_record = 对应完整核验基线。

这几个字段不能互相代替。

如果页面 403、只核了一半、只读到搜索摘要、只确认了一个数字，必须保留 partial。

### 3.5 自动维护 Issue 不手动“清队列”

自动维护 Issue 的正文由程序同步。规则是：

- 台账仍有到期任务时，人工关闭后也会被重新打开；
- 全部真实处理后脚本才应反映队列变空；
- 讨论可以写评论；
- 不要把手写 TODO 塞进自动生成正文；
- 不要为了看起来完成而改日期。

当前自动维护队列以 GitHub 上的对应 Issue 为准；不要在本文件复制一个长期手工版本。

### 3.6 语言编辑不刷新事实核验日期

只改中文表达、结构、重复、标题、标点或术语时：

- 可以更新“最后编辑”；
- 不更新事实核验；
- 不把整章标成重新审定。

### 3.7 稳定 ID 不能重算

site/content-ids.json、site/task-ids.json、site/anchor-aliases.json 是产品兼容层。

它们关联：

- 旧链接；
- 收藏；
- 阅读进度；
- checklist 勾选状态；
- 独立分享页；
- 离线副本；
- 更新提示。

新增内容可以新分配 ID；原有内容不能因为排序、改标题或“想整理得更漂亮”而重算。

### 3.8 标题和文件名不是随便改的

正文地址、章节锚点和稳定 ID 被外部引用。标题改动要：

- 保留 content ID；
- 维护 anchor alias；
- 检查旧 SPA hash link；
- 检查静态 read/<contentId>.html；
- 检查目录、搜索和离线链接。

能不改文件路径时，不为“目录整齐”搬文件。

### 3.9 生成目录不直接编辑

_site、_export、_maintenance、_tools 是构建生成物或本地工具目录。源文件在 book、checklists、site、scripts、docs 等位置。

### 3.10 正文和代码许可不是普通开源许可

项目整体不是 MIT / Apache / CC 全站开放授权。

- 正文、清单和原创编排按 COPYRIGHT.md / LICENSE / LICENSING.md；
- 项目原创代码仅有项目规定的有限使用许可；
- site/vendor/marked.js 等第三方代码保留各自许可证；
- 历史上已有效授出的 CC BY-NC 4.0 覆盖范围不能被新版声明追溯撤销。

不要把仓库“一键改成 MIT”，也不要新增整站镜像／再分发能力而不先确认授权。

### 3.11 高后果内容不猜

医疗、移民、税务、保险、劳动、刑事、证券、遗产和跨境事项，无法确认时宁可明确写“不确定／待核”，也不要补一个看起来顺畅的答案。

---

## 4. 内容编辑模型

### 4.1 五类内容性质

项目把内容性质和证据等级分开。常见类型：

- 规则说明；
- 指南解读；
- 决策框架；
- 管理／经验建议；
- 专业咨询准备。

不要因为引用了政府网页，就把后续生活方式建议也包装成官方规则。

### 4.2 A / B / C 是证据质量，不是强制程度

- A：高可信规则／指南／高质量证据；
- B：中等可信研究或专业实务；
- C：实践判断／社会流程／管理建议。

它不是法律“强制等级”，也不是 USPSTF A/B/C。

### 4.3 P0–P3 是准备优先级，不是急诊分诊

P0–P3 代表本项目建议的准备顺序。真正的法定期限、急救触发条件、通知截止日必须另写清楚。

### 4.4 正文和 checklist 的分工

正文回答：

- 为什么；
- 适用于谁；
- 规则和例外；
- 如何判断；
- 去哪里查；
- 什么时候需要专业人士。

Checklist 回答：

- 现在先做什么；
- 哪些动作需要记录；
- 什么算完成；
- 下一步找谁。

同一动态数字尽量只在主要解释位置维护；清单链接过去，不要在多个文件手工复制。

### 4.5 读者链接的目标是“继续办事”

引用不是论文装饰。优先给：

- 官方原文；
- 官方 FAQ；
- 办理入口；
- 查询工具；
- 计算器；
- 表格与说明；
- 必要时专业解释。

链接文字要写清“点进去能做什么”。

---

## 5. 动态事实维护系统

### 5.1 台账入口

核心文件：

- [maintenance/review-registry.json](../../maintenance/review-registry.json)
- [maintenance/reviews/README.md](../../maintenance/reviews/README.md)
- [持续维护工作流](maintenance-workflow.md)

台账初始覆盖 11 个高变动范围，包括疫苗、急救、医保、税务、福利、旅行、移民、跨境税和家庭雇员等。

### 5.2 一个 scope 怎样算完成

完整复核至少需要：

1. 找到 scope 对应正文的具体主张；
2. 阅读当前官方原文，而不是只看搜索摘要；
3. 核对人群、身份、司法辖区、年度；
4. 核对发布日期和生效日期，不把页面更新时间当生效日；
5. 核对例外、过渡期和临时延期；
6. 检查同一数字／结论是否被清单或其他章节复用；
7. 更新需要修改的正文；
8. 留下 maintenance/reviews/YYYY-MM-DD-topic.md 证据记录；
9. 只有覆盖全部登记 scope 后，才推进 last_verified。

如果 scope 太宽，长期维护上更好的做法不是“勉强 complete”，而是把它拆成更小、独立、可重复核验的 scope。

### 5.3 固定节奏

当前维护设计大致是：

| 周期 | 主要任务 |
| --- | --- |
| 每周 | 外链报告、高变动来源、轮查正文／清单 |
| 每 14 天 | 旅行、移民动态范围 |
| 每 30 天 | 税务、福利、医保、疫苗等 |
| 每 90 天 | 急救、阅读体验、导出抽查 |
| 每年 10 月至次年 1 月 | 下一年度税额、福利限额、表格和参保材料 |
| 重大变化出现时 | 不等周期，立即复核 |

这些是编辑节奏，不是官方规定。

### 5.4 review_by 用于明确到期事件

临时延期、过渡政策、已知 sunset date 等，不应因为今天核完就自动顺延一个周期。

使用：

- review_by；
- review_by_reason。

复核这个事件后再删掉或更新对应日期。

### 5.5 维护的三个独立信号

永远分开看：

1. **Link health**：URL 是否能访问；
2. **Evidence validity**：来源是否仍支持主张；
3. **Build / product health**：网站、搜索、导出是否工作。

不要把三者合并成一个“健康分数”。

---

## 6. 重复主题如何避免漂移

[主题维护表](topic-maintenance.md)记录了若干“主要解释位置”。典型例子：

- 医疗账单／申诉：第 04 章；
- 支付争议／诈骗：第 16 章；
- 房贷／交割：第 36 章；
- 美国税务：第 14 章；
- 跨境税：第 38 章；
- 航班退款：第 29 章；
- 死亡后事务：第 35 章。

更新动态规则时，先查主要维护位置，再查场景 checklist，避免同一个期限出现两个版本。

长期应继续扩充 topic-maintenance.md，而不是依赖维护者记忆。

---

## 7. 阅读器和网站架构

### 7.1 核心 site 文件

| 文件 | 主要职责 |
| --- | --- |
| site/index.html | 主阅读器 HTML |
| site/app.js | 主应用、导航、搜索等 |
| site/reader.js | 阅读相关状态 |
| site/tools.js | checklist、设置、备份等工具 |
| site/offline.html / offline.js | 离线阅读管理 |
| site/sw.js | 主动保存的 service worker |
| site/style.css | 样式 |
| site/theme.js | 主题 |
| site/content-ids.json | 稳定文档／小节 ID |
| site/task-ids.json | 稳定 checklist 任务 ID |
| site/anchor-aliases.json | 历史锚点兼容 |
| site/reading-paths.json | 编辑选择的阅读路线 |
| site/services.json | analytics / comments / newsletter 等服务开关 |

### 7.2 当前已上线的读者能力

- 全文搜索；
- 主题目录和场景入口；
- 收藏；
- 继续阅读／阅读进度；
- checklist 勾选；
- 字号和行距；
- JSON 备份／恢复；
- 稳定独立分享页；
- 主动保存指定章节离线阅读；
- RSS 重要更新；
- GoatCounter 匿名技术统计。

### 7.3 当前没有启用的能力

- 评论；
- 点赞；
- 邮件订阅。

代码可能保留适配能力，但“有代码”不等于“已上线”。唯一服务配置入口是 site/services.json。

启用评论或邮件前必须先完成：

- 服务商账号；
- 隐私边界；
- 审核；
- 垃圾信息；
- 限流；
- 删除；
- 确认订阅／退订；
- 故障回退；
- 真机验证。

不要先显示一个假的评论数或订阅表单再补后端。

### 7.4 本地数据模型

收藏、进度、清单状态、阅读设置主要保存在浏览器本地，不自动跨设备同步。

备份恢复尤其注意：

- 不假装“导出”就等于 OS 已永久保存；
- 恢复前校验格式；
- 收藏合并去重；
- checklist 完成状态并集合并；
- 阅读位置和显示设置需要明确替换；
- 损坏数据不自动覆盖。

### 7.5 离线模型

离线是**主动保存选中的独立章节**，不是后台下载整站。

Service worker：

- 只在需要时注册；
- 不缓存整个 SPA；
- 不缓存 analytics / comments API；
- 新副本完整成功后才替换旧副本；
- 在线优先，断网回退保存版本。

离线内容版本指内容指纹，不是事实核验日期。

---

## 8. 稳定 ID：改内容时最重要的工程约束

### 8.1 content IDs

site/content-ids.json 把文件／小节映射到稳定身份。

同一内容：

- 改标题：保留 ID；
- 移位置：尽量迁移原 ID；
- 新内容：分配新 ID；
- 真正删除：保留兼容思路，不复用旧 ID。

### 8.2 task IDs

site/task-ids.json 保护 checklist 勾选状态。

如果只是措辞优化，但仍是同一行动：迁移原 ID。  
如果任务含义实质改变：新 ID。  
如果删除：旧 ID 可 tombstone，不复用。

工具：

    python scripts/task_identity.py

发现新条目后先人工判断是否迁移，再考虑：

    python scripts/task_identity.py --assign-new

不要把“脚本能分配新 ID”当成“应该给所有修改分配新 ID”。

### 8.3 anchor aliases

改标题／锚点时同步历史 alias。兼容旧链接优先于目录美观。

---

## 9. 构建、测试和本地环境

### 9.1 环境

当前开发说明要求：

- Python 3.12+
- Node 22
- Java 21
- Pandoc 3.11
- EPUBCheck 5.4.0
- WeasyPrint 及系统库
- 中文字体
- Playwright Firefox

初次环境大致：

    python3.12 -m venv .venv
    . .venv/bin/activate
    python -m pip install -r requirements.txt
    npm ci
    npx playwright install firefox
    python scripts/validate.py --quick

### 9.2 唯一完整检查入口

完整验收：

    python scripts/validate.py

quick 模式不包含全部浏览器和导出测试，不能作为正式发布验收。

### 9.3 目前验证覆盖

完整链路包括：

- Python 单元测试；
- 维护台账一致性；
- 网站构建；
- 稳定路由／历史锚点；
- Firefox 浏览器回归；
- 读者功能测试；
- 六种导出；
- EPUBCheck；
- 网站内部链接和静态阅读页。

不要在 PR 文案里自己列一个“差不多的测试组合”替代 validate.py。

### 9.4 生成环境并非完全逐字节可复现

字体、系统库和不同平台底层依赖仍可能影响 PDF 排版。自动构建通过后，正式版本或重大排版改动仍需要人工抽查。

---

## 10. GitHub Actions 和自动化心智模型

主要工作流分工：

- PR validation：验证 proposed changes；
- main deployment：完整验证后部署 Pages；
- link health：外部链接报告；
- maintenance：维护台账和到期队列；
- monitor：部署／维护／链接故障追踪；
- release：发布固定正式版本。

关键原则：

- main 自动更新网站；
- 正式 GitHub Release 不是每次 main 更新都发；
- 部署使用已验证产物，不重新走一套不同构建逻辑；
- 故障 Issue 应持续复用，恢复后自动关闭；
- 自动维护队列不是人工 sprint board。

如果改 CI，优先改共享 build / setup 入口，不在每个 workflow 复制依赖安装和测试命令。

---

## 11. 发布模型

### 11.1 日常维护

错字、小范围链接修正、局部事实维护：

- 正常 PR；
- 合并 main；
- 自动部署网站；
- 通常不 bump VERSION；
- 通常不发 GitHub Release。

### 11.2 正式固定版本

正式版本适合：

- 成批内容更新；
- 读者功能升级；
- 大范围事实／文风修订；
- 需要可引用快照。

发布前同步：

- VERSION；
- README；
- DOWNLOADS；
- CHANGELOG；
- docs/releases/<version>.md。

然后 Actions → **Publish a fixed edition**。

当前版本：v1.2。

### 11.3 回退

坏改动：

- 用 revert commit；
- 不 force-push main；
- 重新走完整验证和部署。

已发布 Release 不覆盖旧附件。需要修复时发补丁版本。

---

## 12. 常见任务的标准做法

### 12.1 只改中文表达

1. 读 STYLE.md；
2. 不改变规则范围；
3. 不更新事实核验日期；
4. 标题变化检查稳定 ID / alias；
5. 跑 quick，必要时 full validate；
6. PR 中明确“language/editorial only”。

### 12.2 修改动态事实

1. 找主要维护位置；
2. 找 registry scope；
3. 逐条读官方原文；
4. 记录适用地区、人群、日期、例外；
5. 更新正文；
6. 检查相关 checklist；
7. 写 evidence record；
8. partial 则不推进 last_verified；
9. full validate；
10. PR 说明本次真正覆盖到哪里。

### 12.3 修外链

1. 确认是 404、403、限流、重定向还是语义过时；
2. 找原机构当前页面；
3. 阅读新页面；
4. 确认仍支持相邻结论；
5. 再换链接；
6. 不把首页当万能替代。

### 12.4 新增 checklist

1. 先搜索是否已有同场景；
2. 让 checklist 聚焦行动，不复制整章解释；
3. 给 reader-facing 官方入口；
4. 更新目录／事件索引；
5. 分配稳定 content ID；
6. 为新增勾选项分配 task ID；
7. 检查 search / reading paths 是否需要更新；
8. full validate。

### 12.5 改标题或小节

1. 保留内容身份；
2. 更新 anchor alias；
3. 检查目录和引用；
4. 检查独立静态页；
5. 检查历史 deep link；
6. 浏览器回归。

### 12.6 改阅读器

至少检查：

- 桌面；
- 手机；
- 键盘 focus；
- 中文／英文搜索词；
- 空结果；
- filter / reset；
- 收藏；
- checklist；
- backup / restore；
- 分享；
- 无 JS 静态页；
- offline；
- print / export 如受影响。

### 12.7 更新依赖

Dependabot PR 不自动合并。依赖升级至少：

- full validate；
- 浏览器回归；
- 导出抽看；
- 若涉及字体／Pandoc／WeasyPrint，重点看 PDF / EPUB。

---

## 13. 什么算“完成”：Definition of Done

### 13.1 内容事实 PR

必须同时满足：

- 主张有直接来源；
- 适用范围明确；
- 动态日期正确；
- 例外没有被省略成误导性绝对结论；
- 复用位置检查过；
- evidence record 完整；
- registry 状态真实；
- 自动构建通过。

### 13.2 语言 PR

必须满足：

- 中文独立可读；
- 术语首次出现规则符合 STYLE；
- 没有改变法律／医学／税务含义；
- 没有误更新 verification；
- 稳定链接没有破坏。

### 13.3 网站 PR

必须满足：

- 主要功能没有回归；
- 手机和键盘可用；
- stable IDs 不受破坏；
- 旧链接仍工作；
- 静态页／离线边界真实；
- analytics 不新增隐私数据；
- full validate 通过。

### 13.4 正式版本

必须满足：

- VERSION 和版本说明一致；
- release workflow 完整通过；
- 下载附件齐全；
- 校验值正确；
- 线上站点核对；
- 不把版本发布写成“全书专业审定”。

---

## 14. 当前交接状态（2026-09-28）

### 已完成的大框架

- 40 章正文体系已建立；
- 场景 checklist 体系已扩展；
- 中文优先写作规范已统一；
- reader-facing 来源和办事入口已大幅补齐；
- 维护台账和 evidence record 机制已上线；
- 外链、维护队列和故障 Issue 已自动化；
- 网站具有收藏、进度、清单、备份、离线、分享和 RSS；
- GoatCounter analytics 已启用；
- v1.2 已发布；
- main 的 PR validation / Pages 发布链路已经建立。

### 明确还没有完成的事情

1. **真实设备／电子书体验**
   - 见 Issue #5；
   - 需要真实手机、Kindle 或其他实体阅读器；
   - 浏览器模拟不能代替；
   - 重点看目录、字号、表格、内部跳转、跨页和字体。

2. **官方来源变化提醒**
   - 见 Issue #6；
   - 目标是少量高变动来源的 change detection；
   - 只触发人工复核任务；
   - 不能自动改写医疗／法律／税务结论。

3. **持续事实维护**
   - 自动维护队列是实时入口；
   - 证据记录中仍存在 partial 范围；
   - partial 必须保留，直到真正完整覆盖。

4. **PDF 全书逐页视觉 QA**
   - v1.2 明确仍未完成整本人工逐页检查。

5. **真实新读者试读**
   - 自动化和编辑者模拟不能替代新读者反馈。

6. **评论和邮件订阅**
   - 仍关闭；
   - 没必要为了“功能齐全”强行上线。

7. **仓库设置的最后一轮人工核对**
   - 只读接口已确认 main 保护和 validate 要求；
   - 更细的 GitHub 设置仍可由仓库所有者登录后按需要检查；
   - 不需要为了形式反复修改。

---

## 15. 后续发展路线图

以下是建议路线，不是自动承诺。优先级应随着真实读者问题、维护负担和官方规则变化调整。

### Phase A：先让维护机制真正稳定

目标：项目即使换维护者，也不会因为“日期漂亮”而失去证据纪律。

优先做：

1. 完成当前到期 maintenance scope，但保持 partial / complete 真实；
2. 把过宽的 registry scope 拆成更小的独立范围；
3. 给高变动来源建立 change alert 试点；
4. 扩充 topic-maintenance.md，减少重复数字；
5. 把 review record 模板使用得更一致；
6. 对正文中的年份、金额、年龄、期限做周期扫描；
7. 避免把章节末一个“最新日期”当全章认证。

### Phase B：补真实阅读体验

目标：自动化之外，有人真的在手机和电子书上读。

建议：

1. 完成 Issue #5；
2. iPhone / Android 各至少一轮；
3. Kindle / Apple Books / 其他 EPUB 阅读器至少一轮；
4. 打印或 PDF 阅读器检查跨页、表格、中文字体；
5. 找一位没有参与编辑的人完成 5–10 个真实任务：
   - 找一个急救入口；
   - 找一个税务期限；
   - 找一个移民地址更新；
   - 完成一个 checklist；
   - 保存并恢复阅读数据；
   - 保存离线页。
6. 把“找不到下一步”的问题优先于视觉微调。

### Phase C：把“核验透明度”做成读者功能

长期很值得做：

- 在读者页面展示具体 scope 的核验日期；
- 明确 complete / partial 的范围；
- 不显示误导性的“整章已验证”；
- 允许读者看到最近重要勘误；
- stable content ID 和 review scope 建立清楚映射。

这会把后台证据纪律真正转化为用户信任，而不是只留在维护目录。

### Phase D：提高搜索和导航质量

现有搜索已经可用，未来可以继续优化：

- 同义词；
- 中文／英文术语映射；
- 表格编号搜索；
- 场景词到章节的 editorial mapping；
- 高后果入口优先；
- 搜索空结果建议；
- 章节内结果和全书结果区分；
- 不用点击率自动改变医疗／法律内容排序。

### Phase E：扩展真实场景，而不是继续“凑章节”

新增内容的判断标准：

- 是否是第一代移民高频或高后果问题；
- 是否有明确第一步；
- 是否需要中美衔接；
- 是否存在现有章节覆盖不到的操作缺口；
- 是否能找到可靠来源；
- 是否值得额外维护成本。

优先从读者真实 Issue 和反馈中增长，不按“每个领域都必须有一章”扩张。

### Phase F：可选的社区／更新服务

评论和邮件订阅只在有明确需求时开启。

如果启用：

- 评论必须有审核；
- 不允许提交私人案件材料；
- 举报／删除流程清楚；
- newsletter 必须有确认订阅和退订；
- 不把昵称当身份验证；
- 不把 reader data 接入公开 analytics；
- 服务故障不能阻断核心阅读。

### Phase G：未来正式版本

一个合理的 v1.3 候选完成标准可以是：

- 当前高变动 scope 建立更细的 evidence baseline；
- real-device / e-reader QA 完成一轮；
- source change alert 小规模上线；
- reader-facing verification transparency 有第一版；
- 若有明显 UX 改动，再配合 reader study；
- full validate + release workflow 全部通过。

不要为了“该发 v1.3 了”而先定日期后补内容。

---

## 16. Serena 的建议工作方式

### 16.1 每个 PR 只解决一个主要问题

例如：

- maintenance/vaccines-2026-10
- content/insurance-appeal-update
- site/mobile-reader-nav
- docs/reader-qa
- chore/dependency-update

不要把事实维护、样式重构、依赖升级和几十章语言润色塞进同一个 PR。

### 16.2 高后果内容最好让证据先行

PR 描述建议写：

- 为什么改；
- 哪些具体句子受影响；
- 官方来源；
- 生效日期；
- 适用边界；
- 未覆盖什么；
- 是否更新 registry；
- 验证命令。

这比“updated immigration info”更有审计价值。

### 16.3 使用 AI / Codex 时的规则

AI 很适合：

- 找重复；
- 机械扫描；
- 比较版本；
- 生成候选修订；
- 跑测试；
- 组织证据记录。

AI 不应自行决定：

- 某个法律 scope 已 complete；
- 搜索摘要足够替代官方全文；
- CI 通过就是医学／法律审定；
- 因为要清队列而推进 last_verified；
- 重新分配稳定 ID；
- 把私人用户资料写进示例。

给 AI 的任务最好明确：

1. 先读 AGENTS.md；
2. 指定 source-of-truth 文件；
3. 指定“不许改”的字段；
4. 指定完成标准；
5. 要求列出未覆盖缺口。

### 16.4 不需要完美才能提交，但必须真实

允许：

- partial；
- unresolved；
- source blocked；
- needs state-specific review。

不允许：

- 假 complete；
- 假 current；
- 假 verified；
- 假 deployment；
- 假 reader count。

---

## 17. 建议的所有权边界

Serena 作为 collaborator 可以继续大多数日常维护，但以下事项建议保持额外谨慎：

### 可常规独立处理

- 事实复核和 evidence records；
- 链接修复；
- checklist 维护；
- 文风和术语；
- reader QA；
- 网站 bug；
- 测试和构建；
- 文档；
- Dependabot；
- 小范围性能和无障碍改进。

### 建议和仓库所有者同步

- 改许可证；
- 启用收集邮箱／留言的新服务；
- 引入新的第三方 analytics；
- 大规模重组章节；
- 删除稳定公开 URL；
- 改项目定位；
- 正式大版本发布；
- 任何需要新密钥／计费账号的服务；
- 会扩大公开收集个人数据范围的功能。

这不是为了制造审批瓶颈，而是因为这些决定会改变项目的法律、隐私或长期产品边界。

---

## 18. Issue 和 backlog 怎么用

### GitHub Issues

作为**当前任务状态主要入口**。适合：

- bug；
- 内容纠错；
- reader feedback；
- backlog task；
- 自动维护 queue；
- 自动故障 tracking。

### docs/maintenance/backlog.md

只放“还没有完成、需要人处理”的相对稳定工作。完成后移出，不保留历史墓地。

### docs/audits/

保存历史：

- 某一轮做了什么；
- 当时发现什么；
- 当时的验收结果。

不要因为 audit 里三个月前写了“下一步”，就默认今天仍是 backlog。

---

## 19. 读者统计怎样解释

当前 GoatCounter：

- 是匿名技术统计；
- 普通 page record 有自身会话去重；
- page-open 事件表示打开，不代表读完；
- last_section_visible 不代表完成阅读；
- DNT / GPC / 拦截器会漏计；
- 独立静态页和离线页当前不一定统计；
- 不发送原始搜索词、收藏、留言或私人查询参数。

不要写：

- “有 X 个真实用户”；
- “这些人都读完了”；
- “一个 IP 就是一个人”。

统计用于产品方向，不用于事实内容排序或用户画像。

---

## 20. 隐私和安全继续保持“静态优先”

这个项目目前最大的产品优势之一是：核心阅读不需要账号。

未来加任何服务前先问：

1. 能不能继续静态实现？
2. 真的需要后端吗？
3. 是否需要身份？
4. 是否会保存敏感问题？
5. 如果服务挂了，核心阅读会不会坏？
6. 数据是否能最小化？

不要为了“现代化”把一个静态、低风险的知识产品变成高维护 SaaS。

---

## 21. 不建议做的“看起来很酷”的重构

除非有真实问题，不建议：

- 把所有 Markdown 搬到 CMS；
- 把所有章节 URL 重写；
- 重算 content / task IDs；
- 把静态站改成需要登录的应用；
- 用 AI 自动改法规结论；
- 自动把 source diff 直接发布到正文；
- 把所有外链替换成机构首页；
- 建一个“总可信度百分比”；
- 建一个“人生完成分数”；
- 因为部分条目 stale 就隐藏整个章节；
- 为了 SEO 复制大量近似页面；
- 自动抓取论坛内容作为证据；
- 给读者生成个案医疗／法律结论。

项目的价值来自“可信、可执行、低摩擦”，不是功能数量。

---

## 22. 发生问题时的排查顺序

### 网站没更新

1. 看 main 是否真的包含 commit；
2. 看 validate 是否成功；
3. 看 deploy job；
4. 看 live site；
5. 不要只看到 build artifact 就说已上线。

### 某链接红了

1. 看是 404 / 410 还是 403 / timeout；
2. 手工打开；
3. 找机构当前页面；
4. 检查语义；
5. 再决定换不换。

### 某 scope 到期

1. 看 registry；
2. 看最近 evidence record；
3. 找未决 gap；
4. 读当前正文；
5. 核官方源；
6. 完整才 last_verified。

### 导出坏了

1. 不编辑 _export；
2. 找 source / build script；
3. full validate；
4. 真正打开 PDF / EPUB 抽查。

### 旧链接坏了

1. 查 content ID；
2. 查 anchor aliases；
3. 不直接删除旧兼容；
4. 增加显式映射；
5. 跑历史路由回归。

---

## 23. 一份好 PR 的最小模板

### 目的

说明读者问题或维护问题。

### 范围

列出修改文件和不修改的范围。

### 事实依据

如果有动态事实：
- 官方 URL；
- 发布／生效日期；
- 适用人群；
- 例外。

### 维护状态

- 是否新建 evidence record；
- 是否 complete / partial；
- 是否更新 last_verified；
- 是否有后续 review_by。

### 兼容性

- content ID；
- task ID；
- anchor alias；
- old deep links。

### 验证

至少写实际运行过什么，而不是“tests pass”。

---

## 24. Serena 接手后的推荐顺序

### 第一周

- 配好本地完整环境；
- 完成一个小 PR；
- 看完当前 Issues / Actions；
- 理解 registry / review records；
- 实际走一次正式网站流程；
- 不急着重构。

### 第二周

- 处理一项真实 maintenance scope；
- 做一次 external link triage；
- 做一次 mobile / offline reader QA；
- 记录碰到的环境坑，补文档而不是只留在聊天里。

### 第一个月

- 推动 Issue #5 或 #6 至少一个明显进展；
- 选一个过宽 review scope 拆分；
- 找一位新读者做任务型试读；
- 识别一个真正值得进入下一版的 UX 改进。

---

## 25. 最重要的项目哲学

这个项目不追求：

- “所有事情都有答案”；
- “永远最新”；
- “每个章节都同样长”；
- “链接越多越权威”；
- “功能越多越成熟”。

它追求的是：

1. **读者出事时能更快找到下一步；**
2. **高后果错误尽量少；**
3. **事实和建议分得清；**
4. **不知道时敢明确说不知道；**
5. **动态规则有可审计的复核路径；**
6. **换维护者后不会靠作者记忆才能运行；**
7. **网站、离线版和历史链接长期可用；**
8. **不拿用户隐私换便利。**

如果 Serena 以后需要在“做得更漂亮”和“维护得更真实”之间选，优先后者。

---

## 26. 关键入口速查

### 维护者

- [AGENTS.md](../../AGENTS.md)
- [开发、构建与发布](development.md)
- [持续维护工作流](maintenance-workflow.md)
- [当前 backlog](backlog.md)
- [网站维护](site-maintenance.md)

### 内容与证据

- [写作规范](../../STYLE.md)
- [方法论](../../METHODOLOGY.md)
- [贡献指南](../../CONTRIBUTING.md)
- [来源原则](../../references/source-policy.md)
- [引用规范](../../references/citation-guide.md)
- [编辑状态](../../references/editorial-status.md)
- [review registry](../../maintenance/review-registry.json)
- [review records](../../maintenance/reviews/README.md)

### 阅读产品

- [阅读工具](../reader/reading-tools.md)
- [读者服务](../reader/reader-services.md)
- [analytics](analytics.md)
- site/services.json
- site/content-ids.json
- site/task-ids.json
- site/anchor-aliases.json

### 版本与授权

- [v1.2](../releases/v1.2.md)
- [CHANGELOG](../../CHANGELOG.md)
- [COPYRIGHT](../../COPYRIGHT.md)
- [LICENSING](../../LICENSING.md)
- [DISCLAIMER](../../DISCLAIMER.md)

---

## 27. 最后交接说明

这份文档应该长期保持为“项目地图”，而不是日常日志。

未来更新它时，只改这些类型的信息：

- 项目架构发生实质变化；
- 核心 workflow 改名／重构；
- 服务从关闭变启用；
- 发布模型改变；
- 稳定 ID 机制改变；
- 维护制度改变；
- roadmap 的阶段真正完成或被替换。

不要每次 maintenance queue 变化都改本文。动态任务交给 Issue 和 registry，历史过程交给 audits，正式版本交给 releases。

**一句话交接：先保真，再扩张；先保稳定身份和证据链，再做功能。**
