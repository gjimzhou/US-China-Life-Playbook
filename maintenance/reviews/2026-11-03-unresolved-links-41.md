# 2026-11-03：41条剩余访问缺口与办理后备路径

执行：Codex；基线main `ef1ffff9c39f6f4628c2ec5779092e778e2caa25`。承接[303条续查](2026-11-01-link-followup-303.md)，固定取40条retain_unresolved与[main外链运行41351008830](https://github.com/gjimzhou/US-China-Life-Playbook/actions/runs/41351008830)的5条临时错误、2条告警并集，去重后41条。逐条观察见[JSON证据](2026-11-03-unresolved-links-41.json)。

## 方法与结果

41条均经脚本HTTPS复测和连接器直接打开；脚本同域串行，跨域并发，15秒超时，保留TLS验证。结果为34 blocked、4 transient、2 warning、1 ok。FTC防诈骗、SIPC保护范围通过连接器恢复读取；FBI宠物诈骗页面也恢复，因此保留原地址。可读取不等于整篇事实复核、身份验证或办理提交成功。

处置：3条替换、2条保留正式入口并补充后备办理说明、3条恢复保留、33条未解决保留。新增的官方入口也可能限制脚本；是否取到正文与HTTP状态分别记录。没有重置事实核验日期或监测基线；当前疫苗版本冲突仍是独立到期任务。

## 读取依据、修改与范围

| 场景 | 已读取依据与位置 | 修改及边界 |
|---|---|---|
| 互联网医疗 | [无锡市卫健委转载国家《互联网诊疗监管细则（试行）》](https://wjw.wuxi.gov.cn/doc/2023/02/13/3881875.shtml)，国卫办医发〔2022〕2号，第8、10、23条 | 第05章将受限的2025建议答复换成监管规则，明确查医师证照、获准机构与收费；不是该2025答复的同文转载。未推定全国可初诊，保留试点与当地规则分支，也不据此承诺医保支付。 |
| 预先医疗意愿与代理 | [NLM MedlinePlus Advance Directives](https://medlineplus.gov/advancedirectives.html)，Summary，页面更新2026-01-13 | 替换NIA通用主题入口、同步中文来源标签；可核对医疗意愿和代理人的概念。州法律效力、签署及跨境接收仍须分别确认；保留原NIA代理人选择、重要文件整理等具体文章。 |
| 家庭照护概览 | [NLM MedlinePlus Caregivers](https://medlineplus.gov/caregivers.html)，Summary、Resources，页面更新2025-03-18 | 替换NIA通用照护目录。页面直接介绍照护任务及照护者自身需要；不替代原NIA居家服务、远程观察或工具包全文。 |
| 在中国取不到美国信用报告 | [FTC Free Credit Reports](https://consumer.ftc.gov/articles/free-credit-reports)，How To Get／What To Expect，2026年6月 | 第15章补电话/邮寄年度申请、材料、留存副本、处理寄出时间及收件后核对。15天不含跨境邮程承诺；每周在线计划不套用到邮寄。境外电话接通及境外地址受理未亲测，要求通过官方渠道确认；三份相关清单链接同节。 |
| 身故后找不到寿险 | [NAIC操作说明](https://content.naic.org/article/learn-how-use-naic-life-insurance-policy-locator)，Steps You Need to Take、末尾帮助，2025-05-14 | 第35章补申请人/逝者资料、确认邮件、技术求助及没有回复的含义；同步身故清单。保留查询工具，文章不冒充可提交表单；没有发送私人材料或实际申请。 |

补充办理步骤属于编辑整理，依据范围如上；不是针对具体个人的法律或财务意见。保留章节、段落、清单任务ID与既有标题。

## 未解决的外部限制

- 9条NIA深链接：原页面仍405或机器人验证。MedlinePlus概览不能取代具体篇章；本轮只替换两个通用主题入口。
- AmeriCorps新志愿机会页仍403；IGnet的Oversight.gov两个候选仍406，未用同样受限的新地址制造“修复”。
- USCIS五个具体应用、CPAverify、12315、社保平台、SIPC会员查询、AnnualCreditReport和NAIC查询工具仍需交互或遇到限制。没有降低TLS、伪造登录或将介绍文章当作已办理。
- ED/IDEA、eCFR精确条文、HHS专业病历访问指导、Amazon具体帮助条款及使领馆总目录沿用上轮同用途核对结论；本轮逐URL重测仍受限，未发现可确认的迁址证据。地方条文、较窄FAQ和单个使馆均不能机械替换。
- 国家卫健委首页保留政策检索用途，未用地方门户替代全国入口。

逐条保留原因及下一步沿用前次证据的，在JSON明确写入原理由；不是宣称本轮重新检索了每一个未修改页面的全部备选。

## 验收

提交前运行统一快速验证；PR完整CI通过后合并，main部署后核对101篇正文、静态锚点和六个下载文件。云端逐URL报告附在对应External link report运行的external-link-health产物；本次本机记录不能替代发布后的云端状态。最终PR填写运行链接和实际验收结果。
