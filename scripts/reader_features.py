"""Build stable identities and deliberately curated updates, never from commit dates."""
import json, re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlencode
from xml.etree import ElementTree as ET
from email.utils import format_datetime

BASE = 'https://gjimzhou.github.io/US-China-Life-Playbook/'

def https_url(value):
    p = urlsplit(value)
    return p.scheme == 'https' and bool(p.hostname) and not p.username and not p.password

def validate_services(c):
    assert set(c) == {'analytics', 'comments', 'newsletter'}
    a, w, n = (c[k] for k in ('analytics','comments','newsletter'))
    if a['enabled']:
        assert re.fullmatch(r'[0-9a-fA-F-]{36}', a['websiteId']), 'Supply a public Umami Website ID'
        assert https_url(a['scriptUrl'])
    if w['enabled']:
        assert https_url(w['serverUrl']) and w['moderationConfirmed'], 'Confirm server moderation before enabling'
    if n['enabled']:
        assert https_url(n['formUrl']) and n['doubleOptInVerified'] and n['unsubscribeVerified'], 'Verify opt-in and unsubscribe before enabling'

def attach_ids(docs, catalog):
    used = set()
    for path, entry in catalog.items():
        for value in [entry['id'], *entry['sections'].values()]:
            assert re.fullmatch(r'[ds]-[a-f0-9]{12}', value) and value not in used, f'Duplicate/invalid stable ID: {value}'
            used.add(value)
    for doc in docs:
        assert doc['path'] in catalog, f"Assign permanent IDs in site/content-ids.json: {doc['path']}"
        e = catalog[doc['path']]
        doc.update(contentId=e['id'], category=e['category'], previousPaths=e['previousPaths'])
        for s in doc['sections']:
            matches = {e['sections'][a] for a in [s['id'], *s['aliases']] if a in e['sections']}
            assert len(matches) == 1, f"Assign/preserve section ID: {doc['path']}#{s['id']}"
            s['contentId'] = matches.pop()
        assert len({s['contentId'] for s in doc['sections']}) == len(doc['sections']), 'Ambiguous section ID'


def build_updates(root, out, docs):
    entries = json.loads((root/'updates/entries.json').read_text())
    by_id = {d['contentId']: d for d in docs}
    seen = set()
    for e in entries:
        assert re.fullmatch(r'[a-z0-9-]+', e['id']) and e['id'] not in seen
        seen.add(e['id'])
        stamp = datetime.fromisoformat(e['published'])
        assert stamp.tzinfo and stamp <= datetime.now(timezone.utc), 'Update must have a real, non-future publication timestamp'
        assert e['kind'] in ('new', 'important-revision')
        assert e['contentId'] in by_id
        e['url'] = BASE+'#'+urlencode({'content':e['contentId']})
    entries.sort(key=lambda e:e['published'], reverse=True)
    assert entries, 'RSS needs at least one curated update'
    feed = ET.Element('rss', {'version':'2.0', 'xmlns:atom':'http://www.w3.org/2005/Atom'})
    channel = ET.SubElement(feed, 'channel')
    for tag, text in [('title','中美双栖人生指南 · 更新'),('link',BASE),('description','新内容与重要修订；不推送普通小修或代码提交。'),('language','zh-CN')]:
        ET.SubElement(channel,tag).text=text
    ET.SubElement(channel,'atom:link',{'href':BASE+'feed.xml','rel':'self','type':'application/rss+xml'})
    ET.SubElement(channel,'lastBuildDate').text=format_datetime(datetime.fromisoformat(entries[0]['published']))
    for e in entries:
        item=ET.SubElement(channel,'item')
        for tag,text in [('title',e['title']),('link',e['url']),('description',e['summary']),('pubDate',format_datetime(datetime.fromisoformat(e['published'])))]:
            ET.SubElement(item,tag).text=text
        ET.SubElement(item,'guid',{'isPermaLink':'false'}).text='urn:us-china-life-playbook:update:'+e['id']
    ET.indent(feed)
    ET.ElementTree(feed).write(out/'feed.xml',encoding='utf-8',xml_declaration=True)
    (out/'updates.json').write_text(json.dumps(entries,ensure_ascii=False))
