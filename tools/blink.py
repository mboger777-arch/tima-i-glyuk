# Кадры моргания: закрашиваем глаз цветом кожи (медиана кольца вокруг) с мягким краем + тёмная дуга ресниц
import numpy as np,json,sys
from PIL import Image,ImageDraw,ImageFilter
EY={ # name: [(cx,cy,rx,ry),...], style
 'tima':([(228,195,24,28),(316,186,22,27)],'lash'),
 'klik':([(128,230,24,32),(268,240,30,36)],'lash'),
 'glyuk':([(343,310,47,44),(516,330,52,46)],'lash'),
 'glyuk_kind':([(247,315,52,50),(428,302,50,52)],'lash'),
 'bit':([(250,262,38,38),(372,262,38,38)],'screen'),
 'bit_point':([(122,224,29,31),(210,224,29,31)],'screen'),
 'glyuk_angry':([(198,342,47,34),(370,342,50,36)],'lash'),
}
only=sys.argv[1:]
for n,(eyes,st) in EY.items():
  if only and n not in only:continue
  im=Image.open(f'assets/sprites/{n}.png').convert('RGBA');a=np.array(im).astype(float);H,W=a.shape[:2]
  yy,xx=np.mgrid[0:H,0:W]
  out=im.copy()
  for (cx,cy,rx,ry) in eyes:
    import cv2;S=4
    k={'tima':1.28,'klik':1.2}.get(n,1.14) if st!='screen' else 1.1
    d=((xx-cx)/(rx*k))**2+((yy-cy)/(ry*k))**2
    m=(d<1).astype(np.uint8)*255
    rgb=np.array(out)[...,:3][...,::-1].copy()
    inp=cv2.inpaint(rgb,m,int(max(rx,ry)*0.6),cv2.INPAINT_TELEA)[...,::-1].astype(float)
    # лёгкая тень века: темнее у ресниц
    sh=np.clip(1-0.05*np.clip((yy-(cy-ry))/(2*ry),0,1),0.85,1)[...,None]
    inp=inp*sh
    # зерно кожи, как в кольце вокруг глаза
    g0=np.array(out)[...,:3].astype(float);bl=cv2.GaussianBlur(g0,(0,0),2.5);hf=g0-bl
    ring=(d>1.1)&(d<2.0)&(a[...,3]>250);sd=hf[ring].std(0)
    rng=np.random.default_rng(cx);nz=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),0.9);nz=nz/nz.std()
    inp=inp+(nz[...,None]*np.median(np.abs(hf[ring]),0)[None,None,:]*1.0 if n.startswith('glyuk') else 0)
    soft=np.array(Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.5))).astype(float)[...,None]/255
    o=np.array(out).astype(float);o[...,:3]=o[...,:3]*(1-soft)+inp*soft
    out=Image.fromarray(o.clip(0,255).astype(np.uint8))
    D=Image.new('RGBA',(W*S,H*S),(0,0,0,0));dd=ImageDraw.Draw(D)
    if st=='screen':
      dd.arc([(cx-rx*.75)*S,(cy-ry*.55)*S,(cx+rx*.75)*S,(cy+ry*.45)*S],20,160,fill=(110,200,255,255),width=int(7*S))
    else:
      lw=max(4,rx*.16)
      dd.arc([(cx-rx*.98)*S,(cy-ry*.9)*S,(cx+rx*.98)*S,(cy+ry*.55)*S],15,165,fill=(55,30,20,255),width=int(lw*S))
    D=D.resize((W,H),Image.LANCZOS)
    out.alpha_composite(D)
  # не выходить за силуэт
  o=np.array(out);o[...,3]=np.minimum(o[...,3],a[...,3].astype(np.uint8));Image.fromarray(o).save(f'assets/sprites/{n}_blink.png')
  print(n,'ok')
