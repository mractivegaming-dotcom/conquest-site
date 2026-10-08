#!/usr/bin/env python3
"""Assemble the static site into dist/: inject nav + footer partials, mark the active nav link, copy assets."""
import re, shutil, pathlib, subprocess, time
ROOT=pathlib.Path(__file__).parent; DIST=ROOT/'dist'
nav=(ROOT/'_nav.html').read_text(); foot=(ROOT/'_foot.html').read_text()
ACTIVE={'home':'home','ranks':'ranks','arsenal':'arsenal'}
DIST.mkdir(exist_ok=True)
try: VER=subprocess.check_output(['git','rev-parse','--short','HEAD'],cwd=ROOT,text=True).strip()
except Exception: VER=str(int(time.time()))
def bust(html):
    # append ?v=<commit> to local css/js references so browsers never keep a stale script after a deploy
    return re.sub(r'((?:href|src)=")((?!https?://|//)[^"?#]+\.(?:css|js))(")', lambda m: f'{m.group(1)}{m.group(2)}?v={VER}{m.group(3)}', html)
for d in ['img','fonts','b','c']:
    if (DIST/d).exists(): shutil.rmtree(DIST/d)
    shutil.copytree(ROOT/d, DIST/d)
for f in list(ROOT.glob('*.css'))+list(ROOT.glob('*.js')): shutil.copy(f, DIST/f.name)
for page in ROOT.glob('*.html'):
    if page.name.startswith('_'): continue
    html=page.read_text()
    key=re.search(r'data-page="(\w+)"',html).group(1)
    n=nav.replace(f'data-nav="{ACTIVE.get(key,key)}"', f'class="on" data-nav="{ACTIVE.get(key,key)}"')
    if key=='home': n=n.replace('<div class="navbar">','<div class="navbar off">')
    html=html.replace('<!--#nav-->',n).replace('<!--#foot-->',foot)
    (DIST/page.name).write_text(bust(html)); print('built',page.name,len(html))
for sub in ['b','c']:
    for page in (DIST/sub).glob('*.html'):
        page.write_text(bust(page.read_text())); print('busted',sub+'/'+page.name)
print('asset version',VER)
