# 2026-11-01 受限访问、临时错误与错误落点专项整改

- 执行：连接器读取官方页面，脚本GET与复测；未使用浏览器UI，未登录或提交业务表单。
- 基线：[main外链运行41347399703](https://github.com/gjimzhou/US-China-Life-Playbook/actions/runs/41347399703)，源码007f30421d0dd8614553fac38ac82dcf18142b64：922条，622可达、276受限、18临时错误、6告警、0个404/410。
- 范围与结果：[逐URL处置数据](2026-11-01-link-access-results.json)。旧报告只列47个受限域名，无法还原276条具体URL；本轮检查这些域名全部283条现行引用、24条明确异常及新增异常，共325条。不是把旧276条逐一宣称恢复。
- 全量首次扫描922条：698 HTTP可达、211受限、7临时错误、6告警。对224条非成功结果按域名串行、域名间最多8个并行复测：211受限、6临时错误、6告警、1恢复。原始响应均保留；不关闭证书校验、不降级HTTPS、不绕过验证码。
- 上述原检查器漏判了14个访问验证落点和2个错误落点；325条记录的effective_category纠正后是86可达、225受限、8告警、6临时错误，不能与旧云端统计直接作改善百分比。
- 本轮是引用可用性审查；没有推进任何事实范围的last_verified，也未复核所有来源的实体规则。

## 五类入口整改及具体证据

1. **中国领事服务网附加证明书旧专题**：原`/zggmcg/fjzms/`跳转`/error/`，页面明确“您访问的页面不存在或已删除”。改为[2026-07领事认证（附加证明书）简介](https://cs.mfa.gov.cn/zggmcgx/lsrz/jj/202607/t20260713_11981309.html)，读取其定义、主管机关、公约适用与非缔约国分支。同步正文、遗产清单；第19章去掉同一新页面的重复引用。新页脚本HTTP200。
2. **外国附加证明书核查旧指南**：同样落入错误页。改为[HCCH各国主管机关及核验入口目录](https://www.hcch.net/en/instruments/conventions/authorities1/print1/?cid=41)，读取各国E-Register字段与美国主管机关分类；用途是找到签发机关或其核验入口，未承诺各国都有在线查询，不引用其旧费用。搜索连接器可读，本地直接GET403，保留这一访问限制，不宣称脚本可达。中国签发文件仍用中国外交部VERIFY系统。
3. **卫健委综合数据查询页**：原页两次412；不是404，不认定政策失效。改为[国家政务服务平台医疗机构执业登记查询](https://app.gjzwfw.gov.cn/jmopen/webapp/html5/zwfwunitsearch/)和[卫健委医师、护士及专项机构目录](https://zwfw.nhc.gov.cn/cxx/)，读取机构名称、地区和验证码字段，以及人员/专项机构查询分类。两个入口脚本均200。未输入真实信息、未完成验证码或声称已实际查到某位医师；未把人员目录说成医院登记查询。同步六个正文/清单文件的引用。
4. **美国红十字会成人窒息急救**：旧guidelines子域持续TLS握手失败，连接器502。替换为[同机构成人/儿童窒息急救页](https://www.redcross.org/take-a-class/resources/learn-first-aid/adult-child-choking)。读取Emergency Steps、General Care、孕妇/无法环抱者胸部冲击、无反应后CPR和不盲掏口腔段，与第03章成人流程相符，仍保留AHA原始指南及婴儿不适用的限制。连接器可读，本地GET403；替换解决旧TLS入口，不宣称消除所有环境的拦截。
5. **FinCEN个人FBAR入口**：旧`bsaefiling.fincen.treas.gov/NoRegFBARFiler.html`在云端网络不可达、本地证书链失败。连接器跟随跳转到[新申报入口](https://bsaefiling.fincen.gov/file/fbar)；又从[FinCEN How Do I File the FBAR](https://www.fincen.gov/how-do-i-file-fbar)的no registration option点击验证同一落点。新入口curl返回200，但仓库Python检查器再次访问仍有证书链错误，不能宣称已在所有客户端恢复。页面是需要JavaScript的应用壳；没有执行实际申报或声称完成业务验收。同步第14、38章及引用规范。

## 其余异常的处理与下一步

- **纽约税务5条、FBI艺术品失窃、医保局5个正文页**：本地本轮恢复HTTP成功；纽约5条也由连接器读到页面/文档标题。医保局首页首次超时、第二次恢复；同一医保局正文在连接器不同请求中出现成功与超时，按网络波动处理。保留官方深链接，未因超时换成首页，也未把访问恢复记作本轮事实复核。
- **SIPC两条证书链失败**：本地两次仍失败，连接器也失败；保留原会员查询及保障范围入口和现有FINRA/SEC配套入口。下轮先复测正常TLS证书链；不能关闭验证，也不能用BrokerCheck冒充SIPC会员名单。
- **国家社保公共服务平台**：脚本报告旧TLS重协商错误；连接器只有空应用页。保留官方入口与既有国家政务服务配套入口，待TLS或可读页面恢复再确认，不把空壳当业务可用。
- **12315**：本地两次连接关闭、连接器502；保留官方投诉入口及现有电话/政务路径。下轮检查实际响应与官方迁移公告，不能换成商业代办。
- **卫健委其余5条412**：保留具体政策/解释页和首页各自用途。412并不能证明删除；下一轮从同机构原文或国家法规库找支持同一条文的可读来源，未取得可核对正文前不替换。
- **其他持续403、429等**：逐URL列在JSON，保留状态和全部引用文件。下一轮从最新云端JSON取仍受限项，按域名低并发复测，再经连接器读取原页面；只有发现真实迁移并确认用途才能替换。USCIS等本地恢复的链接不代表云端限制已解除。
- **eCFR/Federal Register验证页**：14个返回200的跳转实际上要求访问验证。保留法规深链接，将检查结果改为blocked；官方提示程序读取可用其API，后续事实核验可使用API，不能把阅读链接全部替换为原始API响应。
- **美国法院apology落点**：基线3条出现“Page Not Accessible”，说明临时技术故障。本地本轮这些正文链接恢复；仍增加该明确落点的warning识别，防止下次又记成功。没有据此虚构新页面或删除原文。

## 报告工具整改

Markdown逐条列blocked URL、所有引用文件和最终落点；JSON保存全部URL的原始HTTP状态、分类、错误说明与引用文件，并随同一个Actions附件保留30天。200访问验证页归blocked、已读到的错误落点归warning；不把这类情况伪称404。修复含括号的法规段落锚点被截断的问题；历史原始扫描中该URL保留原样，新报告使用完整URL。回归覆盖错误落点、真实成功页、404/403分类、超过8个引用文件、JSON状态及括号URL。没有通过白名单压低失败数。

修改后本地全量复测923个完整URL：684可达、0个404/410、228受限、6临时错误、5告警。数量变化包含原来被截成同一URL的3个法规锚点现在分别记录；受限数量也包含不再误判成功的验证页，不能用数量下降衡量本轮成效。FinCEN新域名在curl成功而Python仍证书链失败、医保局单页再次超时均保留在结果中。45项单元测试和统一快速检查通过。

本地快速检查与PR完整CI、主分支部署及线上文件验收分别执行，最终运行和PR链接以本次提交的GitHub记录为准。持续受限项留作明确后续范围，本轮不承诺第三方站点全部可达。

## 基线受限域名的本地复测覆盖

下表检查数量为该域名全部引用，可能大于基线受限数量。结果是本地最后一次HTTP观察，尚未加上新工具对200错误落点的识别。

| 域名 | 基线受限 | 本轮检查 | 本地最后结果 |
|---|---:|---:|---|
| travel.state.gov | 39 | 39 | blocked: 39 |
| www.uscis.gov | 37 | 37 | ok: 37 |
| consumer.ftc.gov | 33 | 33 | blocked: 33 |
| content.naic.org | 19 | 19 | blocked: 19 |
| www.ssa.gov | 18 | 18 | blocked: 18 |
| www.nhtsa.gov | 14 | 14 | blocked: 14 |
| www.ready.gov | 11 | 11 | ok: 11 |
| www.nia.nih.gov | 11 | 11 | blocked: 11 |
| www.hhs.gov | 8 | 8 | blocked: 8 |
| www.tsa.gov | 7 | 7 | ok: 7 |
| www.redcross.org | 6 | 6 | blocked: 6 |
| www.fmcsa.dot.gov | 6 | 6 | blocked: 6 |
| www.cisa.gov | 5 | 5 | ok: 5 |
| www.investor.gov | 5 | 5 | blocked: 5 |
| www.transportation.gov | 5 | 5 | blocked: 5 |
| egov.uscis.gov | 5 | 5 | blocked: 5 |
| www.americanbar.org | 4 | 4 | blocked: 4 |
| sites.ed.gov | 4 | 4 | blocked: 4 |
| www.cbp.gov | 4 | 4 | ok: 4 |
| www.heart.org | 3 | 3 | blocked: 3 |
| cpr.heart.org | 3 | 3 | blocked: 3 |
| www.ed.gov | 3 | 3 | blocked: 3 |
| www.transunion.com | 2 | 2 | blocked: 2 |
| www.stroke.org | 1 | 1 | blocked: 1 |
| www.fsmb.org | 1 | 1 | blocked: 1 |
| eapps.naic.org | 1 | 1 | blocked: 1 |
| passportstatus.state.gov | 1 | 1 | blocked: 1 |
| secure.ssa.gov | 1 | 1 | blocked: 1 |
| vote.gov | 1 | 1 | blocked: 1 |
| www.ignet.gov | 1 | 1 | blocked: 1 |
| www.annualcreditreport.com | 1 | 1 | blocked: 1 |
| www.americorps.gov | 1 | 1 | blocked: 1 |
| www.nysenate.gov | 1 | 1 | blocked: 1 |
| cpaverify.org | 1 | 1 | blocked: 1 |
| www.usembassy.gov | 1 | 1 | blocked: 1 |
| www.fema.gov | 1 | 1 | ok: 1 |
| www.justice.gov | 1 | 4 | blocked: 1, ok: 3 |
| consumer.gov | 1 | 1 | blocked: 1 |
| www.disasterassistance.gov | 1 | 1 | ok: 1 |
| www.foodsafety.gov | 1 | 1 | blocked: 1 |
| www.uscourts.gov | 1 | 4 | blocked: 1, ok: 3 |
| step.state.gov | 1 | 1 | blocked: 1 |
| www.hrsa.gov | 1 | 1 | blocked: 1 |
| telehealth.hhs.gov | 1 | 1 | blocked: 1 |
| www.evus.gov | 1 | 1 | ok: 1 |
| www.nyc.gov | 1 | 1 | blocked: 1 |
| www.amazon.com | 1 | 2 | blocked: 1, ok: 1 |
