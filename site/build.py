#!/usr/bin/env python3
"""Assemble the static site into dist/: inject nav + footer partials, mark the active nav link, copy assets."""
import re, shutil, pathlib
ROOT=pathlib.Path(__file__).parent; DIST=ROOT/'dist'
nav=(ROOT/'_nav.html').read_text(); foot=(ROOT/'_foot.html').read_text()
ACTIVE={'home':'home','ranks':'ranks','arsenal':'arsenal'}
DIST.mkdir(exist_ok=True)
for d in ['img','fonts','b']:
    if (DIST/d).exists(): shutil.rmtree(DIST/d)
    shutil.copytree(ROOT/d, DIST/d)
for f in list(ROOT.glob('*.css'))+list(ROOT.glob('*.js')): shutil.copy(f, DIST/f.name)
for page in ROOT.glob('*.html'):
    if page.name.startswith('_'): continue
    html=page.read_text()
    key=re.search(r'data-page="(\w+)"',html).group(1)
    n=nav.replace(f'data-nav="{ACTIVE.get(key,key)}"', f'class="on" data-nav="{ACTIVE.get(key,key)}"')
    html=html.replace('<!--#nav-->',n).replace('<!--#foot-->',foot)
    (DIST/page.name).write_text(html); print('built',page.name,len(html))
