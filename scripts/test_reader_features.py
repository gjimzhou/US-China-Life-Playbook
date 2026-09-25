import copy, json, tempfile, unittest
from pathlib import Path
from xml.etree import ElementTree as ET
from reader_features import attach_ids, build_updates, validate_services
ROOT=Path(__file__).resolve().parents[1]

class ReaderFeatures(unittest.TestCase):
    def test_ids_survive_title_order_and_alias_change(self):
        cat={'renamed.md':{'id':'d-111111111111','category':'book','previousPaths':['old.md'],'sections':{'old-heading':'s-111111111111','two':'s-222222222222'}}}
        docs=[{'path':'renamed.md','title':'New title','sections':[{'id':'two','aliases':[]},{'id':'new-heading','aliases':['old-heading']}]}]
        attach_ids(docs,cat)
        self.assertEqual(docs[0]['sections'][1]['contentId'],'s-111111111111')
        self.assertEqual(docs[0]['previousPaths'],['old.md'])
        cat['renamed.md']['sections']['two']='s-111111111111'
        with self.assertRaises(AssertionError):attach_ids(docs,cat)

    def test_unassigned_identity_fails_build(self):
        with self.assertRaises(AssertionError):attach_ids([{'path':'new.md'}],{})

    def test_feed_is_valid_and_deterministic(self):
        cat=json.loads((ROOT/'site/content-ids.json').read_text());docs=[{'contentId':d['id']} for d in cat.values()]
        with tempfile.TemporaryDirectory() as d:
            out=Path(d);build_updates(ROOT,out,docs);first=(out/'feed.xml').read_bytes()
            build_updates(ROOT,out,docs);self.assertEqual(first,(out/'feed.xml').read_bytes())
            tree=ET.fromstring(first);items=tree.findall('./channel/item');self.assertTrue(items)
            self.assertEqual(len({i.findtext('guid') for i in items}),len(items))
            for i in items:
                self.assertEqual(i.find('guid').get('isPermaLink'),'false')
                self.assertIn('#content=d-',i.findtext('link'));self.assertTrue(i.findtext('pubDate'))
            self.assertEqual(tree.find('./channel/{http://www.w3.org/2005/Atom}link').get('rel'),'self')

    def test_feed_orders_actual_instants_across_timezones(self):
        entries=[{'id':'early-local','published':'2026-01-01T10:00:00-05:00','kind':'new','contentId':'d-111111111111','title':'later instant','summary':'a'}, {'id':'late-local','published':'2026-01-01T14:00:00+00:00','kind':'new','contentId':'d-111111111111','title':'earlier instant','summary':'b'}]
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'updates').mkdir();(root/'updates/entries.json').write_text(json.dumps(entries))
            build_updates(root,root,[{'contentId':'d-111111111111'}])
            self.assertEqual(ET.parse(root/'feed.xml').findtext('./channel/item/title'),'later instant')

    def test_unverified_services_stay_off(self):
        validate_services(json.loads((ROOT/'site/services.json').read_text()))
        c={'analytics':{'enabled':False,'websiteId':'','scriptUrl':''},'comments':{'enabled':False,'serverUrl':'','moderationConfirmed':False},'newsletter':{'enabled':False,'formUrl':'','doubleOptInVerified':False,'unsubscribeVerified':False}}
        for key in ['analytics','comments','newsletter']:
            bad=copy.deepcopy(c);bad[key]['enabled']=True
            with self.assertRaises(AssertionError):validate_services(bad)

if __name__=='__main__':unittest.main()
