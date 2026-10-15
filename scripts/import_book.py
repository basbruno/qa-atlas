"""Rebuild the supplied book index. Usage: python scripts/import_book.py source.pdf
Requires PyMuPDF (generation only; the web app does not need Python).
"""
from pathlib import Path
import fitz, json, re, collections, shutil, hashlib, sys
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
doc=fitz.open(source)
def write(path,data):
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
pages=[]
for n,p in enumerate(doc,1):
 blocks=[]
 for b in p.get_text('dict')['blocks']:
  if 'lines' not in b: continue
  for line in b['lines']:
   spans=[s for s in line['spans'] if not (s['font']=='Helvetica' and s['size']==8 and s['bbox'][1]>800)]
   if not spans: continue
   value=''.join('•' if 'ZapfDingbats' in s['font'] else s['text'] for s in spans)
   kind='code' if all('Courier' in s['font'] for s in spans) else 'heading' if any(s['size']>=14 for s in spans) else 'text'
   if blocks and blocks[-1]['kind']==kind:
    blocks[-1]['text']+='\n'+value
   else: blocks.append({'kind':kind,'text':value})
 text='\n'.join(b['text'] for b in blocks)
 pages.append({'page':n,'text':text,'blocks':blocks})
sections=[
 ('inicio','Apresentação e sumário',1,6,[1]),
 ('medo','01 · O medo da automação',7,10,[1,22]),
 ('fundamentos','02 · Fundamentos de automação',11,14,[1,2]),
 ('web','03 · Automação web',15,21,[6,7,18]),
 ('api','04 · API testing',22,26,[4,5,9,18]),
 ('sql','05 · SQL para QA',27,29,[3,17]),
 ('ia','06 · IA aplicada à automação',30,32,[12,13]),
 ('praticas','07 · Boas práticas de automação',33,35,[8,10]),
 ('ci','08 · CI/CD',36,38,[11]),
 ('mobile','09 · Mobile testing',39,41,[19]),
 ('robot','10 · Robot Framework',42,43,[20]),
 ('bdd','11 · BDD',44,45,[14,15,20]),
 ('ferramentas','12 · Outras ferramentas',46,48,[18,21]),
 ('carreira','13 · Carreira em automação',49,52,[16,22]),
 ('bonus','Apresentação dos bônus',53,53,[17]),
 ('exweb','Bônus · Exercícios web',54,111,[6,7,8,10,18]),
 ('exapi','Bônus · Exercícios de API',112,179,[4,5,9,18]),
 ('exsql','Bônus · Exercícios SQL',180,197,[17]),
 ('exmobile','Bônus · Exercícios mobile',198,238,[19]),
 ('prompts','Bônus · 50 prompts para IA',239,249,[12,13,22]),
 ('checklist','Bônus · Checklist profissional',250,251,[16,22]),
 ('glossario','Bônus · Glossário',252,256,[1,22]),
]
chapters=[dict(id=i,title=t,start=s,end=e,weeks=w) for i,t,s,e,w in sections]
items=[]; audits=[]
for topic,start,end,expected in [('Web',54,111,100),('API',112,179,100),('SQL',180,197,50),('Mobile',198,238,50),('IA',239,249,50)]:
 # A page boundary marker allows continued solutions/prompts to be preserved.
 stream=''; positions=[]
 for p in pages[start-1:end]:
  positions.append((len(stream),p['page']))
  stream+=p['text']+'\n'
 matches=list(re.finditer(r'^\s*#(\d{2,3})\s*$',stream,re.M))
 counts=collections.Counter(int(m[1]) for m in matches)
 def pageno(pos):return max(p for offset,p in positions if offset<=pos)
 for idx,m in enumerate(matches):
  stop=matches[idx+1].start() if idx+1<len(matches) else len(stream)
  body=stream[m.end():stop].strip()
  body=re.sub(r'\nPROMPT\s*$','',body).strip()
  lines=body.splitlines()
  lev=next((v.strip() for v in lines[:5] if v.strip() in ['Júnior','Pleno','Sênior']),None)
  if lev:
   at=lines.index(lev); title=' '.join(lines[:at]); solution='\n'.join(lines[at+1:]).strip()
  else:title=lines[0];solution='\n'.join(lines[1:]).strip()
  p=pageno(m.start()); ep=pageno(stop-1)
  items.append({'id':f"book-{topic.lower()}-{int(m[1]):03d}-p{p}",'number':int(m[1]),'title':title,'topic':topic,'level':{'Júnior':'Básico','Pleno':'Intermediário','Sênior':'Avançado'}.get(lev,'Todos os níveis'),'originalLevel':lev or 'Prompt','kind':'prompt' if topic=='IA' else 'exercise','page':p,'endPage':ep,'body':solution,'duplicate':counts[int(m[1])]>1})
 audits.append({'topic':topic,'announced':expected,'entries':len(matches),'uniqueNumbers':len(counts),'duplicates':{str(k):v for k,v in counts.items() if v>1},'missing':[i for i in range(1,expected+1) if i not in counts]})
# Checklist rows and glossary terms are identified by font and horizontal position,
# preserving the actual supplied document rather than the cover's advertised counts.
checklist=[]; group=''; last=None
for n in [250,251]:
 for b in doc[n-1].get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   for s in l['spans']:
    t=s['text'].strip()
    if not t or 'Dingbats' in s['font']:continue
    if s['font']=='Helvetica-Bold' and 10<=s['size']<=13:group=t
    if s['font']=='Helvetica' and s['size']==9.0 and 85<s['bbox'][0]<100:
     checklist.append({'id':f'book-check-{len(checklist)+1:02d}','group':group,'text':t,'page':n})
glossary=[]; current=None
for n in range(252,257):
 for b in doc[n-1].get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   for s in l['spans']:
    t=s['text'].strip()
    if s['font']=='Helvetica-Bold' and s['size']==9.5 and s['bbox'][0]<160:
     if current and not current['definition']:current['term']+=' '+t
     else:
      current={'term':t,'definition':'','page':n};glossary.append(current)
    elif current and s['font']=='Helvetica' and s['size']==9.0 and s['bbox'][0]>160:
     current['definition']+=((' ' if current['definition'] else '')+t)
write(root/'public/leitura/book-pages.json',pages)
write(root/'public/leitura/book-activities.json',items)
index={'title':'Perca o Medo da Automação','subtitle':'Edição completa com bônus','author':'Lilian Borba · QA Insider','pageCount':len(pages),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'chapters':chapters,'items':[{k:v for k,v in x.items() if k!='body'} for x in items],'audit':audits,'checklist':checklist,'glossary':glossary}
write(root/'src/book-index.json',index)
destination=root/'public/leitura/perca-o-medo-da-automacao.pdf'
if source.resolve()!=destination.resolve():shutil.copyfile(source,destination)
print(json.dumps({'pages':len(pages),'activities':len(items),'audit':audits,'checklist':len(checklist),'glossary':len(glossary)},ensure_ascii=False))
