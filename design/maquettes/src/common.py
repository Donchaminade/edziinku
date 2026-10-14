import sys,os
sys.path.insert(0,'/workspace/slides/edzii-nku-assets/src');import mapgen
ROOT='/workspace/edzii-nku-ui'
LOGO=open('/workspace/slides/edzii-nku-assets/logo_mark.svg').read()
def logo(n): return LOGO.replace('width="512" height="512"',f'width="{n}" height="{n}"')
def MAP(W,H,vb=None,**k):
    k.setdefault('rx',0);sv=mapgen.svg(W=W,H=H,**k)
    if vb: sv=sv.replace(f'viewBox="0 0 {W} {H}"','viewBox="%d %d %d %d"'%vb,1)
    return sv.replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" ',1)
    return mapgen.svg(W=W,H=H,**k).replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" ',1)
P='<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{d}</svg>'
ICONS={'grid':'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
'map':'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>','pin':'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
'bell':'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>','drain':'<path d="M3 8h18M3 8v6a9 4 0 0 0 18 0V8M8 12v2M12 12v3M16 12v2"/>',
'clock':'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>','team':'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4 4 0 0 1 7-2.6"/>',
'cam':'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>','check':'<path d="M5 12.5 10 17 19 7"/>','x':'<path d="M6 6l12 12M18 6 6 18"/>',
'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>','gear':'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
'plus':'<path d="M12 5v14M5 12h14"/>','search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>','filter':'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
'rain':'<path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>','globe':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
'chev':'<path d="m9 6 6 6-6 6"/>','back':'<path d="m15 6-6 6 6 6"/>','loc':'<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="7"/>',
'down':'<path d="M12 4v12M6 11l6 6 6-6M4 20h16"/>','sms':'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M9 7h6M9 11h6"/>','chat':'<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/>',
'shield':'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>','moon':'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>','eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
'up':'<path d="M7 17 17 7M9 7h8v8"/>','layers':'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>','share':'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>'}
def ic(n,s=20): return P.format(s=s,d=ICONS[n])
def fig(h,on=False,col='#5CE1F2',w=54):
    y={'c':78,'g':58,'t':38}[h]
    return f'<svg width="{w}" height="{w*90/54:.0f}" viewBox="0 0 54 90"><circle cx="27" cy="12" r="8" fill="currentColor"/><path d="M15 26h24l-3 30h-5l-1 32h-6l-1-32h-5z" fill="currentColor" fill-opacity=".9"/><rect x="0" y="{y}" width="54" height="{90-y}" fill="{col}" fill-opacity="{.75 if on else .4}"/><path d="M0 {y} q7 -4 13 0 t14 0 t14 0 t13 0" stroke="#fff" stroke-opacity=".7" fill="none"/></svg>'
SB='''<div class="sb"><span>{t}</span><span class="isl"></span><span><svg width="74" height="14" viewBox="0 0 74 14" fill="currentColor"><rect x="0" y="9" width="3.5" height="5" rx="1"/><rect x="5.5" y="6" width="3.5" height="8" rx="1"/><rect x="11" y="3" width="3.5" height="11" rx="1"/><rect x="16.5" y="0" width="3.5" height="14" rx="1"/><path d="M33 4.5a10 10 0 0 1 14 0l-1.6 1.7a7.6 7.6 0 0 0-10.8 0zM36 7.6a5.6 5.6 0 0 1 8 0L40 12z"/><rect x="51.5" y="1.5" width="19" height="11" rx="3" fill="none" stroke="currentColor" stroke-opacity=".5"/><rect x="53.5" y="3.5" width="13" height="7" rx="1.5"/></svg></span></div>'''
def sb(t='9:41'): return SB.format(t=t)
DEMO='<div class="demo">Données de démonstration</div>'
BASE=open(os.path.join(os.path.dirname(__file__),'base.css')).read()
def page(body,w,h,theme='dark',extra=''):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{BASE}{extra}</style></head><body class="{theme}" style="width:{w}px;height:{h}px">{body}</body></html>'
import subprocess
def render(name,html,w,h,sub):
    hp=f'{ROOT}/src/html/{sub}_{name}.html';os.makedirs(os.path.dirname(hp),exist_ok=True)
    open(hp,'w').write(html.replace('src="p','src="../p').replace("url(p","url(../p"))
    out=f'{ROOT}/screens/{sub}/{name}@2x.png'
    subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=2',f'--window-size={w},{h}',f'--screenshot={out}','file://'+hp],capture_output=True)
    return out
