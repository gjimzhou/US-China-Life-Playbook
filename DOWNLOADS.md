# 下载与离线阅读

想放进 Kindle、平板、手机或本地文档软件慢慢读，可以直接下载整本离线版。**这些文件由 GitHub Actions 随网站一起重新生成**，与当前发布版本使用同一套 Markdown 正文。

> 离线阅读版以读者真正需要的内容为主：主页与免责声明、40章正文、全部执行清单、术语表、方法论和来源原则。仓库维护记录、编辑日志等不塞进电子书正文；需要完整 Markdown 源文件时下载 源文件压缩包。

## Kindle：优先下载 EPUB

[下载 EPUB（Kindle 推荐）](downloads/US-China-Life-Playbook.epub)

亚马逊电子书发送服务（Send to Kindle）当前 支持 EPUB、PDF、DOCX、HTML 等个人文档格式。对于这本以长篇文字、标题、表格和链接为主的指南，**EPUB 是最适合 Kindle 的可重排版本**：字号、行距和页面会跟随设备调整。

下载 EPUB 后可使用 [亚马逊电子书发送服务（Send to Kindle）](https://www.amazon.com/sendtokindle) 发送到自己的 Kindle书库。

**亚马逊格式说明：** [Send to Kindle 支持的文件类型](https://www.amazon.com/gp/help/customer/display.html?nodeId=TCUBEdEkbIhK07ysFu)。

## 其他阅读格式

| 格式 | 适合什么 | 下载 |
|---|---|---|
| EPUB | Kindle、Apple Books、Kobo 等可重排阅读 | [下载 EPUB](downloads/US-China-Life-Playbook.epub) |
| PDF | 打印、固定版式、电脑和平板阅读 | [下载 PDF](downloads/US-China-Life-Playbook.pdf) |
| DOCX | Word / Pages 中批注、二次编辑 | [下载 DOCX](downloads/US-China-Life-Playbook.docx) |
| 单文件 HTML | 浏览器离线阅读，保留目录与链接 | [下载 HTML](downloads/US-China-Life-Playbook.html) |
| 单文件 Markdown | Markdown 阅读器、Obsidian 等 | [下载 Markdown](downloads/US-China-Life-Playbook.md) |
| Markdown 源文件 ZIP | 保留原章节文件，自己转换或归档 | [下载源文件压缩包](downloads/US-China-Life-Playbook-source-markdown.zip) |

## 为什么不单独提供 MOBI / AZW3

Kindle 的个人文档工作流现在可以直接接收 EPUB，没有必要把 MOBI 当作默认格式。EPUB 也更容易保持目录、可重排文本和跨设备兼容性。需要为特殊旧设备手动导入 的读者，可以从 EPUB 自行转换。

## 版本与完整性

每次 `main` 更新触发 Pages 发布时，离线文件会重新生成。导出目录同时提供：

- [构建清单](downloads/manifest.json)：文件大小、SHA-256 与源码提交版本；
- [文件校验值（SHA-256）](downloads/SHA256SUMS.txt)：用于校验下载文件完整性。

电子书是**阅读快照**。税务、移民、医疗、保险等动态规则仍应以在线版的最新正文和原始官方来源为准。
