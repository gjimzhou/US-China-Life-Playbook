# 2026-09-29 / 疫苗日期与外部复核延期定点续核

- 执行者：Codex，读取公开官方正文并与仓库主张逐项比较。
- 结果：部分核验；补充来源日期冲突，确认所读CMS通知的截止日期未变。
- 范围：第02章第3节的COVID来源版本提示；第04章第6节HHS FERP限时提示。
- 访问日期：2026-09-29（America/New_York；UTC为2026-09-30）。

## COVID来源日期

| 官方来源与位置 | 本次读到的内容 | 编辑处理 |
|---|---|---|
| [CDC临床指导](https://www.cdc.gov/covid/hcp/vaccine-considerations/index.html)，页首、At a glance、Summary of recent changes、Sources and Page Info | 页首及更新／审阅日期为2026-09-23，内容说明用于2026–2027季并沿用2025年7月接种安排；近期变化栏仍写2025-09-23 | 不能把页面日期当成全部建议的生效日期，也不能擅改官方年份 |
| [CDC非免疫功能低下人群接种指导](https://www.cdc.gov/covid/hcp/vaccine-considerations/routine-guidance.html)，Introduction、Table 1标题及脚注 | 页首2026-09-23；表1标题同时写2026–2027方案及2025-11-04；正文区分CDC建议与FDA批准适应证，以脚注标注超说明书使用 | 正文新增表格日期冲突，保留结合个人情况与医生／药师核对产品、剂次和间隔的路径 |

本次确认来源存在日期不一致，未取得可解释冲突的官方更正。未逐一比对FDA产品说明书，也未复核其他疫苗、全部免疫状态或筛查项目。不能把本记录称为接种方案审定。原[2026-09-24证据及缺口](2026-09-24-vaccines-screening.md)继续有效；整项仍为部分完成，首次截止日2026-10-01不变。

## HHS FERP截止前复核

- [CMS延期通知PDF](https://www.cms.gov/files/document/hhs-administered-ferp-deadline-extension-07-31-26.pdf)，唯一一页：流程于2026-07-31恢复；原申请截止日在2026-07-01至2026-08-03的合格申请延至2026-10-02。适用通知列明地区中选用该流程的计划，以及选用该流程的自筹资金非联邦政府雇主计划；已有最终决定者除外，7月1日前提交且未获决定者无需重交。
- [CMS州别入口](https://www.cms.gov/CCIIO/Resources/Files/external_appeals)，State External Appeals Review Processes下的延期说明：页面最后修改时间为2026-08-14，仍列2026-10-02，并链接上述PDF。页面底部州别表的2024-07-09更新日期不能代替延期公告日期。正式通知对原截止日的表述更精确，正文继续按PDF限定。
- [CMS外部申诉总入口](https://www.cms.gov/cciio/Programs-and-Initiatives/Consumer-Support-and-Information/External-Appeals)经重定向至现行专题；浏览工具读取失败后，直接读取公开HTML成功，并沿其州别链接核对上项正文。总入口不是判断近期延期的唯一证据。

这两份具体延期来源仍支持原截止日，不代表已穷尽所有新公告或个案通知。正文刷新限时条目的定点核对日期并增加网页入口；一般申诉、账单保护规则的核对日期仍为2026-09-24。保留[上次完整范围记录](2026-09-24-insurance-appeals.md)及其 `last_verified`，最近尝试记为部分核验；`review_by: 2026-10-02`不删除、不顺延。到期后仍需重读公告和受理说明，再决定怎样改写限时段落。

## 关联范围与验证

检索正文、清单、台账中的FERP、延期PDF及COVID指导链接；读者主张位于上述两节，无需改动清单勾选内容或稳定ID。家庭雇员及移民台账本次未复核，既有缺口和10月1日截止日不变。

验证通过与否以本次PR的 `Validate proposed changes` 为准；CI只验证文档、路由、网站和导出，不代表医学或法律专业审定。
