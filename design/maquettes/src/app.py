from common import *
W,H=390,844
X='''
.pad{padding:0 20px}.ttl{font:600 28px Sora;letter-spacing:-.03em;margin:6px 0 4px}
.top{display:flex;align-items:center;justify-content:space-between;padding:6px 20px 12px}.ib{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:var(--card2);border:1px solid var(--line)}
.al{display:flex;gap:12px;padding:14px;margin-bottom:10px;border-radius:20px;background:var(--card);border:1px solid var(--line)}
.al .ico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;flex:none}
.al h4{font-size:15px;margin-bottom:3px}.al p{font-size:13px;color:var(--mut);line-height:1.35}.al .t{font-size:12px;color:var(--mut);white-space:nowrap}
.seg{display:flex;padding:4px;border-radius:14px;background:var(--card2);border:1px solid var(--line);margin:0 20px 16px}.seg div{flex:1;text-align:center;padding:8px;border-radius:10px;font-size:14px;font-weight:600;color:var(--mut)}.seg .on{background:var(--bg2);color:var(--tx);box-shadow:0 2px 8px rgba(0,0,0,.25)}
.steps{display:flex;gap:6px;padding:0 20px;margin:4px 0 18px}.steps i{flex:1;height:4px;border-radius:4px;background:var(--line)}.steps i.on{background:linear-gradient(90deg,#2F86E8,#5CE1F2)}
.cta{position:absolute;left:20px;right:20px;bottom:34px;padding:17px;border-radius:18px;font:600 17px Sora}
.row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--line);font-size:15px}.row:last-child{border:0}.row .ri{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:rgba(92,225,242,.12);color:var(--c)}
.row .v{margin-left:auto;color:var(--mut);font-size:14px;display:flex;align-items:center;gap:4px}
.tog{width:50px;height:30px;border-radius:99px;background:linear-gradient(135deg,#2F86E8,#5CE1F2);position:relative;margin-left:auto}.tog:after{content:'';position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff}
.tog.off{background:var(--line)}.tog.off:after{left:3px;right:auto}
.sec{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:18px 20px 8px;font-weight:600}
'''
def tab(on):
    it=[('bell','Alertes'),('map','Carte'),('plus',''),('clock','Mes signalements'),('user','Profil')]
    return '<div class="tabbar">'+''.join(f'<div class="fab">{ic("plus",26)}</div>' if n=='plus' else f'<div class="{"on" if l==on else ""}">{ic(n,24)}{l.split()[0] if l!="Mes signalements" else "Historique"}</div>' for n,l in it)+'</div>'
S={}
# 1 onboarding welcome + language
S['01_onboarding_bienvenue']=f'''{sb()}<div style="position:absolute;inset:0;overflow:hidden;opacity:.9">
<svg width="390" height="520" viewBox="0 0 390 520" style="position:absolute;top:40px">{''.join(f'<circle cx="195" cy="230" r="{r}" fill="none" stroke="#5CE1F2" stroke-opacity="{.5-r/600:.2f}" stroke-width="{1.5 if r%2 else 1}"/>' for r in range(70,300,38))}</svg></div>
<div style="position:absolute;top:175px;left:0;right:0;display:grid;place-items:center">{logo(170)}</div>
<div class="pad" style="position:absolute;top:430px;left:0;right:0;text-align:center"><h1 style="font-size:36px">Edzii-Nku</h1><p class="mut" style="font-size:13px;letter-spacing:.3em;margin:6px 0 18px">L’ŒIL DE LA PLUIE</p>
<p style="font-size:16px;line-height:1.5;color:#cfe3fb">Prévenir, signaler et agir contre les inondations, quartier par quartier.</p></div>
<div style="position:absolute;left:20px;right:20px;bottom:118px"><div class="lab" style="text-align:center;font-weight:500;font-family:'Work Sans';color:var(--mut)">Choisissez votre langue · Tia wò gbe</div>
<div style="display:flex;gap:10px"><div class="btn" style="flex:1;border-color:var(--c);background:rgba(92,225,242,.14);color:var(--c)">{ic('check',18)} Français</div><div class="btn" style="flex:1">Eʋegbe</div></div></div>
<div class="btn p cta" style="bottom:40px">Commencer</div><div class="home"></div>'''
# 2 onboarding neighbourhood
hoods=[('Bè','Golfe 1',True,'r'),('Agoè-Nyivé','Agoè-Nyivé 1',True,'r'),('Zogbédji','Agoè-Nyivé',False,'a'),('Adakpamé','Golfe 4',False,'a'),('Hédzranawoé','Golfe 2',False,'a'),('Tokoin','Golfe 3',False,'c')]
hl=''.join(f'<div class="al" style="align-items:center;padding:12px 14px;margin-bottom:8px;{"border-color:var(--c);background:rgba(92,225,242,.08)" if on else ""}"><div class="ico" style="width:38px;height:38px;background:var(--card2)">{ic("pin",18)}</div><div style="flex:1"><h4>{n}</h4><p>{c} · <span class="tag {k}" style="padding:2px 8px;font-size:11px">{ {"r":"Risque élevé","a":"À surveiller","c":"Risque modéré"}[k]}</span></p></div><div style="width:26px;height:26px;border-radius:8px;display:grid;place-items:center;{"background:linear-gradient(135deg,#2F86E8,#5CE1F2);color:#03132f" if on else "border:1.5px solid var(--line)"}">{ic("check",16) if on else ""}</div></div>' for n,c,on,k in hoods)
S['02_onboarding_quartiers']=f'''{sb()}<div class="steps" style="margin-top:6px"><i class="on"></i><i class="on"></i><i></i></div><div class="pad"><h2 class="ttl">Vos quartiers</h2><p class="mut" style="font-size:15px;line-height:1.45;margin-bottom:16px">Recevez une alerte quand une forte pluie menace les quartiers que vous suivez.</p>
<div class="inp" style="margin-bottom:12px">{ic('search',18)} Rechercher un quartier</div>
<div class="btn" style="width:100%;margin-bottom:14px;color:var(--c)">{ic('loc',18)} Utiliser ma position</div>{hl}</div>
<div class="btn p cta">Suivre 2 quartiers</div><div class="home"></div>'''
# 3 onboarding channels
S['03_onboarding_canaux']=f'''{sb()}<div class="steps" style="margin-top:6px"><i class="on"></i><i class="on"></i><i class="on"></i></div><div class="pad"><h2 class="ttl">Comment vous prévenir ?</h2><p class="mut" style="font-size:15px;line-height:1.45;margin-bottom:18px">Choisissez un ou plusieurs canaux. Le SMS marche sans internet ni smartphone.</p></div>
<div class="card" style="margin:0 20px">{''.join(f'<div class="row"><div class="ri">{ic(i,18)}</div><div><b style="font-weight:600">{t}</b><div class="mut" style="font-size:13px">{d}</div></div><div class="tog {"" if on else "off"}"></div></div>' for i,t,d,on in [('bell','Notifications','Dans l’application',True),('chat','WhatsApp','+228 •• •• 42 17',True),('sms','SMS','Sans connexion internet',True),('moon','Alertes de nuit','22 h – 6 h',False)])}</div>
<div class="sec">Langue des alertes</div><div class="seg"><div class="on">Français</div><div>Eʋegbe</div><div>Les deux</div></div>
<div class="btn p cta">Terminer</div><div class="home"></div>'''
# 4 alerts list
als=[('r','rain','Forte pluie prévue à Bè','Ce soir 18 h – 23 h · 45–60 mm','16:42',True),('a','pin','Eau signalée au genou','Bè Ahligo · 3 signalements','15:10',True),('c','drain','Curage du bassin Léo 2000','Mairie · intervention prévue jeudi','Hier',False),('g','check','Fin de vigilance à Agoè','La pluie est passée','Hier',False),('a','rain','Averses orageuses','Agoè-Nyivé · demain après-midi','Lun.',False)]
al=''.join(f'<div class="al" style="{"" if new else "opacity:.8"}"><div class="ico {k}">{ic(i,22)}</div><div style="flex:1;min-width:0"><h4>{t}</h4><p>{d}</p></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px"><span class="t">{tm}</span>{"<span class=\"dot\" style=\"background:var(--c)\"></span>" if new else ""}</div></div>' for k,i,t,d,tm,new in als)
def alerts():
    return f'''{sb()}<div class="top"><div><p class="mut" style="font-size:14px">Mercredi 14 octobre</p><h2 class="ttl" style="margin:2px 0 0">Alertes</h2></div><div class="ib">{ic('gear',20)}</div></div>
<div class="pad"><div class="card grad" style="padding:18px;border:0;margin-bottom:16px;position:relative;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center"><span class="tag" style="background:rgba(3,19,47,.15);color:#03132f">● VIGILANCE FORTE PLUIE</span>{ic('rain',26)}</div><h3 style="font-size:21px;margin:12px 0 4px">Bè · ce soir 18 h – 23 h</h3><p style="font-size:14px;color:#06244f">Surélevez vos biens, évitez les caniveaux.</p>
<div style="display:flex;gap:8px;margin-top:14px"><div class="btn" style="flex:1;background:rgba(3,19,47,.88);color:#fff;border:0;padding:10px">Voir le détail</div><div class="btn" style="flex:1;background:rgba(255,255,255,.35);border:0;color:#03132f;padding:10px">En sécurité</div></div></div>
<div style="display:flex;gap:8px;margin-bottom:14px"><span class="chip on">Toutes</span><span class="chip">Bè</span><span class="chip">Agoè-Nyivé</span><span class="chip">Mairie</span></div>{al}</div>{tab('Alertes')}<div class="home"></div>'''
S['04_alertes']=alerts()
# 5 alert detail
hrs=[(18,4),(19,12),(20,22),(21,18),(22,9),(23,3)]
bars=''.join(f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:11px" class="mut">{v}</span><i style="width:100%;height:{v*3.2}px;border-radius:7px 7px 3px 3px;background:linear-gradient(180deg,#7FD8FF,#2F86E8)"></i><span style="font-size:11px" class="mut">{h}h</span></div>' for h,v in hrs)
S['05_alerte_detail']=f'''<div class="mapw" style="position:absolute;top:0;left:0;right:0;height:270px">{MAP(1600,1140,vb=(420,560,760,560),legend=False,font=1.0,grid=False)}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,11,30,.5),transparent 30%,transparent 60%,#030B1E)"></div></div>
<div style="position:relative">{sb()}<div class="top"><div class="ib" style="background:rgba(3,11,30,.7)">{ic('back',20)}</div><div class="ib" style="background:rgba(3,11,30,.7)">{ic('share',20)}</div></div></div>
<div class="pad" style="position:absolute;top:222px;left:0;right:0"><span class="tag r">● Risque élevé</span><h2 class="ttl" style="font-size:26px;margin-top:10px">Forte pluie prévue à Bè</h2><p class="mut" style="font-size:14px">Émise à 16:42 · Source : prévisions Open-Meteo</p>
<div class="card" style="padding:16px;margin-top:16px"><div style="display:flex;justify-content:space-between;margin-bottom:12px"><b class="sora" style="font-size:15px">Pluie prévue (mm/h)</b><span class="mut" style="font-size:13px">Total 45–60 mm</span></div><div style="display:flex;gap:10px;align-items:flex-end;height:100px">{bars}</div></div>
<div class="sec" style="margin:18px 0 8px">Que faire ?</div><div class="card">{''.join(f'<div class="row" style="padding:12px 14px;font-size:14px"><div class="ri">{ic(i,17)}</div>{t}</div>' for i,t in [('up','Surélevez vos biens et documents'),('drain','Évitez les caniveaux et les bassins'),('shield','Urgence : appelez le 170 (numéro vert)')])}</div></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(180deg,transparent,#030B1E 35%)"></div><div style="position:absolute;left:20px;right:20px;bottom:34px;display:flex;gap:10px"><div class="btn" style="flex:1;padding:16px">En sécurité</div><div class="btn p" style="flex:1;padding:16px">{ic('cam',18)} Signaler</div></div>{DEMO.replace('bottom:10px','bottom:100px')}<div class="home"></div>'''
# 6 map
S['06_carte']=f'''<div class="mapw" style="position:absolute;inset:0">{MAP(1600,1140,vb=(330,60,560,1080),legend=False,font=1.0,grid=True)}</div>
<div style="position:relative">{sb()}<div class="pad" style="display:flex;gap:10px"><div class="inp" style="flex:1;background:rgba(3,11,30,.85);backdrop-filter:blur(10px)">{ic('search',18)} Quartier, rue, bassin…</div><div class="ib" style="width:50px;height:50px;background:rgba(3,11,30,.85)">{ic('layers',20)}</div></div>
<div style="display:flex;gap:8px;padding:12px 20px"><span class="chip on" style="background:rgba(3,11,30,.85)">Signalements</span><span class="chip" style="background:rgba(3,11,30,.85)">Zones à risque</span><span class="chip" style="background:rgba(3,11,30,.85)">Bassins</span></div></div>
<div class="ib" style="position:absolute;right:20px;bottom:330px;width:50px;height:50px;background:rgba(3,11,30,.85);color:var(--c)">{ic('loc',22)}</div>
<div class="card" style="position:absolute;left:12px;right:12px;bottom:98px;padding:14px;background:rgba(6,20,51,.94);backdrop-filter:blur(16px)"><div style="width:40px;height:4px;border-radius:4px;background:var(--line);margin:-4px auto 12px"></div>
<div style="display:flex;gap:12px"><div style="width:84px;height:84px;border-radius:14px;background:url(p04.jpg) center/cover;flex:none"></div><div style="flex:1"><div style="display:flex;justify-content:space-between"><span class="tag a">Eau au genou</span><span class="mut" style="font-size:12px">il y a 12 min</span></div><h4 style="font-size:16px;margin:8px 0 3px">Bè Ahligo, près du marché</h4><p class="mut" style="font-size:13px">Caniveau bouché · confirmé par 3 habitants</p></div></div></div>
{tab('Carte')}{DEMO.replace('bottom:10px','bottom:92px')}<div class="home"></div>'''
# report steps
def rhead(n,t):
    return f'''{sb()}<div class="top"><div class="ib">{ic('x',20)}</div><span class="mut" style="font-size:14px;font-weight:600">Étape {n} sur 3</span><div style="width:40px"></div></div><div class="steps">{''.join(f'<i class="{"on" if i<n else ""}"></i>' for i in range(3))}</div><div class="pad"><h2 class="ttl" style="font-size:25px">{t}</h2></div>'''
S['07_signaler_1_photo']=f'''{rhead(1,'Prenez une photo')}<p class="mut pad" style="font-size:15px;margin-bottom:16px">Montrez l’eau et un repère (mur, voiture, poteau) pour estimer le niveau.</p>
<div style="margin:0 20px;height:420px;border-radius:24px;background:url(p01.jpg) center/cover;position:relative;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)">
<div style="position:absolute;inset:18px;border:2px solid rgba(255,255,255,.0)">{''.join(f'<i style="position:absolute;{a}:0;{b}:0;width:28px;height:28px;border-{a}:3px solid #fff;border-{b}:3px solid #fff;border-radius:{"6px" }"></i>' for a in ('top','bottom') for b in ('left','right'))}</div>
<span class="chip" style="position:absolute;left:14px;bottom:14px;background:rgba(3,11,30,.75);border:0;color:#fff">{ic('check',15)} Photo prise · 18:57</span></div>
<div style="display:flex;gap:10px;margin:14px 20px 0"><div class="btn" style="flex:1">{ic('cam',18)} Reprendre</div><div class="btn" style="flex:1">Galerie</div></div>
<div class="btn p cta">Continuer</div><div class="home"></div>'''
S['08_signaler_2_position']=f'''{rhead(2,'Où êtes-vous ?')}<p class="mut pad" style="font-size:15px;margin-bottom:16px">Position détectée automatiquement. Déplacez la carte si besoin.</p>
<div class="mapw" style="margin:0 20px;height:380px;border-radius:24px;border:1px solid var(--line)">{MAP(1600,1140,vb=(640,700,420,460),legend=False,pins=False,font=.8)}
<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:rgba(92,225,242,.15);border:1px solid rgba(92,225,242,.5)"></div>
<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);color:#5CE1F2;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))"><svg width="40" height="52" viewBox="0 0 40 52"><path d="M20 52S2 32 2 19a18 18 0 0 1 36 0c0 13-18 33-18 33z" fill="#5CE1F2"/><circle cx="20" cy="19" r="7" fill="#030B1E"/></svg></div></div>
<div class="card" style="margin:14px 20px 0;padding:14px 16px;display:flex;gap:12px;align-items:center"><div class="ri" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(92,225,242,.12);color:var(--c)">{ic('pin',20)}</div><div><b>Bè Ahligo, Golfe 1</b><div class="mut" style="font-size:13px">Précision ± 8 m · GPS</div></div></div>
<div class="btn p cta">Confirmer la position</div><div class="home"></div>'''
S['09_signaler_3_niveau']=f'''{rhead(3,'Niveau de l’eau')}<p class="mut pad" style="font-size:15px;margin-bottom:16px">Jusqu’où monte l’eau sur une personne ?</p>
<div class="lvls pad">{''.join(f'<div class="lvl {"on" if k=="g" else ""}" style="padding:16px 6px">{fig(k,k=="g",w=62)}{n}<small>{d}</small></div>' for k,n,d in [('c','Cheville','~10 cm'),('g','Genou','~50 cm'),('t','Taille','~1 m')])}</div>
<div class="pad" style="margin-top:22px"><div class="lab">Ce que vous voyez</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px"><span class="chip on">Caniveau bouché</span><span class="chip">Route coupée</span><span class="chip on">Maisons touchées</span><span class="chip">Personnes bloquées</span></div>
<div class="lab">Commentaire (facultatif)</div><div class="inp" style="height:96px;align-items:flex-start;color:var(--tx)">Le caniveau devant le marché est bouché, l’eau entre dans les cours.</div></div>
<div class="btn p cta">Envoyer le signalement</div><div class="home"></div>'''
S['10_signaler_confirmation']=f'''{sb()}<div style="position:absolute;top:150px;left:0;right:0;display:grid;place-items:center">
<div style="width:150px;height:150px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(92,225,242,.25),transparent 70%)"><div style="width:96px;height:96px;border-radius:50%;display:grid;place-items:center;color:#03132f" class="grad">{ic('check',48)}</div></div></div>
<div class="pad" style="position:absolute;top:330px;left:0;right:0;text-align:center"><h2 class="ttl">Merci, c’est envoyé !</h2><p class="mut" style="font-size:15px;line-height:1.5;margin-top:6px">Votre signalement apparaît sur la carte. La mairie et la protection civile sont informées.</p>
<div class="card" style="text-align:left;margin-top:24px;padding:4px 0">{''.join(f'<div class="row" style="font-size:14px"><span class="mut">{a}</span><span style="margin-left:auto;font-weight:600">{b}</span></div>' for a,b in [('Référence','#EN-0327'),('Lieu','Bè Ahligo, Golfe 1'),('Niveau','Genou (~50 cm)'),('Statut','<span class="tag a">En vérification</span>')])}</div></div>
<div style="position:absolute;left:20px;right:20px;bottom:34px;display:flex;flex-direction:column;gap:10px"><div class="btn p" style="padding:16px">Voir sur la carte</div><div class="btn" style="padding:16px">Retour aux alertes</div></div>{DEMO.replace('bottom:10px','bottom:160px')}<div class="home"></div>'''
def profile():
    return f'''{sb()}<div class="top"><h2 class="ttl" style="margin:0">Profil</h2><div class="ib">{ic('gear',20)}</div></div>
<div class="card" style="margin:0 20px;padding:16px;display:flex;gap:14px;align-items:center"><div style="width:56px;height:56px;border-radius:18px;display:grid;place-items:center;font:600 20px Sora;color:#03132f" class="grad">AK</div><div style="flex:1"><b class="sora" style="font-size:17px">Afi K.</b><div class="mut" style="font-size:13px">+228 •• •• 42 17 · Bè</div></div><span class="tag g">Vérifiée</span></div>
<div style="display:flex;gap:10px;margin:12px 20px 0">{''.join(f'<div class="card" style="flex:1;padding:12px;text-align:center"><b class="sora" style="font-size:20px">{v}</b><div class="mut" style="font-size:12px">{l}</div></div>' for v,l in [('12','signalements'),('9','confirmés'),('2','quartiers')])}</div>
<div class="sec">Quartiers suivis</div><div class="card" style="margin:0 20px">{''.join(f'<div class="row"><div class="ri">{ic("pin",17)}</div>{n}<span class="v"><span class="tag {k}">{t}</span></span></div>' for n,k,t in [('Bè','r','Risque élevé'),('Agoè-Nyivé','r','Risque élevé')])}</div>
<div class="sec">Préférences</div><div class="card" style="margin:0 20px">{''.join(f'<div class="row"><div class="ri">{ic(i,17)}</div>{t}<span class="v">{v}</span></div>' for i,t,v in [('globe','Langue','Français '+ic('chev',16)),('chat','WhatsApp','<div class="tog"></div>'),('sms','SMS','<div class="tog"></div>'),('moon','Thème','Sombre '+ic('chev',16))])}</div>
{tab('Profil')}{DEMO.replace('bottom:10px','bottom:92px')}<div class="home"></div>'''
S['11_profil']=profile()
LIGHT={'12_alertes_clair':alerts(),'13_profil_clair':profile().replace('Sombre','Clair')}
if __name__=='__main__':
    import sys
    only=sys.argv[1:]
    for n,b in S.items():
        if not only or n in only: print(render(n,page(b,W,H,'dark',X),W,H,'app'))
    for n,b in LIGHT.items():
        if not only or n in only: print(render(n,page(b,W,H,'light',X),W,H,'app'))
