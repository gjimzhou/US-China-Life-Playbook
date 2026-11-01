# 2026-11-01 原11个报错外链逐项处置

基线为[外链巡检41345536746](https://github.com/gjimzhou/US-China-Life-Playbook/actions/runs/41345536746)的11个404。先普通HTTP下载正文／PDF，再用仓库`check_external_links.check_url`及原User-Agent重新GET。两次均保留实际响应；以下最终目标11/11为HTTP200。没有修改检查器、允许名单或将403改判通过。

| 原报告地址 | 正文核对与处理 | 最终目标 | 复测 |
|---|---|---|
| https://www.epa.gov/lead/i-am-planning-renovate-my-home-how-can-i-find-lead-safe-certified-firm | 原地址仍404。已读新FAQ的Finding and verifying firms段，能查询及核验RRP认证企业；更改第09章引用。 | https://www.epa.gov/lead/frequent-questions-general-information-about-rrp-rule | HTTP 200 |
| https://www.epa.gov/lead/what-information-can-i-get-about-lead-based-paint-home-i-buy-or-rent-it | 原地址仍404。新页说明多数1978年前住房披露及已知资料、记录、手册、买方检查安排；更改第36章引用。 | https://www.epa.gov/lead/lead-based-paint-disclosure-rule-section-1018-title-x | HTTP 200 |
| https://www.fda.gov/drugs/drug-safety-and-availability/drug-shortages | 原地址200；Drug Shortages正文及数据库入口存在。保留药品短缺查询入口。 | https://www.fda.gov/drugs/drug-safety-and-availability/drug-shortages | HTTP 200 |
| https://www.fda.gov/drugs/drug-shortages/frequently-asked-questions-about-drug-shortages | 原地址200；FAQ明确全国短缺与供需口径，不能推断某家药店实时库存。保留。 | https://www.fda.gov/drugs/drug-shortages/frequently-asked-questions-about-drug-shortages | HTTP 200 |
| https://www.fda.gov/drugs/generic-drugs/generic-drug-facts | 原地址200；Generic Drug Facts说明批准仿制药的剂量、强度、途径及质量等要求。保留。 | https://www.fda.gov/drugs/generic-drugs/generic-drug-facts | HTTP 200 |
| https://www.fda.gov/drugs/resources-drugs/drug-interactions-what-you-should-know | 原地址200；相互作用正文区分药物、食品及疾病因素，支持整理全部用药交给专业人员核对。保留。 | https://www.fda.gov/drugs/resources-drugs/drug-interactions-what-you-should-know | HTTP 200 |
| https://www.fda.gov/industry/import-basics/personal-importation | 原地址200；公民／永久居民与foreign nationals分支、受控药品DEA权限均存在。保留身份与进口条件边界。 | https://www.fda.gov/industry/import-basics/personal-importation | HTTP 200 |
| https://www.fda.gov/media/73856/download | 原地址200，PDF四页；已读My Medicine Record字段与说明，处方、OTC、补充剂、过敏和联系人表对应现有空白资料用途。保留。 | https://www.fda.gov/media/73856/download | HTTP 200 |
| https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-databases | 原地址200；器械数据库目录含UDI、上市后监测及其他分类查询。保留入口，不把登记当作所有用途获批。 | https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/medical-device-databases | HTTP 200 |
| https://www.fda.gov/radiation-emitting-products/medical-imaging/medical-x-ray-imaging | 原地址200；X线、CT、透视的辐射及获益风险说明存在。保留。 | https://www.fda.gov/radiation-emitting-products/medical-imaging/medical-x-ray-imaging | HTTP 200 |
| https://www.fda.gov/radiation-emitting-products/medical-x-ray-imaging/full-body-ct-scans-what-you-need-know | 原地址200；无症状人群全身CT缺少净获益证据、假阳性和后续检查风险段存在。保留，不从旧页其他句子推翻现行特定高风险癌种筛查建议。 | https://www.fda.gov/radiation-emitting-products/medical-x-ray-imaging/full-body-ct-scans-what-you-need-know | HTTP 200 |

## 额外发现

本轮移民复核发现旧入籍资格和防诈骗入口404，已分别改为[资格工具](https://www.uscis.gov/citizenship-resource-center/learn-about-citizenship/naturalization-eligibility-tool-0)和[防诈骗专题](https://www.uscis.gov/avoid-scams)，都已读取对应正文。CMS GFE旧路径可重定向，改用实际现行专题落点，不记作原11个404之一。历史复核记录保留原访问地址，不改写历史。

## 可用性边界

9个FDA地址在本次本地复测恢复，并不证明前一云端404必为误报，也不能据此保证托管运行器可达。未查明原因前不归因于User-Agent或伪造迁移路径；相同UA本地也返回200。合并后须再核云端报告及Issue #12；如仍报错，保留故障信号，记录环境差异，不手工关闭。链接可读性与上述7项事实复核分别验收。
