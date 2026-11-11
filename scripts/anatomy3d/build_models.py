import json, re, struct, numpy as np, trimesh, fast_simplification as fs, sys
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'static', 'anatomy3d') + os.sep
# (regex on English name, key)   order matters
ORAL_MAP = [
 (r'^thyroid cartilage$','thyroid_cart'),(r'^cricoid cartilage$','cricoid_cart'),(r'arytenoid cartilage','arytenoid_cart'),
 (r'corniculate cartilage','corniculate_cart'),(r'cuneiform cartilage','cuneiform_cart'),(r'^epiglottis$','epiglottis'),
 (r'^hyoid bone$','hyoid'),(r'vocal ligament','vocal_lig'),(r'vocalis','vocalis'),(r'thyro-arytenoid proper',None),(r'thyro-arytenoid$','thyroarytenoid'),
 (r'thyro-arytenoid proper',None),(r'posterior crico-arytenoid','pca'),(r'lateral crico-arytenoid','lca'),(r'transverse arytenoid','ia'),(r'oblique arytenoid','ia'),
 (r'aryepiglotticus','aryepiglotticus'),(r'cricothyroid$','cricothyroid'),(r'median cricothyroid ligament','cricothyroid_lig'),
 (r'thyrohyoid membrane','thyrohyoid_mem'),(r'thyrohyoid ligament','thyrohyoid_mem'),(r'hyo-epiglottic','epiglottic_lig'),(r'thyro-epiglottic','epiglottic_lig'),
 (r'superior pharyngeal constrictor','spc'),(r'middle pharyngeal constrictor','mpc'),(r'inferior pharyngeal constrictor','ipc'),
 (r'pharyngeal raphe','pharyngeal_raphe'),(r'stylopharyngeus','stylopharyngeus'),(r'salpingopharyngeus','salpingopharyngeus'),(r'palatopharyngeus','palatopharyngeus'),
 (r'levator veli palatini','lvp'),(r'tensor veli palatini','tvp'),(r'uvular muscle','uvulae'),
 (r'genioglossus','genioglossus'),(r'hyoglossus','hyoglossus'),(r'^tongue$','tongue'),
 (r'digastric','digastric'),(r'mylohyoid$','mylohyoid'),(r'geniohyoid','geniohyoid'),(r'stylohyoid$','stylohyoid'),
 (r'sternohyoid','sternohyoid'),(r'sternothyroid','sternothyroid'),(r'thyrohyoid$','thyrohyoid'),(r'omohyoid','omohyoid'),
 (r'stylohyoid ligament','stylohyoid_lig'),(r'stylomandibular','stylomandibular_lig'),
 (r'incisor','incisor'),(r'canine','canine'),(r'premolar','premolar'),(r'molar','molar'),(r'gingiva','gingiva'),(r'^lip$','lip'),
 (r'^mandible$','mandible'),(r'maxilla$','maxilla'),(r'palatine bone','palatine'),(r'sphenoid','sphenoid'),(r'vomer','vomer'),
 (r'perpendicular plate','ethmoid'),(r'^ethmoid$',None),(r'nasal concha','concha'),(r'nasal bone','nasal_bone'),(r'lateral nasal cartilage','nasal_cart'),
 (r'temporal bone','temporal_bone'),(r'zygomatic bone','zygomatic'),(r'occipital bone','occipital'),
 (r'^atlas$','cervical'),(r'^axis$','cervical'),(r'cervical vertebra','cervical'),(r'intervertebral disk','disc'),
 (r'^trachea$','trachea'),(r'^esophagus$','esophagus'),
 (r'recurrent laryngeal','rln'),(r'vagus','vagus'),(r'hypoglossal','hypoglossal'),(r'mylohyoid nerve',None),(r'glossopharyngeal',None),
]
AUD_MAP = [
 (r'^external ear$','pinna'),(r'temporal bone','temporal_bone'),(r'vestibulocochlear','cn8'),(r'facial nerve','facial_nerve'),
 (r'^pons$','pons'),(r'medulla','medulla'),(r'^cerebellum$','cerebellum'),(r'brachium of .* inferior colliculus','bic'),(r'inferior colliculus','ic'),
 (r'brachium of .* superior colliculus',None),(r'superior colliculus','sc'),(r'medial geniculate','mgb'),(r'thalamus','thalamus'),
 (r'anterior part of .* superior temporal','stg_ant'),(r'posterior part of .* superior temporal','stg_post'),(r'superior temporal gyrus',None),
 (r'corpus callosum','corpus_callosum'),(r'insula',None),
]
def keyof(name, MAP):
    for pat,k in MAP:
        if re.search(pat,name,re.I): return k
    return 'UNMAPPED'
def side(name, verts):
    if re.match(r'(left|.* of left)',name,re.I) or ' left ' in name.lower(): return 'L'
    if re.match(r'(right|.* of right)',name,re.I) or ' right ' in name.lower(): return 'R'
    cx=verts[:,0].mean()
    return 'M' if abs(cx)<4 else ('L' if cx>0 else 'R')
def load(fj):
    m=trimesh.load(f'raw/{fj}.obj',process=True,force='mesh')
    return m
def decimate(m, ratio_fn):
    f=len(m.faces); tgt=int(ratio_fn(f))
    if tgt>=f: return m.vertices, m.faces
    v,fa=fs.simplify(m.vertices.astype(np.float32), m.faces.astype(np.int32), target_reduction=1-tgt/f)
    return v,fa
def build(sysname, items, MAP, extra_rows, ratio_fn, center=None):
    nodes=[]
    for fj,name in items+extra_rows:
        k=keyof(name,MAP)
        if k is None: continue
        if k=='UNMAPPED': print('UNMAPPED',name); continue
        m=load(fj)
        parts=[m]
        if k=='pinna':
            parts=[trimesh.util.concatenate([p for p in m.split(only_watertight=False) if (p.centroid[0]<0)==want]) for want in (True,False)]
        for p in parts:
            v,f=decimate(p,ratio_fn)
            # BP3D (x,y,z) mm -> three (x, z, -y)
            V=np.stack([v[:,0], v[:,2], -v[:,1]],1)
            s=side(name if k!='pinna' else ('Right' if V[:,0].mean()<0 else 'Left')+' ear', V)
            nodes.append(dict(key=k, side=s, name=name, fj=fj, V=V, F=f))
    allV=np.concatenate([n['V'] for n in nodes])
    if center is None: center=(allV.min(0)+allV.max(0))/2
    hdr=[]; blobs=[]; off=0
    for n in nodes:
        V=n['V']-center; mn=V.min(0); mx=V.max(0); rng=np.maximum(mx-mn,1e-6)
        q=np.round((V-mn)/rng*65535-32768).clip(-32768,32767).astype('<i2').tobytes()
        F=n['F'].astype('<u2' if len(V)<65536 else '<u4')
        idx=F.tobytes()
        pad=lambda b: b+b'\0'*((-len(b))%4)
        qb=pad(q); ib=pad(idx)
        hdr.append(dict(key=n['key'],side=n['side'],name=n['name'],fj=n['fj'],min=mn.round(4).tolist(),max=mx.round(4).tolist(),
                        vOff=off,vCount=len(V),iOff=off+len(qb),iCount=F.size,i32=F.dtype.itemsize==4))
        blobs.append(qb+ib); off+=len(qb)+len(ib)
    H=json.dumps(dict(center=center.round(3).tolist(),nodes=hdr),ensure_ascii=False).encode()
    H+=b' '*((-len(H))%4)
    data=struct.pack('<I',len(H))+H+b''.join(blobs)
    open(OUT+sysname+'.bin','wb').write(data)
    print(sysname, len(nodes), 'nodes', sum(len(n['F']) for n in nodes),'tris', len(data)//1024,'KB', 'center',center.round(1))
    return center
s=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'selection.json')))
aud=[(x[0],x[3]) for x in s['aud']]+[('FJ1822','Pons'),('FJ1830','Cerebellum'),('FJ1831','Medulla oblongata')]
oral=[(x[0],x[3]) for x in s['oral']]
build('auditory', aud, AUD_MAP, [], lambda f: min(f, 700+0.2*f))
build('oral', oral, ORAL_MAP, [], lambda f: min(f, 500+0.12*f))
