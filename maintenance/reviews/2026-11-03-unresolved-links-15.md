# 2026-11-03：15条访问缺口的续查与后备路径

执行：Codex。基线 main `7fbff1ea511f8e878c5cc12c4d1e1f09af9f88e4`，唯一范围是[上一轮33条记录](2026-11-03-unresolved-links-33.md)的15条 `retain_unresolved`。逐条结果、候选HTTP状态和处置见[JSON证据](2026-11-03-unresolved-links-15.json)。

## 方法与结果

15条全部HTTPS脚本复测，并由搜索连接器直接读取。保持TLS验证，同域串行、跨域并发、15秒超时；脚本结果13 blocked、1 transient、1 warning。SIPC证书链错误没有关闭验证绕过，连接器返回导航内容也不算实际会员查询完成。全程无浏览器操作、登录、通话或向机构提交。

处置为4条替换、5条保留原入口并补充后备流程、6条仍未解决。替换不等于所有网络访问恢复：两条eCFR规范地址由连接器读到全文，但脚本仍跳转验证页；目的地、SIPC说明、GAO页面也存在连接器与本机HTTPS结果差异。

## 证据、修改和边界

| 场景 | 本轮实际读取 | 修改与边界 |
|---|---|---|
| 出境物品登记、境外维修 | [19 CFR 148.1](https://www.ecfr.gov/current/title-19/chapter-I/part-148/subpart-A/section-148.1)及[148.31](https://www.ecfr.gov/current/title-19/chapter-I/part-148/subpart-D/section-148.31)，正文，后次读取显示截至2026-11-02 | 第40章将缺少分部的地址改为同编号含subpart规范地址。核对先带物品和未签字表格给海关检查、以及境外维修改装的区别；未新增税率或扩大免税范围。 |
| 中国用药政策 | [国务院客户端转载国卫医函〔2022〕122号](https://app.www.gov.cn/govdata/gov/202207/31/487965/article.html)，第1、2、7项 | 第05章用具体通知替换泛化卫健委首页，标签注明2022年；范围为医疗机构处方审核、用药教育和管理。不是官网迁址，不是2025互联网医疗答复，不证明药店售药规则或个人疗程。 |
| Kindle格式说明 | [Send to Kindle](https://www.amazon.com/sendtokindle)，脚本取得公开正文Supported File Types及登录要求 | 下载页原帮助nodeId不可读，改指已有官方发送页；该页列有本书提及的EPUB/PDF/DOCX/HTML。没有登录或发送；HTML还含服务错误模板，不能用200状态推定传输服务已正常。 |
| 券商会员核验 | [SEC Investor.gov：SIPC](https://www.investor.gov/introduction-investing/investing-basics/glossary/securities-investor-protection-corporation-sipc)，会员查询与联系方式段 | 第13章补券商/清算公司法律名称、会员部门电话与邮件、保留答复及保障范围边界；第18、32章链接同节。资格查询不要求公开私人账户材料。 |
| 找驻外机构 | [国务院中国目的地页](https://travel.state.gov/en/international-travel/travel-advisories/china.html)，Help for U.S. citizens、使领馆联系方式及领区 | 第29章补从目的地页核对适用机构、常规与紧急渠道、预约与保存离线联系方式；第30、31章及旅行清单同步。中国页是本地场景示范，保留全球目录，不推断全球所有页面布局相同，也不据此复核整页旅行政策。 |
| 跨境病历申请 | [ONC Get It](https://healthit.gov/get-it-check-it-use-it/get-it/)，How Do I Get Started、Things to Consider、How Do I Ask，页面标注2026-01-14 | 第06章补机构、日期范围、资料类型、格式、身份授权、交付、收件核对；第04章链接同节。保留专业指导及既有法律条件，不把操作指南换作全部费用/期限规则的来源。 |
| 志愿报名 | [NPS Become a Volunteer](https://www.nps.gov/subjects/volunteer/become.htm)，Find a Volunteer Opportunity、Become a Volunteer | 第25章补地点/活动筛选、具体公园页面、OF301后备申请、岗位确认及开始前协议；第24章链接同节。只覆盖国家公园岗位，不宣称全国所有志愿项目通用。 |
| 联邦资金线索举报 | [GAO FraudNet](https://www.gao.gov/about/what-gao-does/fraud)，About、Other Ways、After、Follow Up | 第11章补管辖范围、准备事实、官方在线/电话/邮件渠道、隐私选项与控制编号。仅适用于相关联邦资金线索，不替代全部OIG受理范围、普通行政上诉或投诉期限。 |

后备步骤是基于来源整理的办事建议；联系方式来自机构说明，未亲测接通或办理。保持既有标题、内容ID和清单任务ID，没有更新整章事实核验日期、周期台账或来源监测基线。

## 六条保留缺口

- IDEA总入口、ED残障歧视概览及两篇FAQ：原页和部门资源候选仍受限。搜索可见原文摘要，但不以摘要充当全文核验。[GovInfo的2016年504指南归档说明](https://www.govinfo.gov/app/details/GOVPUB-ED-PURL-gpo246199)明确提醒可能不反映现行政策；[得州教育局504资源页](https://tea.texas.gov/special-populations-and-support/section-504)仍链接联邦指南，但州页面不能机械替代全国所有适用情况。归档PDF的HTTP200不代表本轮已做全篇法律审查。
- NIA的老年人是否需要帮助、照护FAQ：原页和另一FAQ路径仍显示机器人验证。检索见旧照护手册及已有NIH信息中心资源，未找到能确认覆盖现行两篇全文的替代；保留原链接与核验缺口。

Oversight.gov与AmeriCorps新路径本轮仍受限，没有用同样打不开的地址制造修复。其相关读者场景改为上表所述较窄后备路径。

## 验收终点

统一快速检查、PR完整CI、合并后部署、线上正文/静态锚点/搜索/导航/RSS及六个下载文件校验均为终点要求。实际运行链接与结果填写PR，最终main外链报告归档。内容可执行性与全站HTTP统计分别报告，不把CI通过当作医学、法律或税务专业审定。
