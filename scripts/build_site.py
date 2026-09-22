"""Build an allowlisted, dependency-free GitHub Pages artifact."""
from pathlib import Path
import json,re,shutil,hashlib,unicodedata
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'
if OUT.exists():shutil.rmtree(OUT)
shutil.copytree(ROOT/'site',OUT)
labels={'first-30-days':'前 30 天','annual-review':'年度复查','emergency-sheet':'紧急信息表','cyber-incident':'网络安全事件','death-administration':'死亡后事务','home-purchase':'购房与交割','international-travel':'国际旅行','job-loss':'失业应对','marriage-checklist':'婚姻准备','move-checklist':'搬家','parents-emergency':'父母紧急应对','life-events-index':'生活事件索引','pet-loss':'宠物去世','mental-health-care':'心理健康服务','rental-lifecycle':'租房全流程','school-support':'学龄教育支持','separation-family-safety':'分居离婚与家庭安全','disaster-utility-outage':'灾害与公共服务中断','cross-border-problem':'跨境办事失败排查','pregnancy-birth-loss':'怀孕生产与妊娠丢失','hospital-discharge-major-diagnosis':'重大诊断与出院','lost-wallet-documents':'钱包与重要证件丢失','vehicle-roadside-ticket-tow':'车辆抛锚拖车与罚单','lost-pet':'宠物走失','crime-victim':'犯罪受害与失踪','workplace-injury-leave':'工伤与请假','medication-access-problem':'药物获取失败','jury-court-summons':'Jury与法院通知','immigration-notice-rfe':'USCIS Notice处理','GLOSSARY':'中英术语表','METHODOLOGY':'方法论','STYLE':'写作规范','CONTRIBUTING':'贡献指南','source-policy':'来源原则','HOME':'首页与阅读导览','editorial-status':'编辑审查进度','README':'项目介绍','DISCLAIMER':'阅读须知与免责声明'}
paths=sorted((ROOT/'book').glob('*.md'))+sorted((ROOT/'checklists').glob('*.md'))+[ROOT/p for p in ['HOME.md','references/editorial-status.md','DISCLAIMER.md','GLOSSARY.md','METHODOLOGY.md','STYLE.md','CONTRIBUTING.md','references/source-policy.md','README.md']]
docs=[]
for p in paths:
 text=p.read_text();path=p.relative_to(ROOT).as_posix()
 title=labels.get(p.stem,re.sub(r'^#\s*','',text.splitlines()[0]))
 kind='正文' if path.startswith('book/') else '清单' if path.startswith('checklists/') else '参考'
 # Use heading anchors rather than ordinal positions for new links. Keep
 # aliases for legacy H2 routes, and index each explicit heading separately
 # so tags from distinct subheadings cannot form a false combined match.
 parts=re.split(r'(?=^#{2,6} )',text,flags=re.M)
 sections=[]; seen={}; legacy=0
 for i,part in enumerate(parts):
  heading=re.search(r'^(#{1,6}) (.+)',part,re.M)
  level=len(heading[1]) if heading else 1
  heading_text=heading[2] if heading else '概览'
  plain=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',heading_text).replace('`','')
  slug=''.join(c for c in plain.lower() if c in '-_ ' or unicodedata.category(c)[0] in 'LN').replace(' ','-') or 'section'
  duplicate=seen.get(slug,0);seen[slug]=duplicate+1
  anchor=slug+(f'-{duplicate}' if duplicate else '')
  aliases=[]
  if i==0: aliases=['s0']
  elif level==2:
   legacy+=1;aliases=[f's{legacy}']
  tags=[]
  for block in re.split(r'\n\s*\n',part):
   if block.lstrip().startswith('>'):continue  # quoted field templates are not ratings
   priorities=sorted(set(re.findall(r'(?:Priority|优先级)[*：:\s]*\b(P[0-3])\b',block)))
   evidence=sorted(set(re.findall(r'(?:Evidence|证据等级)[*：:\s]*\b([ABC])\b',block)))
   if priorities or evidence:tags.append({'priorities':priorities,'evidence':evidence})
  sections.append({'id':anchor,'aliases':aliases,'level':level,'title':heading_text if i else '概览','markdown':part,'tags':tags,'priorities':sorted({v for t in tags for v in t['priorities']}),'evidence':sorted({v for t in tags for v in t['evidence']})})

 reading_mode=re.search(r'^> \*\*内容性质：([^*]+)\*\*',parts[0],re.M)
 docs.append({'path':path,'title':title,'kind':kind,'readingMode':reading_mode[1] if reading_mode else '', 'sections':sections})
 dest=OUT/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text)
(OUT/'data.json').write_text(json.dumps(docs,ensure_ascii=False))
(OUT/'.nojekyll').touch()
print(f'Built {len(docs)} documents; {sum(len(d["sections"]) for d in docs)} searchable sections')

# Bind the app to this exact content build, including for returning readers.
# A fixed data.json URL can otherwise serve an older cached chapter index.
data_digest=hashlib.sha256((OUT/'data.json').read_bytes()).hexdigest()[:16]
data_asset=f'data.{data_digest}.json'
(OUT/'data.json').rename(OUT/data_asset)
app=(OUT/'app.js').read_text().replace("'data.json'",repr(data_asset))
(OUT/'app.js').write_text(app)

# Content hashes keep cached assets aligned with each deployed build.
index=(OUT/'index.html').read_text()
for asset in ['app.js','theme.js','style.css','vendor/marked.js']:
    digest=hashlib.sha256((OUT/asset).read_bytes()).hexdigest()[:12]
    index=index.replace('"'+asset+'"','"'+asset+'?v='+digest+'"')
(OUT/'index.html').write_text(index)
