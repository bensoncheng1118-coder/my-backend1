import os
import json,urllib.parse,urllib.request,os,concurrent.futures as cf
s=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'selection.json')))
items=[x for k in s for x in s[k]]
def get(x):
    fj,bp,fma,name=x; fn=f"{fj}_{bp}_{fma}_{name}.obj"; p='raw/'+fj+'.obj'
    if os.path.exists(p) and os.path.getsize(p)>1000: return
    u="https://media.githubusercontent.com/media/olivercase/body_parts_3d_api/main/meshes/"+urllib.parse.quote(fn)
    for i in range(3):
        try:
            d=urllib.request.urlopen(u,timeout=60).read(); open(p,'wb').write(d); return
        except Exception as e: err=e
    print('FAIL',fn,err)
with cf.ThreadPoolExecutor(8) as ex: list(ex.map(get,items))
print(len(os.listdir('raw')))
