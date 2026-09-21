"""Build an allowlisted, dependency-free GitHub Pages artifact."""
from pathlib import Path
import json,re,shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'
if OUT.exists():shutil.rmtree(OUT)
shutil.copytree(ROOT/'site',OUT)
labels={'first-30-days':'前 30 天','annual-review':'年度复查','emergency-sheet':'紧急信息表','cyber-incident':'网络安全事件','death-administration':'死亡后事务','home-purchase':'购房与交割','international-travel':'国际旅行','job-loss':'失业应对','marriage-checklist':'婚姻准备','move-checklist':'搬家','parents-emergency':'父母紧急应对','GLOSSARY':'中英术语表','METHODOLOGY':'方法论','STYLE':'写作规范','CONTRIBUTING':'贡献指南','source-policy':'来源原则','README':'项目介绍'}
paths=sorted((ROOT/'book').glob('*.md'))+sorted((ROOT/'checklists').glob('*.md'))+[ROOT/p for p in ['GLOSSARY.md','METHODOLOGY.md','STYLE.md','CONTRIBUTING.md','references/source-policy.md','README.md']]
docs=[]
for p in paths:
 text=p.read_text();path=p.relative_to(ROOT).as_posix()
 title=labels.get(p.stem,re.sub(r'^#\s*','',text.splitlines()[0]))
 kind='正文' if path.startswith('book/') else '清单' if path.startswith('checklists/') else '参考'
 parts=re.split(r'(?=^## )',text,flags=re.M)
 sections=[]
 for i,part in enumerate(parts):
  heading=re.match(r'^## (.+)',part)
  priorities=sorted(set(re.findall(r'(?:Priority|优先级)[*：:\s]*\b(P[0-3])\b',part)))
  evidence=sorted(set(re.findall(r'(?:Evidence|证据等级)[*：:\s]*\b([ABC])\b',part)))
  sections.append({'id':f's{i}','title':heading[1] if heading else '概览','markdown':part,'priorities':priorities,'evidence':evidence})
 docs.append({'path':path,'title':title,'kind':kind,'sections':sections})
 dest=OUT/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text)
(OUT/'data.json').write_text(json.dumps(docs,ensure_ascii=False))
(OUT/'.nojekyll').touch()
print(f'Built {len(docs)} documents; {sum(len(d["sections"]) for d in docs)} searchable sections')
