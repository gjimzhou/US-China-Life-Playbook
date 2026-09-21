# Contributing

欢迎贡献。

这个项目不是“大家随便分享生活经验”的论坛，而是一套：

> **可验证、可执行、低噪音、public-safe 的 US–China household playbook（中美家庭生活操作手册）。**

---

## 1. 优先欢迎什么内容

- 高后果但容易忽略的生活规则；
- 美国 / 中国 institutional routing（机构入口与分流）；
- 中美 cross-border interface（跨境接口）；
- emergency runbook（紧急操作手册）；
- insurance / legal / tax / healthcare workflow；
- first-generation immigrant tacit knowledge（第一代移民没人教的隐性知识）；
- checklist；
- 反面清单；
- official rule update；
- broken link / stale rule 修正；
- 更清楚、更准确的双语术语解释。

---

## 2. 不适合提交

- 个人故事流水账；
- 无来源的“听说”；
- investment hot take；
- 政治宣传；
- 医疗诊断；
- 个案法律意见；
- tax evasion / compliance workaround；
- visa hack；
- 商业软广；
- affiliate links；
- provider advertising；
- 无法泛化的私人恩怨；
- 单纯为了“更中文/更英文”而降低准确性的改写。

---

# Evidence & Sources

## 3. Primary source first

优先使用：

1. U.S./China government；
2. professional guideline / professional body；
3. peer-reviewed academic evidence；
4. reputable practical source；
5. community/anecdotal source 仅用于发现问题，不应独立支撑高后果规则。

详见：

[Source Policy](references/source-policy.md)

---

## 4. 动态规则必须注明核验日期

以下内容尤其需要：

- tax threshold；
- filing deadline；
- immigration rule；
- government form；
- insurance requirement；
- benefits limit；
- travel/entry rule；
- phone number；
- document authentication。

格式：

> Last checked: YYYY-MM-DD

---

## 5. 不把“有文献”自动等于“证据强”

Evidence grading 见：

[METHODOLOGY.md](METHODOLOGY.md)

A/B/C 分的是：
- authority；
- study quality；
- generalizability；
- certainty。

不是给观点贴“科学”标签。

---

# Privacy — 绝对要求

## 6. Public repo 不得提交真实个人信息

包括但不限于：

- full name；
- home/work address；
- phone；
- personal email；
- DOB；
- SSN；
- Chinese ID；
- passport number；
- A-number；
- USCIS receipt/case number；
- bank/brokerage account；
- insurance member ID；
- medical record；
- prescription details tied to a real identifiable person；
- lawyer/doctor/private-provider personal details；
- parent/family identity；
- employer；
- compensation；
- net worth；
- exact travel itinerary；
- immigration case facts；
- private correspondence；
- signed legal documents。

---

## 7. 不要用 repo owner 的真实生活作为 example

即使信息已经公开过，也不要写：

> “例如 repo owner 住在 X，收入 Y，所以……”

示例必须：

- generic；
- fictional；
- de-identified；
- broadly applicable。

---

## 8. Screenshots / PDFs 特别危险

提交前检查：

- metadata；
- account name；
- browser profile；
- address；
- case number；
- QR code；
- barcode；
- signature；
- face；
- email；
- hidden comments。

能用文字重写时，不要上传真实私人 screenshot。

---

## 9. Checklist 只能提交 blank template

正确：

> PCP: ______

错误：

> PCP: Dr. Real Name, phone...

真实 household data 应留在：
- password manager；
- encrypted private storage；
- private personal document system。

---

# Writing Style

## 10. 默认不是纯中文，也不是 English-heavy

本项目使用：

> **中文叙述 + 必要 English technical terms（英文技术术语）**

完整规范：

[STYLE.md](STYLE.md)

---

## 11. 第一次出现时尽量双语

美国制度固定术语：

> umbrella insurance（个人超额责任险）

中文概念为主时：

> 信用冻结（credit freeze）

后文不必每次重复括号。

---

## 12. 不发明“看起来官方”的中文法定译名

例如：

- probate；
- trust；
- escrow；
- FMLA；
- COBRA；
- HSA；
- chargeback。

可以解释，但不要让中文括号看起来像法律官方译名。

---

## 13. Agency / Form 保留官方英文

例如：

- IRS
- USCIS
- CFPB
- Form I-9
- Form 1041
- Closing Disclosure

这样读者可以直接搜索官方来源。

---

# Structure

## 14. 新 rule 推荐格式

> ## Rule title  
> **Evidence:** A/B/C  
> **Priority:** P0/P1/P2/P3  
> **Geography:** US / China / Cross-border  
>  
> **Why**  
> ...  
>  
> **Action**  
> ...  
>  
> **Do not**  
> ...  
>  
> **Source**  
> ...  
>  
> Last checked: YYYY-MM-DD

不需要为了形式强行把所有字段都填满。

---

## 15. Rule 应尽量回答一个明确问题

好的：

> 收到 IRS notice 后第一步做什么？

差的：

> 税务很重要。

---

## 16. 章节不要追求数字凑齐

可以：
- 18 条；
- 23 条；
- 31 条。

不要为了“正好 30 条”加入低价值 filler。

---

## 17. Checklist 与 chapter 分工

Chapter：
- 为什么；
- 概念；
-判断；
-例外；
-来源。

Checklist：
- 当下执行；
- 一页能完成；
- 少解释。

如果一段内容两边都有价值，可以：
- chapter 讲 reasoning；
- checklist 放 action。

---

# Pull Request Review

## 18. Review questions

提交前问：

- 这条建议是真的吗？
- 现在还是真的吗？
- 对谁适用？
- 有什么 exception？
- 来源是不是 primary？
- 是否误把 China/US 规则类推？
- 是否泄露 personal info？
- 是否能实际执行？
- 是否已经在别的章节重复？
- 英文术语是否保留了检索价值？

---

## 19. 高风险领域宁可保守

尤其：

- emergency medicine；
- immigration；
- tax；
- criminal law；
- securities；
- employment；
- insurance claim；
- cross-border legal authority。

如果无法确认：

> 标记 uncertainty，而不是猜。

---

## 20. 项目的最终标准

一条内容值得存在，如果它能让读者：

- 少犯一次高后果错误；
- 少一次临时 Google；
- 更快找到正确机构；
- 更快知道什么时候该请 professional；
- 把一次性知识变成长期 household infrastructure。

最后更新：2026-09-21
