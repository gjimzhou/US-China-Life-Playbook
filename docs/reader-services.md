# 读者功能与服务运维

本网站保持 GitHub Pages 静态阅读架构，不增加读者账号体系。配置唯一入口是 `site/services.json`。所有外部服务默认关闭；未完成真实接入验收，不得把本地模拟测试说成已启用。账号、数据库、订阅者列表由站主管理，密码、SMTP 凭据、数据库连接串和私密 API key 只放服务商后台，不进聊天、Git 或浏览器构建产物。

## 选择与费用（2026-09-25核对）

| 功能 | 选择与免费性质 | 消耗、维护及迁移 |
|---|---|---|
| 收藏、进度、RSS | 原站内实现，无新增服务费 | 使用浏览器存储和原有 Pages 流量；本地记录不自动备份或同步；RSS及发布记录在Git中 |
| 访问统计 | Umami Cloud **Hobby持续免费档**，不是付费档14天试用 | 页面访问、事件、额外事件属性消耗额度；本实现不附加自定义属性。注册时以后台显示的当期额度和保留期为准；本轮官方价格页未能读取具体数字，未沿用第三方报价。可导出数据、迁移至自托管 PostgreSQL |
| 评论、反馈 | Waline 开源软件免费；Vercel Hobby / Neon Free 是持续免费档，非限时试用 | Vercel Hobby只适用个人非商业项目；超额可能暂停。Neon现为每项目每月100 CU-hours、0.5GB；请求消耗计算，评论及反馈消耗存储。需要审核、版本维护及备份，可导出数据库迁移 |
| 邮件更新（可选） | Brevo Free，持续免费档 | 每日300封，不累计。确认邮件、更新邮件、回复邮件等发送均应计入实际额度预算；触及额度先暂停或分批，不能擅自升级。订阅者可由站主管理、导出；DNS及发件人验证需账号所有者完成 |

“持续免费”指当前有非试用免费档，并非承诺服务商永久不改政策。没有开通付费订阅；不要选择自动续费试用、预付额度或绑定按量付费来绕过上限。若网站以后有商业用途，重新评估托管资格。

官方来源：[Umami FAQ](https://docs.umami.is/docs/cloud/faq)、[Tracker](https://docs.umami.is/docs/tracker-functions)、[指标](https://docs.umami.is/docs/metric-definitions)、[Waline部署](https://waline.js.org/en/guide/get-started/)、[Vercel Hobby](https://vercel.com/docs/plans/hobby)、[Neon plans](https://neon.com/docs/introduction/plans)、[Brevo免费限制](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)。

## 统计：站主需要提供的公开配置

1. 用自己的账号注册 Umami Cloud，选择 Hobby，添加 `https://gjimzhou.github.io/US-China-Life-Playbook/`，不要开启 Share URL 或公开 dashboard。
2. 只需提供公开 **Website ID**，如使用自托管另提供公开 tracker script URL。不要提供 API key 或账号密码。
3. 填入 `analytics.websiteId`，启用 `analytics.enabled`。代码显式关闭自动追踪，只发送经过白名单构造的载荷。DNT/GPC 开启时不加载脚本。
4. 从真实网站打开一章、下一章、返回、跳小节、点击收藏；在登录后的后台确认页面和事件到达。广告拦截、网络故障可能漏计；不要重试每次路由或绕过读者拦截。用服务商的“排除自己的访问”设置减少站主流量。

| 指标 | 本站计数方式及解读 |
|---|---|
| 全站浏览 | 每次真实切换逻辑页面发送一个 pageview；刷新、离开再返回重新计数。同一路由重绘、主题或语言展示变更不重复计数 |
| 栏目／章节／页面 | `/read/book/<稳定ID>`、`/read/checklists/<稳定ID>`、`/read/reference/<稳定ID>`；本网站一篇章就是一个完整阅读页面。按URL前缀筛栏目，按ID筛章节；`site/content-ids.json`映射中文标题所在文件 |
| 去重访问数 | 采用Umami自身的去标识化会话/访问者估算，不另设用户ID，不调用identify。设备、浏览器、网络、共享出口和服务商去重窗口都会影响结果；不是IP数量，也不是真实人数，不能识别匿名者身份 |
| 指定按钮点击 | `*_click`表示一次点击尝试，不等于操作成功；不采集所有DOM点击，不采集表单内容 |
| `read_start` | 进入正文或清单的逻辑阅读页，不是“已经开始认真阅读” |
| `section_open` | 通过深链接或目录显式打开某节；同章相同目标重绘不重复；不会额外增加章节pageview |
| `last_section_visible` | 一次章节访问中末节进入视口最多记录一次；打开末节不等于读完 |

载荷只含 Website ID、站点host、展示语言、屏幕尺寸、规范化内容ID路径和固定事件名。referrer置空，不发送原始hash、URL查询参数、站内搜索词、邮箱、昵称、留言或收藏清单。不要开启 session replay、identify 或默认表单捕获。PV与事件分别查看，切勿将套餐计费事件数称为浏览量。

## Waline：需要站主拥有的服务和管理入口

按官方部署向导创建自己的 Vercel + Neon 服务（或自己的服务器），初始化官方 PostgreSQL 表结构。首次管理员注册必须在公布服务器地址前完成，管理入口为 `<serverURL>/ui`。只需向本站提供公开 **serverURL**；Neon连接串及SMTP凭据只写服务商环境变量。

发布前服务端设置并实际验收：

- `COMMENT_AUDIT=true`：所有新评论先审核；`IPQPS=60` 或更严格限制。IP限流是防刷措施，不是身份识别。
- `SECURE_DOMAINS` 只列本站及评论服务自身域名。用后台审核、标为垃圾、删除，必要时再加Turnstile。不要把跨域白名单当作充分防刷保证。
- `DISABLE_USERAGENT=true`、`DISABLE_REGION=true`；隐藏公开的设备和位置标签不等于服务端不处理IP。告知站主其数据库可能持有IP/邮箱，按需限制管理员、清理及备份。
- 不使用第三方默认反垃圾key：可先设 `AKISMET_KEY=false`，依靠审核和限流；如启用额外反垃圾服务另核费用与数据传输。
- 配置头像为站内固定图片，避免向Gravatar等站点发送邮箱哈希；参考 `GRAVATAR_STR` 设置及服务实际返回结果验证。
- 评论不要求GitHub、社交账号；前端`login:disable`、昵称必填。默认不收邮箱；只有回复通知配置并测试后才开放可选邮箱。
- 回复通知：配置自己的SMTP发件人，测试游客订阅/停止回复通知及错误邮箱路径，再设 `comments.replyNotifications=true`。回复通知模板中的返回链接必须转换为本站 `#content=<contentId>` 深链接，不可直接把数据库 `/playbook/<contentId>` 拼在站点路径后；发信测试必须实际打开该链接。更新订阅与回复通知完全分开；不要把留言邮箱导入更新订阅名单。
- 确认审核生效后设 `comments.moderationConfirmed=true`，再启用 `comments.enabled`。该标记是维护者声明，不会替你配置服务器。

前端在每章末尾显示一次，读者点击才加载固定版本 `@waline/client@3.15.2`。组件版本升级要重新验收。评论和反馈的服务端路径恒为 `/playbook/<contentId>`，不使用标题、章节序号或图片名。Waline反馈索引顺序不可随意调整。其反馈存于数据库，不做本地数字冒充；匿名设备可重复或被刷，次数不等于独立人数。服务故障时显示重试信息且正文仍可读。

真实验收清单（未配置账号时一律待验）：

- 两个独立浏览器对同章反应，刷新及另一设备重新读取仍持久；记录API失败时行为，不能只看数字动画。
- 游客投稿后公众看不到待审内容；后台能批准、回复、标垃圾和删除；未登录不能调用管理操作。
- 标题修改、章排序变化和同章小节跳转后，仍加载相同path的互动记录。
- 回复邮件按用户选择发送、可停止通知；未开启SMTP时不显示邮箱收集字段。
- 注入HTML/脚本、超长留言、频繁提交、服务超时和第三方拦截均需验证；升级Waline后重验。

## 收藏、进度与稳定ID维护

`site/content-ids.json` 是已发布身份登记表。新文档/小节分配新的随机ID；永不根据当前标题、顺序重新生成。文件改名应移动整个登记项并把旧路径加入 `previousPaths`；改小节标题先维护旧锚点映射，新锚点可通过alias沿用原ID。已移除的登记项保留作为墓碑，不复用ID。构建遇到未分配或冲突ID会失败。

旧收藏的v1存储键保留，读取时兼容旧路径和锚点；下一次成功写入时附加稳定ID，不强制覆盖旧存储。新收藏和阅读进度按稳定ID定位。存储被禁用、quota超限或JSON损坏会提示失败，保留原值。读者可清除进度。没有云同步或服务端备份；不对已损坏的数据自动重置。

## RSS及邮件更新的发布流程

1. 只有新内容或重要修订才在 `updates/entries.json` 加条目。`id`只分配一次；`published`为实际发布时区时间，不能用构建时间或每次提交时间。描述面向读者，不把每次代码改动变成公告。
2. `contentId`指向真实文档；构建生成 RSS 2.0 `feed.xml`、Atom自发现链接及更新列表。GUID为固定URN。重部署不改旧GUID/pubDate/lastBuildDate；纠正措辞保留原ID与日期，重大新修订才另发一条。
3. 邮件是**站主手动选稿和发送campaign**，不是RSS上线即自动发信。注册自己的 Brevo Free，验证发件人/域名，建立独立更新名单及double opt-in表单，准备含退订链接的模板。
4. 用测试邮箱验证：提交后待确认、确认后入名单、仅确认者收到测试campaign、退订后后续发送排除。关闭不必要的邮件打开/点击追踪，检查服务默认设置。未验收前不展示表单。
5. 提供公开托管表单URL，填写 `newsletter.formUrl`，在确认订阅/退订均真实通过后设置两项Verified标记并启用。网站仅链接托管表单，不把邮箱传给GitHub Pages或Umami。本站不能从“打开表单”判断已订阅。
6. 每次重要更新上线后由站主在Brevo选择已确认名单发送；记录条目ID和campaign ID，避免重复发送。配额不足时不要购买额度或升级，先处理发送范围。

## 验证命令与发布

```sh
python -m unittest discover -s scripts -p 'test_*.py'
python scripts/build_site.py
python scripts/check_review_regressions.py
python -m http.server 8765 --directory _site
# 另一个终端，安装Playwright Firefox后：
node scripts/test_bookmarks.cjs
node scripts/test_reader.cjs
```

再按 `site-maintenance.md` 生成六种导出并运行 `check_site.py`。发布后检查线上JS/CSS版本、RSS、自发现、真实深链接、收藏/继续阅读以及disabled服务不发请求。模拟服务测试只证明前端契约与降级，不替代真实后台收到统计、数据库持久化、审核或邮件确认/退订。
