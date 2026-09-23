# 2026-09-23 外链审计待办

本轮扫描开始于第5项修改前：829个唯一外链，604个成功、33个404／410、159个访问受限、27个临时失败、6个其他状态。报告是一次网络观测，不等于事实审定；新增第1项清单未包含在该次全量扫描内。

## 已处理

- 检查器误删网址末尾句点，把Medicare有效的 `travel-outside-the-u.s.` 请求成不存在的路径。已修复并加入回归检查；正文原网址无需改变。
- FDA个人用药记录表、Medicare出院清单、CDC发育里程碑、NCI两处癌症筛查资料共5个旧地址已替换，替代资料通过官方来源读取确认。只修正入口，不宣称重审整章。

## 原始27项及本轮处理

以下保留原始问题地址供追溯。2026-09-23后续修复：26项已替换为对应的官方／原机构专题页面；自然人电子税务局改为明确标注的税务总局导航入口，并在第12章解释访问失败时的操作。未添加忽略名单。链接可达性复检另记结果；替换入口不等于重新审定每条规则。

- https://consumer.ftc.gov/articles/lost-or-stolen-credit-atm-debit-cards
- https://consumer.ftc.gov/identity-theft-and-online-security/protect-your-personal-information-hackers-and-scammers
- https://consumer.ftc.gov/online-shopping
- https://emilypost.com/advice/invitations-and-rsvps
- https://emilypost.com/advice/wedding-gift-etiquette
- https://etax.chinatax.gov.cn/
- https://faq.usps.com/s/article/Deceased-Do-Not-Contact-Registration
- https://mci.si.edu/taking-care
- https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/food-allergy
- https://www.consumerfinance.gov/consumer-tools/payment-apps/
- https://www.consumerfinance.gov/owning-a-home/process/prepare-your-application/
- https://www.eeoc.gov/laws/guidance/understanding-waivers-discrimination-claims-employee-severance-agreements
- https://www.epa.gov/lead/find-lead-safe-certified-firm
- https://www.epa.gov/radon/citizens-guide-radon-guide-protecting-yourself-and-your-family-radon
- https://www.epa.gov/radon/home-buyers-and-sellers-guide-radon
- https://www.fda.gov/drugs/resources-you-drugs/avoiding-drug-interactions
- https://www.fmcsa.dot.gov/protect-your-move/search-movers
- https://www.foodallergy.org/resources/food-allergy-101
- https://www.hud.gov/sites/dfiles/HH/documents/Lead_Based_Paint_Disclosure_Rule_FactSheet.pdf
- https://www.nhtsa.gov/car-seats-and-booster-seats
- https://www.oge.gov/web/oge.nsf/Resources/Gifts
- https://www.redcross.org/take-a-class/resources/learn-first-aid/choking
- https://www.usa.gov/domestic-violence
- https://www.usa.gov/emergency-assistance
- https://www.usa.gov/vital-records
- https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-escape-plans/
- https://www.usfa.fema.gov/prevention/home-fires/prevent-fires/electrical/

## 其他未决

访问受限、超时及412等状态须另行抽核，不归类为已失效。NCI旧文章是历史解释材料，不能用于断言某一产品今天的监管状态。最后一轮全量外链工作流仍需成功或有逐项、可追踪的处理结论。


## 二次扫描的两处故障

- USA.gov `/after-death` 改为官方现行主题页 `/death-loved-one`，已读取页面核对通知机关、死亡证明和遗属福利入口。
- MCI `/ask-mci` 搜索索引仍有内容，但实际访问返回404或超时。改用同属史密森尼的美国艺术博物馆藏品养护页 `https://americanart.si.edu/research/my-art/care`；已读取其专业修复、保管资料与收藏记录说明，并同步修改链接名称。未把故障链接加入忽略名单。

这次只修复上述两个目的地；受限和临时失败仍保留原始分类。
