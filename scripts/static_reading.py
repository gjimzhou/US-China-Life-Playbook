"""Build independently readable chapter URLs without a client-side router."""
import html, json, re, subprocess, hashlib
from pathlib import PurePosixPath
from urllib.parse import urlsplit, unquote, quote, urljoin
from reader_features import BASE

def build_static(root,out,docs):
    by_path={d['path']:d for d in docs}
    target=out/'read';target.mkdir(exist_ok=True)
    catalog=[]
    for d in docs:
        def replace(match):
            href=match[2];u=urlsplit(href)
            if u.scheme or u.netloc:return match[0]
            p=urlsplit(urljoin('https://local/'+d['path'],href))
            path=unquote(p.path.lstrip('/'));other=by_path.get(path)
            if other:
                section=next((s for s in other['sections'] if unquote(p.fragment) in [s['id'],*s['aliases']]),None)
                dest=other['contentId']+'.html'+('#'+section['contentId'] if section else '')
            elif path.startswith('downloads/'):dest='../'+path
            else:dest='https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/'+quote(path)+('#'+p.fragment if p.fragment else '')
            return '['+match[1]+']('+dest+')'
        blocks=[]
        for s in d['sections']:
            body=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',replace,s['markdown'])
            blocks.append('<section id="'+s['contentId']+'">\n\n'+body+'\n\n</section>\n')
        result=subprocess.run(['pandoc','--from=gfm+raw_html','--to=html5'],input='\n'.join(blocks),text=True,capture_output=True,check=True).stdout
        result=re.sub(r'<input\b[^>]*>', lambda m: m[0].replace('<input', '<input disabled') if 'checkbox' in m[0] else m[0], result)
        title=html.escape(d['title']);desc=html.escape(re.sub(r'[#*`\[\]>\n]',' ',d['sections'][0]['markdown'])[:160]);url=BASE+'read/'+d['contentId']+'.html'
        revision=hashlib.sha256(''.join(s['markdown'] for s in d['sections']).encode()).hexdigest()[:12]
        toc=''.join('<li><a href="#'+s['contentId']+'">'+html.escape(s['title'])+'</a></li>' for s in d['sections'] if s['level']==2)
        body=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} · 中美双栖人生指南</title><meta name="description" content="{desc}"><link rel="canonical" href="{url}"><meta name="author" content="Junliang Zhou 及项目贡献者"><meta property="og:type" content="article"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{url}"><link rel="stylesheet" href="../style.css"><link rel="icon" href="../favicon.svg"><link rel="alternate" type="application/rss+xml" href="../feed.xml" title="更新订阅"><script defer src="../offline.js"></script></head><body class="static-page"><a class="skip" href="#chapter">跳到正文</a><header><a href="../">中 / 美 · 中美双栖人生指南</a></header><main id="chapter"><nav class="static-tools"><a id="interactive-link" href="../#content={d['contentId']}">进入互动阅读（收藏、清单与阅读设置）</a> · <a href="../offline.html">离线阅读中心</a></nav><p class="hint">独立阅读页 · 正文版本 {revision}。行动前请核对适用日期、地区与原始来源。</p><p id="offline-status" role="status"></p><details><summary>本章目录</summary><ul>{toc}</ul></details><article>{result}</article><details class="citation"><summary>引用本章</summary><p>Junliang Zhou 及项目贡献者：《中美双栖人生指南·{title}》。<a href="{url}">{url}</a>。正文版本 {revision}；请补充你的访问日期。</p></details><footer><a href="../#view=updates">订阅更新</a> · <a href="../#view=privacy">隐私说明</a></footer></main></body></html>'''
        (target/(d['contentId']+'.html')).write_text(body)
        catalog.append({'contentId':d['contentId'],'title':d['title'],'url':'read/'+d['contentId']+'.html','revision':revision})
    (out/'offline-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False))
    (out/'sitemap.xml').write_text('<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+BASE+c['url']+'</loc></url>' for c in catalog)+'</urlset>')

    links=''.join('<li><a href="'+d['contentId']+'.html">'+html.escape(d['title'])+'</a></li>' for d in docs)
    (target/'index.html').write_text('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>独立章节目录 · 中美双栖人生指南</title><link rel="stylesheet" href="../style.css"></head><body class="static-page"><header><a href="../">中美双栖人生指南</a></header><main><h1>独立章节目录</h1><p>各章可直接阅读，无需 JavaScript。收藏、勾选与备份请使用互动阅读入口。</p><ul>'+links+'</ul></main></body></html>')
