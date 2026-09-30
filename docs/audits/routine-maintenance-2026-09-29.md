# 2026-09-29 日常维护

基线：main@6ca0cba445dd07b2a80fab29649cf4dbac0812cb。本轮为工程与维护队列巡检，不是正文事实复核。

## 检查结果

- 近期部署、维护队列及外链工作流成功；没有开放的故障Issue。
- 已下载并阅读[2026-09-28外链报告](https://github.com/gjimzhou/US-China-Life-Playbook/actions/runs/36477101995)：856个地址，588个正常，0个404／410，250个访问受限、12个临时失败、6个其他HTTP警告。45个可访问地址发生重定向。后几类结果不能证明断链，也不能证明来源支持正文，本轮不据此删除链接。
- [Issue #7](https://github.com/gjimzhou/US-China-Life-Playbook/issues/7)仍有10月1日三个部分核验范围及10月2日保险外部复核到期事项。保持原状态和期限；本轮未读取对应全部官方事实来源，不更新核验日期。
- 构建日志重复提示旧动作的Node 20运行时及setup-java v4弃用；本轮升级实际引用的动作。

## 升级与兼容判断

| 动作 | 更新 | 官方说明及本项目影响 |
|---|---|---|
| setup-node | v4 → v7 | [v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0)：移除虚构认证token的兼容变更不影响本项目，无registry-url或发布npm配置；显式npm缓存保持。 |
| setup-java | v4 → v6 | [v6.0.1](https://github.com/actions/setup-java/releases/tag/v6.0.1)及[迁移说明](https://github.com/actions/setup-java/tree/v6.0.1#whats-new)：继续使用Temurin 21，不涉及被移除的AdoptOpenJDK或Maven发布参数。 |
| upload-artifact | v4 → v7 | [v7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1)：保留默认归档上传、原产物名称和保留天数，与现用download-artifact v8共同接受完整性验证；不启用直接上传或覆盖。 |
| configure-pages / upload-pages-artifact / deploy-pages | v5/v4/v4 → v6/v5/v5 | [配置](https://github.com/actions/configure-pages/releases/tag/v6.0.0)、[上传](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0)、[部署](https://github.com/actions/deploy-pages/releases/tag/v5.0.1)：使用Node 24动作及上传依赖，保留同一artifact_name和既有Pages权限。 |

Node 24动作需要支持它的runner（setup说明要求至少v2.327.1）；本项目使用GitHub托管Ubuntu runner，完整CI确认运行兼容。项目本身的Node 22、Java 21、Python 3.12、Pandoc及导出依赖保持原配置。共享安装仍集中在`.github/actions/setup/action.yml`，检查仍走`python scripts/validate.py`。

upload-pages-artifact v5默认排除隐藏文件；原verified-site上传已排除隐藏文件，部署不依赖这一步传递`.nojekyll`。没有开启整目录隐藏文件上传。新动作默认仍将artifact.tar归档，部署沿用指定名称取产物。

## 验证与边界

合并依据本PR完整`validate`、维护报告及外链报告；完整检查包含浏览器回归、六种导出、EPUBCheck及上传后下载校验。工具升级另抽看导出PDF；main合并后确认Pages部署与在线清单源码提交。最终执行结果见关联PR及Actions，不能用这份记录预先宣称成功。

普通工程维护不递增版本、不运行正式发布、不覆盖v1.3固定附件；不修改正文、事实台账、稳定ID或私人数据策略。实体设备验收与官方来源提醒仍分别由Issue #5、#6跟踪。
