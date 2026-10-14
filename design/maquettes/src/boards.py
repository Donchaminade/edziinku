from common import *
import glob,subprocess
from PIL import Image
CSS='''*{margin:0;box-sizing:border-box}body{font-family:'Work Sans';color:#EAF6FF;background:radial-gradient(90% 60% at 80% 0%,#0E3470,#061433 50%,#030B1E);padding:90px 100px;width:@W@px}
.h{display:flex;align-items:center;gap:22px;margin-bottom:60px}.h h1{font:600 64px Sora;letter-spacing:-.03em}.h p{font-size:24px;color:#8FA6C8;margin-top:6px}.h .n{margin-left:auto;font:600 20px Sora;color:#5CE1F2;letter-spacing:.2em}
.g{display:flex;flex-wrap:wrap;gap:56px 48px;align-items:flex-start}.it{display:flex;flex-direction:column;gap:18px}.cap{font:600 21px Sora}.cap span{display:block;font:400 16px 'Work Sans';color:#8FA6C8;margin-top:4px}
.ph{width:414px;padding:12px;border-radius:62px;background:linear-gradient(145deg,#3b414d,#15181f);box-shadow:inset 0 0 0 2px #4a5160,0 40px 70px -30px rgba(0,0,0,.8)}.ph img{width:390px;height:844px;border-radius:50px;display:block}
.br{border-radius:16px;overflow:hidden;background:#1b1f27;box-shadow:0 0 0 1px #2c3240,0 40px 80px -30px rgba(0,0,0,.8)}.br .bar{height:40px;display:flex;align-items:center;gap:8px;padding:0 16px}.br .bar i{width:12px;height:12px;border-radius:50%;background:#3a404c}.br .bar u{margin-left:20px;flex:0 0 420px;height:24px;border-radius:8px;background:#2a2f3a;text-decoration:none;font-size:13px;color:#9aa6b8;display:flex;align-items:center;padding-left:12px}
.br img{display:block;width:@D@px}
.foot{margin-top:70px;color:#5a7091;font-size:16px;display:flex;justify-content:space-between}'''
def board(name,title,sub,num,items,W,dw=1000):
    b=''.join(it for it in items)
    html=f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS.replace('@W@',str(W)).replace('@D@',str(dw))}</style></head><body><div class="h">{logo(84)}<div><h1>{title}</h1><p>{sub}</p></div><div class="n">{num}</div></div><div class="g">{b}</div><div class="foot"><span>Edzii-Nku · l’œil de la pluie · maquettes UI haute fidélité</span><span>Données de démonstration · carte © contributeurs OpenStreetMap</span></div></body></html>'
    hp=f'{ROOT}/src/html/board_{name}.html';open(hp,'w').write(html)
    out=f'{ROOT}/boards/{name}.png'
    subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1',f'--window-size={W},6000',f'--screenshot={out}','file://'+hp],capture_output=True)
    im=Image.open(out).convert('RGB');px=im.load()
    # crop bottom: find last row not equal to bg bottom
    from PIL import ImageChops
    # measure via JS-free approach: crop at content height computed by tallest non-bg
    return out
def phone(f,cap,d=''): return f'<div class="it"><div class="ph"><img src="{f}"></div><div class="cap">{cap}<span>{d}</span></div></div>'
def browser(f,cap,url,d=''): return f'<div class="it"><div class="br"><div class="bar"><i></i><i></i><i></i><u>🔒 {url}</u></div><img src="{f}"></div><div class="cap">{cap}<span>{d}</span></div></div>'
S=f'{ROOT}/screens/'
web=[browser(S+'web/01_accueil@2x.png','Accueil','edzii-nku.tg','Promesse, appels à l’action, aperçu de la carte'),browser(S+'web/02_carte_en_direct@2x.png','Carte en direct','edzii-nku.tg/carte','Signalements citoyens sur la carte OSM de Lomé'),browser(S+'web/03_signaler@2x.png','Formulaire de signalement','edzii-nku.tg/signaler','Photo, géolocalisation, niveau d’eau, commentaire'),
browser(S+'web/04_tableau_de_bord@2x.png','Tableau de bord mairie et protection civile','pro.edzii-nku.tg','Indicateurs, carte, bassins prioritaires, prévision de pluie'),browser(S+'web/05_moderation_historique@2x.png','Modération et historique','pro.edzii-nku.tg/signalements','Filtres, validation, journal des actions'),
phone(S+'mobile-web/01_accueil@2x.png','Accueil · web mobile','390 px'),phone(S+'mobile-web/02_carte@2x.png','Carte · web mobile','390 px'),phone(S+'mobile-web/03_signaler@2x.png','Signaler · web mobile','390 px')]
caps={'01_onboarding_bienvenue':'Bienvenue et langue','02_onboarding_quartiers':'Abonnement aux quartiers','03_onboarding_canaux':'Canaux d’alerte','04_alertes':'Liste des alertes','05_alerte_detail':'Détail d’une alerte','06_carte':'Carte','07_signaler_1_photo':'Signaler · 1 Photo','08_signaler_2_position':'Signaler · 2 Position','09_signaler_3_niveau':'Signaler · 3 Niveau','10_signaler_confirmation':'Confirmation','11_profil':'Profil et réglages','12_alertes_clair':'Alertes · thème clair','13_profil_clair':'Profil · thème clair'}
app=[phone(f,caps[os.path.basename(f)[:-7]]) for f in sorted(glob.glob(S+'app/*.png'))]
wac={'01_inscription_quartier':('Abonnement à un quartier','Choix de langue puis du quartier'),'02_alerte_francais':('Alerte pluie en français','Consignes et réponses rapides'),'03_alerte_ewe':('La même alerte en éwé','À faire vérifier par un locuteur natif'),'04_signalement_photo':('Signalement photo','Photo, position, niveau, confirmation')}
wa=[phone(f,*wac[os.path.basename(f)[:-7]]) for f in sorted(glob.glob(S+'whatsapp/*.png'))]
outs=[]
outs.append(board('1_web_pwa','Application web (PWA)','Desktop 1440 px et web mobile 390 px','01 / 03',web[:5]+['<div class="it" style="flex-direction:row;gap:48px">'+''.join(web[5:])+'</div>'],3260,dw=1500))
outs.append(board('2_app_mobile','Application mobile','iOS 390 × 844 · thème sombre (et clair)','02 / 03',app,3400))
outs.append(board('3_whatsapp','Bot WhatsApp','Abonnement, alertes FR / éwé, signalement','03 / 03',wa,2140))
pages=[]
for o in outs:
    im=Image.open(o).convert('RGB')
    # trim trailing uniform bottom
    import numpy as np
    a=np.asarray(im).astype(int).sum(axis=2);d=np.abs(np.diff(a,axis=1)).max(axis=1)
    last=int(np.nonzero(d>60)[0][-1])+80
    im=im.crop((0,0,im.width,min(im.height,last)));im.save(o);pages.append(im);print(o,im.size)
pages[0].save(f'{ROOT}/Edzii-Nku_maquettes_UI.pdf',save_all=True,append_images=pages[1:],resolution=150,quality=92)
