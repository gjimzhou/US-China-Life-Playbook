# 303条异常外链续查（2026-11-01）

前次：[受限访问排查](2026-11-01-link-access.md)。本次固定检查 main 的 [运行41349692391](https://github.com/gjimzhou/US-China-Life-Playbook/actions/runs/41349692391)：293 blocked、5 transient、5 warning；逐条数据见[JSON记录](2026-11-01-link-followup-303.json)。

## 方法与边界

303条均使用仓库 HTTPS 检查器复测，并经搜索连接器分批直接打开。按域名和用途检索失败页面的替代；只有读取目标内容并核对原引用用途后才替换。全程脚本和连接器，没有使用浏览器。脚本按域串行、跨域并发，超时15秒，保留TLS校验；不得将验证码、空应用壳或抓取失败计为事实核验。

本机结果：69 ok、225 blocked、4 transient、5 warning。与云端基线环境不同，69项恢复不代表云端限制解除。连接器返回可提取内容也不是已验证登录、表单提交或所有法律事实。四个 Internal Error 无失败字段、四个NIA JavaScript验证页均作为未取到正文处理。

处置：retain_connector_retrieved=177；replace=17；retain_unresolved=40；retain_http_recovered=69。本次没有推进 review-registry 的 last_verified。

## 已核对替换

NAIC七个旧consumer地址在脚本中被403遮挡，但连接器显示404。新目标虽仍可能限制脚本，其正文已由连接器读取。三个中国法规目标同时通过本机HTTPS；转载标明原国家规定及转载机关，不把地方转载视为地方新规则。

| 原入口 | 官方目标 | 核对用途及边界 |
|---|---|---|
| https://content.naic.org/consumer/auto-insurance | https://content.naic.org/consumer/auto-insurance.htm | 汽车保险保障与除外责任专题 |
| https://content.naic.org/consumer/homeowners-insurance | https://content.naic.org/consumer/homeowners-insurance.htm | 房屋保险财物、责任和附加保障专题 |
| https://content.naic.org/consumer/life-insurance | https://content.naic.org/consumer/life-insurance.htm | 人寿保险分类和受益人专题 |
| https://content.naic.org/consumer/insurance-complaints | https://content.naic.org/consumer/how-to-file-complaint | 向州保险监管部门投诉的准备与入口 |
| https://content.naic.org/consumer/renters-insurance | https://content.naic.org/article/consumer_insight_renting_your_home_protect_your_belongings_renters_insurance.htm | 租客个人财物、责任及额外生活费用；2020消费者文章，不新增价格 |
| https://content.naic.org/consumer/pet-insurance | https://content.naic.org/article/consumer-insight-pet-insurance-it-could-save-your-pets-life-could-save-you-money | 宠物保险等待期、除外责任与报销；2018消费者文章，不作为现行州法 |
| https://content.naic.org/consumer/travel-insurance | https://content.naic.org/article/should-you-get-travel-insurance-what-you-should-know-about-protecting-your-trips | 旅行取消、中断、医疗和撤离保险专题 |
| https://www.nhc.gov.cn/fzs/c100048/201808/6878dddd2a3d48c59de1c43a6c68423d.shtml | https://www.beijing.gov.cn/zhengce/zhengcefagui/qtwj/201408/t20140812_776635.html | 全国院前急救办法第13条120、第21条24小时；北京市政府转载国家规定 |
| https://www.nhc.gov.cn/wjw/xwdt/201808/b2b4ee8f65534257a998b5f5ba938701.shtml | https://xzfg.moj.gov.cn/front/law/detail?LawID=438 | 医疗纠纷条例第16条病历查阅复制；司法部行政法规库 |
| https://www.nhc.gov.cn/zwgk/jdjd/201312/e26a5dc4bee8411e92352b0e7a5e02fd.shtml | https://wsjkw.weihai.gov.cn/art/2013/12/27/art_29397_854765.html | 2013病历管理规定第17—23条申请人、材料、复制及盖章；威海卫健委转载原文 |
| https://consumer.ftc.gov/articles/employer-background-checks-your-rights | https://consumer.ftc.gov/articles/employer-background-checks-and-your-rights | 雇主背景调查书面许可、报告和异议权利 |
| https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams | https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams | 识别钓鱼及通过独立可信渠道联系机构 |
| https://www.ssa.gov/bso/bsowelcome.htm | https://www.ssa.gov/bso | 雇主工资申报/查看状态/重提的BSO入口；未测试登录提交 |
| https://www.nhtsa.gov/equipment/tires | https://www.nhtsa.gov/vehicle-safety/tires | 轮胎选择与养护；合并正文重复引用 |
| https://www.justice.gov/eoir/recognized-organizations-and-accredited-representatives-roster-state-and-city | https://www.justice.gov/eoir/recognition-accreditation-roster-reports | 认可机构、授权代表及按州名册的三个PDF链接入口；不等于核验个人资格 |
| https://travel.state.gov/content/travel/en/replace-certify-docs/authenticate-your-document/getting-academic-credentials-authenticated.html | https://travel.state.gov/content/travel/en/replace-certify-docs/authenticate-your-document/academic-credentials.html | 美国学历文件认证签章与内容有效性区别；保留接收方条件，不新增认证路径结论 |
| https://www.heart.org/en/health-topics/high-blood-pressure/know-your-numbers/monitoring-your-blood-pressure-at-home | https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home | 家庭血压监测设备、袖带和测量方法；未据此更新整章医学复核日期 |

## 保留的访问缺口

- `www.nia.nih.gov`：现行 advance-care-planning、caregiving 专题候选仍返回 JavaScript/机器人验证；旧版 PDF 较窄且不能证明整篇现行内容，保留原文待复核。
- `egov.uscis.gov`：检索仍指向 USCIS 案件/处理时间/e-Request 工具；不同工具和 ndd/ndc 不能互换，未验证登录或提交，不改成介绍首页。
- `sites.ed.gov`：检索仍指向 IDEA 对应条文；保留准确条文入口，不用较窄的监测材料 PDF 替代；eCFR 是不同来源渠道。
- `www.ed.gov`：官方检索仍有同路径 Section 504/FAPE 和 disability discrimination 资料；其他 FAQ 不覆盖完整原文，保留访问缺口。
- `www.sipc.org`：官方检索及 Investor.gov 联合 SIPC 公告仍引用 SIPC 会员目录；介绍页/FINRA BrokerCheck 不等于 SIPC 会员查询。证书链错误未绕过。
- `www.americorps.gov`：检索找到 https://www.americorps.gov/join/find-volunteer-opportunity，但连接器读取仍403；未确认实际查询可用，不将新路径视为已解决。
- `si.12333.gov.cn`：12333 官方办事指南仍引用该平台；动态登录地址含会话参数不宜固化；本机 TLS 错误且连接器无正文，保留。
- `www.12315.cn`：未确认可等价办理的公开替代入口；连接错误不证明平台关闭，不替换成地方投诉或第三方入口。
- `www.annualcreditreport.com`：检索找到官方 foreignLocation.action 访问地区说明和 manualRequestForm.action 邮寄表；邮寄不等于在线取报告，保留在线入口及尚未验证的交互缺口。
- `www.hhs.gov`：检索得到消费者 medical-records 和具体权利 FAQ；不能覆盖原专业 access guidance 的全部期限、格式、费用边界，不机械替换。
- `www.nhc.gov.cn`：首页用于查找政策仍保留；2025互联网医疗建议答复未找到可核对的同文官方转载，不能用其他年份规则代替。
- `www.amazon.com`：按具体帮助页 nodeId 搜索，未确认同用途替代；政府材料不能替代平台自己的消费者条款。
- `cpaverify.org`：执照查询入口受限，未确认全国等价查询工具；地方执照页不能替代跨州查询。
- `eapps.naic.org`：NAIC 现行 life-policy-locator 使用说明仍介绍该专用查询服务；说明文章不是提交查询工具，保留原入口。
- `www.ignet.gov`：按官方域及 report government fraud 检索未确认等价可读入口；其他投诉机关管辖不同，不替换。
- `www.usembassy.gov`：国务院当前学历认证页面仍链接该使领馆目录；单个使领馆页不能替代全球查找入口。
- `www.ecfr.gov`：保留对应条号和片段；检索未确认与失败条文同范围且更可靠的官方入口，不用其他条文或法规首页替换。

其他仍可经连接器提取的原来源保留，避免为了减少告警替换成较浅首页。重定向不自动表示原地址失效：国务院国家信息/旅行警示用途可能不同；SSA locator提取的是应用配置而非查询结果，因此不记为已验证办公地点查询。

## 验收与后续

提交前执行统一快速验证，发布依赖PR完整CI和main部署。最新云端逐URL结果保存在该提交的External link check运行附件 `external-link-report`；JSON中的本机结果是本轮观察，不能冒充部署后的云端结果。外部服务仍受限的项留待后续例行复测；本轮终点是逐条处置、可靠替换上线及线上正文与六个下载文件一致，不要求第三方网站消除所有限制。
