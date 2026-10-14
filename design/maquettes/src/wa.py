from common import *
X='''body.dark{background:#0B141A}
.wtop{background:#1F2C34;padding:0 12px 10px;display:flex;align-items:center;gap:10px}.wav{width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#0E3470,#030B1E);display:grid;place-items:center;box-shadow:0 0 0 1.5px #5CE1F2}
.wtop b{display:block;font-size:16.5px;font-weight:600;color:#E9EDEF}.wtop small{font-size:12.5px;color:#8696a0}.wtop .ics{display:flex;gap:20px;color:#AEBAC1;margin-left:auto}
.chat{position:absolute;top:110px;bottom:84px;left:0;right:0;padding:10px 10px;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;overflow:hidden;background-color:#0B141A;background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1.2px);background-size:18px 18px}
.m{max-width:82%;padding:7px 9px 5px 10px;border-radius:9px;font-size:14.6px;line-height:1.38;color:#E9EDEF;position:relative;box-shadow:0 1px .5px rgba(0,0,0,.25)}
.m .t{float:right;font-size:11px;color:#8696a0;margin:6px 0 -4px 10px}.out .t{color:#8cc9b9}.t .tk{color:#53BDEB}
.in{background:#202C33;align-self:flex-start;border-top-left-radius:2px}.out{background:#005C4B;align-self:flex-end;border-top-right-radius:2px}
.m b{font-weight:600}.qr{align-self:flex-start;display:flex;flex-direction:column;gap:4px;width:74%}.qr span{background:#202C33;border-radius:9px;text-align:center;padding:9px;color:#53BDEB;font-size:14.5px;font-weight:500;display:flex;gap:8px;justify-content:center;align-items:center}
.day{align-self:center;font-size:12.5px;color:#8696a0;background:#182229;padding:5px 12px;border-radius:8px;margin:4px 0}
.sys{align-self:center;font-size:12px;color:#FFD279;background:#182229;padding:6px 12px;border-radius:8px;text-align:center;max-width:86%}
.img{width:250px;height:170px;border-radius:7px;background-size:cover;background-position:center;margin:-2px -4px 6px -5px}
.loc{width:250px;height:110px;border-radius:7px;overflow:hidden;margin:-2px -4px 6px -5px;position:relative}.loc>svg{position:absolute;inset:0;width:100%;height:100%}
.wbar{position:absolute;bottom:0;left:0;right:0;padding:8px 8px 30px;background:#0B141A;display:flex;gap:6px;align-items:center}.wbar div{flex:1;background:#202C33;border-radius:24px;padding:12px 16px;color:#8696a0;font-size:15px;display:flex;justify-content:space-between}.wbar i{width:46px;height:46px;border-radius:50%;background:#00A884;display:grid;place-items:center;color:#0B141A}
.note{position:absolute;left:12px;right:12px;top:118px;z-index:30;padding:9px 12px;border-radius:12px;background:#FFD279;color:#3a2a00;font-size:12.5px;font-weight:600;display:flex;gap:8px;align-items:center;box-shadow:0 8px 20px rgba(0,0,0,.4)}
.home{background:#fff}
'''
def top():
    return f'''{sb()}<div class="wtop"><span style="color:#AEBAC1">{ic('back',24)}</span><div class="wav">{logo(28)}</div><div><b>Edzii-Nku <svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align:-2px"><path d="M12 1l2.6 2.2 3.4-.4.9 3.3 3 1.7-1.3 3.2 1.3 3.2-3 1.7-.9 3.3-3.4-.4L12 23l-2.6-2.2-3.4.4-.9-3.3-3-1.7L3.4 13 2.1 9.8l3-1.7.9-3.3 3.4.4z" fill="#00A884"/><path d="m8 12 3 3 5-6" stroke="#fff" stroke-width="2" fill="none"/></svg></b><small>Compte professionnel</small></div><div class="ics">{ic('cam',22)}<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></div></div>'''
def wrap(msgs,extra=''):
    return f'''{top()}{extra}<div class="chat">{msgs}</div><div class="wbar"><div><span>Message</span><span>{ic('cam',20)}</span></div><i>{ic('plus',22)}</i></div>{DEMO.replace('bottom:10px','bottom:90px').replace('class="demo"','class="demo" style="color:#8696a0;right:auto;left:50%;transform:translateX(-50%)"')}<div class="home"></div>'''
def t(h,out=False): return f'<span class="t">{h}{" <span class=tk>✓✓</span>" if out else ""}</span>'
S={}
S['01_inscription_quartier']=wrap(f'''<div class="day">Aujourd’hui</div>
<div class="m in">👋 Bienvenue sur <b>Edzii-Nku</b>, l’œil de la pluie.<br>Je vous préviens quand une forte pluie menace votre quartier.<br><br>Quelle langue préférez-vous ?{t("10:02")}</div><div class="qr"><span>Français</span><span>Eʋegbe</span></div>
<div class="m out">Français{t("10:02",1)}</div><div class="m in">Dans quel quartier habitez-vous ? Écrivez son nom ou partagez votre position 📍{t("10:02")}</div>
<div class="m out">Bè Ahligo{t("10:03",1)}</div><div class="m in">J’ai trouvé : <b>Bè · Golfe 1</b> (zone à risque élevé).<br>Voulez-vous suivre ce quartier ?{t("10:03")}</div><div class="qr"><span>✅ Oui, suivre Bè</span></div>
<div class="m out">✅ Oui, suivre Bè{t("10:03",1)}</div><div class="m in">C’est fait ! Vous recevrez les alertes pour <b>Bè</b>.<br>Envoyez <b>SIGNALER</b> à tout moment pour signaler une inondation, <b>STOP</b> pour vous désabonner.{t("10:03")}</div>''')
S['02_alerte_francais']=wrap(f'''<div class="day">Aujourd’hui</div><div class="m in" style="max-width:86%"><div style="border-left:4px solid #FF5C7A;padding-left:9px;margin-bottom:6px"><b style="color:#FF8FA3">⚠️ ALERTE FORTE PLUIE · BÈ</b></div>De fortes pluies sont prévues <b>ce soir de 18 h à 23 h</b> (45 à 60 mm).<br><br>🔴 Risque d’inondation élevé dans votre quartier.<br><br>✅ Surélevez vos biens et vos documents<br>🚫 Évitez les caniveaux et les bassins<br>📞 Urgence : <b>170</b> (numéro vert)<br><br><span style="color:#8696a0;font-size:13px">Source : prévisions Open-Meteo · Edzii-Nku</span>{t("16:42")}</div>
<div class="qr" style="width:86%"><span>🙋 Je suis en sécurité</span><span>📸 Signaler une inondation</span><span>🗺️ Voir la carte</span></div>
<div class="m out">🙋 Je suis en sécurité{t("16:45",1)}</div><div class="m in">Merci, c’est noté. Restez prudent·e. Nous vous écrirons à la fin de la vigilance.{t("16:45")}</div>''')
S['03_alerte_ewe']=wrap(f'''<div class="day">Egbe</div><div class="m in" style="max-width:86%"><div style="border-left:4px solid #FF5C7A;padding-left:9px;margin-bottom:6px"><b style="color:#FF8FA3">⚠️ NYANUƉEƉE: TSI GÃ · BÈ</b></div>Tsi gã adza <b>fiẽ sia tso gaƒoƒo 18 vaseɖe 23</b> (45–60 mm).<br><br>🔴 Tsiɖɔɖɔ ƒe afɔku le wò kɔƒe me.<br><br>✅ Ɖo wò nuwo kple wò agbalẽwo ɖe dzi<br>🚫 Mègaɖo tsiveɖawo kple tsiƒuwo gbɔ o<br>📞 Kpekpeɖeŋu: <b>170</b><br><br><span style="color:#8696a0;font-size:13px">Tso: Open-Meteo · Edzii-Nku</span>{t("16:42")}</div>
<div class="qr" style="width:86%"><span>🙋 Medze dedie</span><span>📸 Gblɔ tsiɖɔɖɔ</span><span>🗺️ Kpɔ anyigbatata</span></div>''',extra='<div class="note">⚠ Texte éwé à faire vérifier par un locuteur natif</div>')
S['04_signalement_photo']=wrap(f'''<div class="m out">SIGNALER{t("18:55",1)}</div><div class="m in">📸 Envoyez une photo de l’eau, puis votre position.{t("18:55")}</div>
<div class="m out" style="padding:4px 4px 5px"><div class="img" style="background-image:url(p01.jpg);margin:0 0 4px 0;width:240px;height:150px"></div><span style="padding:0 6px">Rue inondée près du marché</span>{t("18:56",1)}</div>
<div class="m out" style="padding:4px 4px 5px"><div class="loc" style="margin:0 0 4px 0;width:240px;height:96px" >{MAP(1600,1140,vb=(560,720,560,230),legend=False,pins=False,labels=True,grid=False,font=.9)}<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);color:#FF5C7A">{ic('pin',28)}</div></div><span style="padding:0 6px">📍 Bè Ahligo, Golfe 1</span>{t("18:56",1)}</div>
<div class="m in">Jusqu’où monte l’eau ?{t("18:56")}</div><div class="qr" style="flex-direction:row;width:94%"><span style="flex:1">Cheville</span><span style="flex:1">Genou</span><span style="flex:1">Taille</span></div>
<div class="m out">Genou{t("18:57",1)}</div><div class="m in">✅ <b>Merci !</b> Signalement <b>#EN-0327</b> reçu.<br>📍 Bè Ahligo · 🌊 eau au genou<br>Il apparaîtra sur la carte après vérification. La mairie et la protection civile sont informées.{t("18:57")}</div>''')
if __name__=='__main__':
    for n,b in S.items(): print(render(n,page(b,390,844,'dark',X),390,844,'whatsapp'))
