# 2026-11-03：33条访问缺口的替代资料与后备办理路径

执行：Codex；基线 main `c6a63c7e2473b1b5425382dcffcdcbe70e25ce49`。唯一范围为[上一轮41条记录](2026-11-03-unresolved-links-41.md)中33条 `retain_unresolved`。逐条响应、原理由、处置和候选地址见[JSON证据](2026-11-03-unresolved-links-33.json)。

## 结果与方法

33条均用HTTPS脚本复测并由搜索连接器直接打开；同域串行、跨域并发、15秒超时，保留TLS验证。脚本为29 blocked、3 transient、1 warning。没有浏览器操作、登录、电话或实际提交。

9条替换，9条保留工具并补后备步骤，15条仍未解决。9条替换中，6条NIA旧地址归并到4篇更具体的MedlinePlus资料，3条IDEA法规改用同编号eCFR条文。13个替代或后备来源的脚本结果为10 ok、3 blocked；后3个eCFR条文可由连接器读到正文，但脚本仍遇访问验证，因此不能把9条替换都宣传为网络访问已恢复。9条有后备步骤的原工具也仍有访问缺口。

## 已读取证据与适用边界

| 范围 | 本轮读取 | 整改及限制 |
|---|---|---|
| 医疗代理人 | [MedlinePlus医学百科000469](https://medlineplus.gov/ency/patientinstructions/000469.htm)，选择代理人与职责部分 | 替换NIA选择代理人的引用。属于NLM托管的A.D.A.M.医学百科，不标作NIH原创临床指南；州文件、签署和跨境效力仍另核。 |
| 预先医疗意愿 | [MedlinePlus医学百科000472](https://medlineplus.gov/ency/patientinstructions/000472.htm)，讨论、文件、州规则与副本部分 | 两条NIA入口归并；同步第10章对话工具描述，不将通用信息包装成适用所有州的表格。 |
| 重要事务整理 | [NIH MedlinePlus清单](https://magazine.medlineplus.gov/multimedia/getting-your-affairs-in-order-checklist)，正文与图片可访问文字，2024-11-01 | 全书相关引用同步替换；第20章删去较宽的保险/联系人覆盖描述，收窄为医疗财务讨论、文件位置及可信任的人。 |
| 照护任务 | [NIH MedlinePlus照护入门](https://magazine.medlineplus.gov/article/caregiving-101-worksheets-resources-and-suggestions-from-the-national-institute-on-aging)，入门、分工、资源部分 | 两条NIA入口换为照护任务资料；未把文中指向NIA的所有工作表下载视为可用。 |
| 特殊教育 | [34 CFR 300.301](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-III/part-300/subpart-D/subject-group-ECFRcdd53b28839f370/section-300.301)、[300.502](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-III/part-300/subpart-E/section-300.502)、[300.504](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-III/part-300/subpart-E/section-300.504)，条文全文，显示截至2026-10-30 | 替换对应ED条文入口；保留初次评估期限的州规则与例外，不重写504 FAQ。eCFR是政府提供的持续更新文本，不是正式法律印刷版。 |
| 移民工具故障 | [USCIS联系中心](https://www.uscis.gov/contactcenter)，账户支持、Live Assistance、境外电话与案件资料披露部分 | 连接器403，但脚本取得200及实际正文。第37章和两份清单补账户、技术帮助、境内外电话、请求编号及期限处理；不承诺人工接通、加速或延期。 |
| CPA核验 | [NASBA州委员会目录](https://nasba.org/stateboards/)与[数据库说明](https://nasba.org/blog/2026/03/12/all-about-cpaverify/)，正文 | 先收集姓名/发证州/号码，再查州监管委员会；查不到时询问官方联系人。不是全国数据库的完全替代，未实查个人执照。 |
| 消费投诉 | [市场监管总局121号令](https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2026/art_e4d03a20c0fd49769e408c7bf3791ff5.html)，第8、10、11、13、15条 | 第12章和两份清单补材料、管辖、邮寄/窗口、收件跟进；没有杜撰全国统一收件地址。 |
| 社保查询 | [隆阳区政府查询渠道说明](https://www.longyang.gov.cn/info/4165/13899419.htm)，2024-12-19正文 | 地方政府介绍全国查询渠道；第12章及三份清单补电子社保卡、掌上12333和经办窗口。只覆盖本人参保缴费查询，当前菜单、证件适用及代办仍向经办地确认。 |
| 父母在美照护 | [ACL求助说明](https://acl.gov/help)，Eldercare Locator部分 | 补需求/邮编、当地资源、官方电话及费用资格等询问步骤；转介不等于获批，境外800电话不保证接通。 |

整理步骤属于基于上述来源的编辑建议。没有更新整章事实核验日期、监测基线或周期复核台账，不表示完成个案医学、法律或税务审定。

## 仍未解决

15条为IDEA总入口、3条ED残障/504说明、2条eCFR海关条文、HHS专业病历访问说明、Amazon具体帮助、AmeriCorps、IGnet、NHC首页、NIA观察与照护FAQ、SIPC会员查询和使领馆总目录。原理由与后续核对方向逐条保留在JSON；这里不把所有旧备选都说成本轮重新读取。

特别是SIPC连接器虽返回803行，仍含未渲染的会员检索模板，不能算查询恢复；USA.gov使馆说明页指回原目录，不构成独立后备入口。海关法规不能拿旧年版或地方解释机械替代当前精确条文。临床观察和FAQ也没有强行换成泛化主题目录。

## 发布验收

保持所有既有标题、段落和任务ID。统一快速验证后，通过PR运行完整CI，成功后合并；main部署后核对101篇正文、静态锚点、搜索路由、导航、RSS及六个下载文件哈希。最终运行链接与线上结果写入PR，最新云端外链报告单独归档；本地HTTP结果不能替代线上部署或全站外链状态。
