# 06 — 医疗记录、药物与跨境连续性照护（Continuity of Care）

Dual-home household 最容易把 medical history 变成：

> “美国一个 portal、中国三个 app、手机相册一堆报告、医生各知道一点。”

这在 routine care 时只是麻烦。

在 emergency / surgery / new diagnosis 时会变成真正风险。

---

## 1. 建一个 one-page Medical Summary

每个家庭成员一页，字段：

- legal name
- DOB
- emergency contact
- allergies
- current medications
- major diagnoses
- surgeries/procedures
- implanted devices
- major imaging/pathology
- vaccination highlights
- health-care proxy location

Public repo 不保存真实内容。

---

## 2. Medication list 必须可读、可复制

推荐格式：

| Generic | Brand | Dose | Frequency | Reason | Prescriber |
|---|---|---|---|---|---|

尤其 cross-border：
- generic name first；
- English + Chinese if needed；
- include PRN rule；
- include OTC/supplement if clinically relevant。

---

## 3. 不要只依赖 portal

Portal risk：
- provider leaves；
- account expires；
- health system changes；
- you lose phone/MFA；
- China access blocked/slow；
- emergency clinician can't log in。

关键 records 要有 portable copy。

---

## 4. 也不要打印 1,000 页 medical record

真正 useful 的 portable core：

- medical summary；
- medication/allergy list；
- major surgery notes；
- pathology；
- key imaging reports；
- relevant labs；
- vaccination；
- recent specialist note。

原始 full chart 可以 secondary archive。

---

## 5. Imaging 保存 report + actual images

MRI/CT：
- written report；
- DICOM/cloud link；
- date/body part；
- facility。

Second opinion 经常需要看 actual images，不只是 report。

---

## 6. Pathology 是长期高价值 record

Cancer/biopsy-related：
- pathology report；
- slides/block availability；
- molecular test；
- operative report。

这些可能多年后仍决定 treatment。

---

## 7. Surgery record 至少保存 procedure + implant

包括：
- operation name；
- date；
- surgeon/facility；
- implant/device model if any；
- complications；
- post-op restrictions。

未来 MRI、revision、airport/security、new surgeon 可能需要。

---

## 8. Vaccine record 不要只存在纸卡

保存：
- scan；
- electronic record；
- vaccine/date/manufacturer if available。

跨境时某些 vaccine brand 不同，但记录仍有用。

---

## 9. Lab result 传递要保留单位

不要写：
> “我的 LDL 是 2.8。”

必须保留：
- unit；
- date；
- reference range；
- fasting/status if relevant；
- assay context。

不同国家 unit system 可能不同。

---

## 10. Clinical translation 不要只用普通机器翻译

对 routine summary，machine translation 可以辅助。

对：
- pathology；
- legal medical certification；
- surgery；
- insurance claim；
- disability；
- immigration medical

可能需要 professional/clinician-reviewed translation。

---

## 11. Doctor-to-doctor summary 比完整 record 更重要

如果从美国转中国或反向：
让 treating doctor 写：
- diagnosis；
- workup；
- what has been ruled out；
- current treatment；
- open questions；
- next plan。

一页高质量 summary 常比 200 页 chart 更 useful。

---

## 12. Medication refill 要考虑 travel horizon

出国前：
- supply length；
- refill-too-soon rule；
- vacation override；
- cold chain；
- controlled substance；
- destination import restriction。

不要等出发前一天。

---

## 13. Cold-chain medication 要做 failure plan

如 applicable：
- temperature range；
- carry-on；
- hotel refrigeration；
- backup cooling；
- airline security；
- what if excursion occurs。

不要默认 minibar 是 medical refrigerator。

---

## 14. Controlled medication 要查 destination law

某些 U.S.-legal prescription：
- stimulant；
- opioid；
- benzodiazepine；
- sleep medication

在 destination 可能受更严格限制。

**执行原则**
查 destination government/embassy/health authority。

---

## 15. Emergency info 要离线可用

如果：
- phone dead；
- internet unavailable；
- unconscious；

至少 spouse/agent 能找到：
- allergies；
- meds；
- major conditions；
- proxy；
- insurer。

---

## 16. Health-care proxy 与 HIPAA permission 是不同概念

美国：
- health-care proxy：incapacity decision-making；
- HIPAA authorization / provider permission：information access。

具体 state/provider paperwork 不同。

**执行原则**
不要以为“我是配偶”一定能随时拿全部 records。

---

## 17. Parents records 也要 structured

尤其：
- medication；
- chronic disease；
- hospital；
- doctor；
- last admission；
- imaging；
- insurance。

远程照护最怕“每个人知道一部分”。

---

## 18. Privacy：medical archive 要比普通相册更安全

适合：
- encrypted cloud；
- password manager secure document；
- encrypted drive。

不适合：
- public link；
- shared work account；
- random chat history。

---

## 19. 年度 medical-record audit

每年：
- medication list；
- vaccines；
- new surgery；
- new diagnosis；
- key lab/imaging；
- doctor changes；
- proxy；
- insurance。

---

## 20. 最小执行集

- [ ] one-page Medical Summary
- [ ] generic-name medication list
- [ ] allergy list
- [ ] vaccine record
- [ ] major imaging reports + images
- [ ] surgery/pathology archive
- [ ] portable discharge summaries
- [ ] proxy/privacy authorization understood
- [ ] travel refill plan
- [ ] encrypted storage + spouse access

最后更新：2026-09-21
