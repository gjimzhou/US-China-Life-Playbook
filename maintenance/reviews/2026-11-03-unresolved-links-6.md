# 2026-11-03：六条教育与照护访问缺口

执行：Codex。基线 main `6a23dc35509cc7bd8c4c6e053bc8eb3844dc8b48`；唯一范围为[上一轮15条记录](2026-11-03-unresolved-links-15.md)中的6条 `retain_unresolved`。逐URL结果、处置、下一步条件及PDF哈希见[JSON证据](2026-11-03-unresolved-links-6.json)。

## 结论及访问边界

六条原入口均经HTTPS脚本复测和搜索连接器打开，仍受403、405或机器人验证限制。保持TLS验证，同域串行、跨域并发、15秒超时。没有浏览器操作、登录、提交家庭资料或向机构发信。

本轮2条改用对应现行法规，4条保留原入口并补资料/办理后备路径。**六条原网页的访问缺口仍全部存在**，不能把这些处置称为六条网页恢复。九个候选的脚本结果为2 ok、6 blocked、1 transient；eCFR虽可通过连接器读正文，脚本仍遇验证页。两份PDF另经HTTPS完整下载、提取及相关页视觉检查；NIA PDF约26.5MB，仓库运行时出现证书链验证错误，系统HTTPS客户端保留证书验证下载成功；两种环境结果分别记录，没有降低TLS验证。

## 逐项证据与整改

| 原范围 | 已读取证据 | 改动及限制 |
|---|---|---|
| IDEA总入口 | [CPIR家长中心目录](https://www.parentcenterhub.org/find-your-center/)与[项目说明](https://www.parentcenterhub.org/whatiscpir/)，目录用途、联系信息及OSEP资助声明 | 第21章补按州找中心、地图不可用时联系询问、会前整理材料及向学区正式提交的区别。CPIR是获教育部资助的非政府项目，不能称为政府审批机关；没有操作地图或确认具体中心接案。原IDEA入口保留。 |
| ED残障歧视概览 | [34 CFR 104.4](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-I/part-104/subpart-A/section-104.4)，全文，显示截至2026-11-02 | 第21章原链接用途是第504条禁止歧视，改为对应条文并收窄标签。不是全部ADA/ED说明的迁址或替代全文。 |
| ED诊断FAQ | [教育部2016年指南PDF](https://www.govinfo.gov/content/pkg/GOVPUB-ED-PURL-gpo246199/pdf/GOVPUB-ED-PURL-gpo246199.pdf)，纸面第13页脚注50及第18—19页；[GovInfo归档说明](https://www.govinfo.gov/app/details/GOVPUB-ED-PURL-gpo246199) | 保留现行FAQ，学校清单新增带年代的历史解释参考、具体书面请求步骤及地方程序核对。PDF页序为18、23、24；已视觉核对第18、24页。归档明确可能不反映当前政策，不将其当现行FAQ已完整核验，也不新增所有医学评估费用结论。 |
| ED 504 FAPE FAQ | [34 CFR 104.35](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-I/part-104/subpart-D/section-104.35)及[104.36](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-I/part-104/subpart-D/section-104.36)，全文，显示截至2026-11-02 | 第21章和学校清单原引用支持个体评估/多来源判断，改为104.35；同步措辞为评估信息、知情人员与安置决定。新增104.36用于通知、相关记录、听证及复核，不把IDEA 60天套用到504。不是对原FAPE FAQ全部主题的复核。 |
| NIA识别是否需要帮助 | [NIA《照护者手册》2023年2月版，爱达荷州政府托管](https://aging.idaho.gov/wp-content/uploads/2023/05/caregivers-handbook-nia_0.pdf)，纸面第5—6、10页 | 第20章保留在线原文，增加带版次的下载路径，补本人同意、现场观察、医疗沟通与分工回报；父母清单链接同节。已视觉核对PDF第8、12页。不是当前临床建议全审，急症仍使用既有急症路径。 |
| NIA照护FAQ | 同一本手册目录、第5—6、10、13页、封底版次；[NIH MedlinePlus手册和信息中心介绍](https://magazine.medlineplus.gov/article/caregiving-101-worksheets-resources-and-suggestions-from-the-national-institute-on-aging)，2024-10-22 | 第20章入门处补下载后备、阅读范围及资料求助入口，保留FAQ。手册章二为纸面第11页起，正文指向其中12—18页。旧版联系方式、支付资格、费用与临床信息不得免于当前核对。 |

两份PDF均为原机构出版内容，不在仓库复制或重新发布。504指南为2016年12月版；NIA手册封底为NIH Publication No. 23-AG-5496，2023年2月。PDF的HTTP200、哈希与页码只证明取得和检查了该版，不证明当前全国规则或整个网页内容已经覆盖。

## 保留问题与后续条件

- IDEA家长页面、ED家长信息中心项目页仍403；NIA手册订阅页仍机器人验证。没有把这些候选当作已可用。
- ED诊断FAQ和NIA两篇现行文章仍缺完整正文；需要官方正文恢复、官方新版本或具体规则变化证据时再复核。不能仅重复相同抓取就更新完整核验日期。
- CPIR目录仅作寻找信息支持的后备，地方中心提供哪些服务、学校如何受理和州程序仍须分别确认。
- 现行eCFR是政府提供的持续更新文本，不是正式法律印刷版本；本次仅对照上述条文支持的说法。

正文和清单保持既有标题、段落及任务ID；不更新整章事实核验日期、周期台账或来源监测基线。

## 发布终点

统一快速检查、完整PR CI、合并后部署、101篇正文与静态锚点、搜索/导航/RSS及六个下载文件哈希验证；最终main外链报告归档。实际运行链接与验收结果填写PR。本轮完成指六条均有可审计处置并上线，不表示外部网站限制消失。
