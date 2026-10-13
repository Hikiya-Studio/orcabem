"""Gera as imagens de prévia (1200x630) que aparecem quando o link é compartilhado no WhatsApp/Facebook.
Uso: python3 _ferramentas/gerar-previas.py   (na raiz do repositório; precisa de playwright e Pillow)
Para uma calculadora nova, acrescente uma linha em `cards` e rode de novo. A pasta _ferramentas não é publicada no site."""
import os, tempfile, urllib.request
import asyncio, sys
from playwright.async_api import async_playwright
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S=tempfile.mkdtemp(); os.makedirs(S+'/fontes')
for nome,url in [('Archivo','archivo/Archivo%5Bwdth,wght%5D.ttf'),('Figtree','figtree/Figtree%5Bwght%5D.ttf')]:
    urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/'+url,S+f'/fontes/{nome}.ttf')
logo=open(R+'/favicon.svg').read()
import base64
A=base64.b64encode(open(S+'/fontes/Archivo.ttf','rb').read()).decode()
F=base64.b64encode(open(S+'/fontes/Figtree.ttf','rb').read()).decode()
cards=[
 ('home','Para autônomos','Orçamento pronto, cliente fechado','Calculadoras grátis para pintor, diarista e eletricista. Sem cadastro.',None,None),
 ('pintura','Para pintores','Orçamento de pintura','Área de parede, tinta e mão de obra. Pronto para mandar no WhatsApp.','Total do orçamento','R$ 3.365,00'),
 ('diarista','Para diaristas','Quanto cobrar de diária','Pelo tamanho da casa, tipo de faxina e extras. Pronto para o WhatsApp.','Diária sugerida','R$ 160,00'),
 ('eletricista','Para eletricistas','Orçamento de eletricista','Pontos, chuveiro, disjuntores e mão de obra. Pronto para o WhatsApp.','Total do orçamento','R$ 810,00'),
]
CSS=f"""
@font-face{{font-family:Archivo;src:url(data:font/ttf;base64,{A})}}
@font-face{{font-family:Figtree;src:url(data:font/ttf;base64,{F})}}
html,body{{margin:0;width:1200px;height:630px;background:#f3f1ec;color:#1d2433;overflow:hidden}}
.wrap{{box-sizing:border-box;width:1200px;height:630px;padding:64px 72px;display:grid;grid-template-columns:1fr auto;gap:56px;align-items:center;position:relative}}
.brand{{position:absolute;top:56px;left:72px;display:flex;align-items:center;gap:16px;font-family:Archivo;font-weight:800;font-size:40px;letter-spacing:-.01em}}
.brand svg{{width:60px;height:60px}} .brand b{{color:#1f4fa3;font-weight:800}}
.txt{{padding-top:70px}}
.eyebrow{{font-family:Archivo;font-weight:700;font-size:24px;letter-spacing:.12em;text-transform:uppercase;color:#1f4fa3}}
h1{{font-family:Archivo;font-weight:800;font-size:76px;line-height:1.02;margin:12px 0 20px;letter-spacing:-.015em}}
p{{font-family:Figtree;font-size:30px;line-height:1.35;color:#5d6475;margin:0;max-width:640px}}
.ticket{{position:relative;margin-top:70px;background:#fffdf8;border:2px solid #d9d4c7;border-radius:6px;padding:52px 36px 30px;width:330px;transform:rotate(1.5deg);box-shadow:0 10px 30px rgba(29,36,51,.08)}}
.tape{{position:absolute;top:-22px;left:30px;background:#e7c873;color:#3a2f12;font-family:Archivo;font-weight:700;font-size:20px;letter-spacing:.14em;padding:9px 22px;transform:rotate(-3deg)}}
.lbl{{font-family:Archivo;font-weight:700;font-size:24px}}
.val{{font-family:Archivo;font-weight:800;font-size:56px;color:#1f4fa3;margin-top:6px;white-space:nowrap}}
.line{{height:14px;border-radius:7px;background:#ece8de;margin:0 0 16px}}
.zap{{display:inline-block;margin-top:22px;background:#1f8f4e;color:#fff;font-family:Figtree;font-weight:700;font-size:22px;border-radius:10px;padding:12px 18px}}
.bar{{position:absolute;left:0;right:0;bottom:0;height:14px;background:#1f4fa3}}
"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':630})
    for nome,eb,t,sub,lbl,val in cards:
      tk='' if not val else f'<div class="ticket"><div class="tape">RESULTADO</div><div class="line" style="width:85%"></div><div class="line" style="width:65%"></div><div class="line" style="width:75%"></div><div class="lbl">{lbl}</div><div class="val">{val}</div><div class="zap">Enviar no WhatsApp</div></div>'
      if not val:
        tk='<div class="ticket"><div class="tape">GRÁTIS</div><div class="line" style="width:85%"></div><div class="line" style="width:65%"></div><div class="line" style="width:75%"></div><div class="lbl">Sem cadastro</div><div class="val" style="font-size:44px">No celular</div><div class="zap">Enviar no WhatsApp</div></div>'
      html=f'<html><head><style>{CSS}</style></head><body><div class="wrap"><div class="brand">{logo}<span>orça<b>bem</b></span></div><div class="txt"><div class="eyebrow">{eb}</div><h1>{t}</h1><p>{sub}</p></div>{tk}</div><div class="bar"></div></body></html>'
      await pg.set_content(html); await pg.wait_for_timeout(300)
      await pg.evaluate('document.fonts.ready')
      await pg.screenshot(path=f'{S}/{nome}.png')
      Image.open(f'{S}/{nome}.png').convert('RGB').save(f'{R}/assets/previa-{nome}.jpg',quality=86,optimize=True)
    await b.close()
asyncio.run(main())
