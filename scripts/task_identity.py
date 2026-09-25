"""Report unassigned tasks. Explicit --assign-new never guesses identity migrations."""
import argparse, hashlib, json, re, secrets
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--assign-new',action='store_true');args=p.parse_args()
ids=json.loads((root/'site/content-ids.json').read_text());catalog_path=root/'site/task-ids.json';catalog=json.loads(catalog_path.read_text())
# Read the same build sections without requiring a successful build after an edit.
from reader_features import attach_ids
import unicodedata
new=0
for path,entry in ids.items():
    if not path.startswith('checklists/') or not (root/path).exists():continue
    seen={}
    for part in re.split(r'(?=^#{2,6} )',(root/path).read_text(),flags=re.M):
        heading=re.search(r'^(#{1,6}) (.+)',part,re.M);text=heading[2] if heading else '概览'
        plain=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',text).replace('`','')
        slug=''.join(c for c in plain.lower() if c in '-_ ' or unicodedata.category(c)[0] in 'LN').replace(' ','-') or 'section'
        count=seen.get(slug,0);seen[slug]=count+1;slug+=f'-{count}' if count else ''
        sid=entry['sections'].get(slug)
        if not sid:raise SystemExit(f'Assign/preserve section identity first: {path}#{slug}')
        for line in re.findall(r'^\s*[-*+] \[[ xX]\] (.+)$',part,re.M):
            key=sid+':'+hashlib.sha256(line.strip().encode()).hexdigest()[:20]
            if key not in catalog:
                new+=1;print(path,slug,key,line)
                if args.assign_new:catalog[key]='t-'+secrets.token_hex(6)
if args.assign_new:catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(f'{new} unassigned task(s)' if not args.assign_new else f'{new} new task ID(s) assigned; review migrations before committing')
