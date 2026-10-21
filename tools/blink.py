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
    if n.startswith('glyuk'):
      ryy=np.where(yy<cy,ry*0.99,ry*1.18);d=((xx-cx)/(rx*(1.24 if n=='glyuk_angry' else 1.12)))**2+((yy-cy)/ryy)**2
    else:
      d=((xx-cx)/(rx*k))**2+((yy-cy)/(ry*k))**2
    m=(d<1)
    if st!='screen':
      # добрать «белки» и обводку глаза за пределами эллипса: всё, что заметно отличается от кожи рядом
      o0=np.array(out)[...,:3].astype(float);ring0=(d>1.3)&(d<2.3)&(a[...,3]>250);skin=np.median(o0[ring0],0)
      near=(((xx-cx)/(rx*k*1.32))**2+((yy-cy)/(ry*k*1.08))**2<1)&(a[...,3]>200)
      diff=np.sqrt(((o0-skin)**2).sum(-1))>38
      lab,nl=__import__('scipy.ndimage',fromlist=['label']).label(near&diff)
      keep=np.unique(lab[m&(lab>0)]);m=m|(np.isin(lab,keep[keep>0])&(yy>cy-ry*(0.2 if n.startswith('glyuk') else 0.75)))
    m=cv2.dilate(m.astype(np.uint8)*255,np.ones((3,3) if n.startswith('glyuk') else (5,5),np.uint8))
    rgb=np.array(out)[...,:3][...,::-1].copy()
    inp=cv2.inpaint(rgb,m,int(max(rx,ry)*0.3),cv2.INPAINT_TELEA)[...,::-1].astype(float)
    if n.startswith('glyuk'):
      # шершавая кожа Глюка: копируем чистый лоскут кожи с тела, подгоняем цвет к коже вокруг глаза
      o0=np.array(out)[...,:3].astype(float);ys,xs=np.where(m>0);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1;ph,pw_=y1-y0,x1-x0
      ring0=(d>1.3)&(d<2.3)&(a[...,3]>250);skin=np.median(o0[ring0],0);best=None
      for sy in range(int(H*.45),H-ph-10,12):
        for sx in range(10,W-pw_-10,12):
          P=o0[sy:sy+ph,sx:sx+pw_];A=a[sy:sy+ph,sx:sx+pw_,3]
          if A.min()<250:continue
          dd=np.sqrt(((P-np.median(P.reshape(-1,3),0))**2).sum(-1));sc=np.percentile(dd,97)+np.abs(np.median(P.reshape(-1,3),0)-skin).sum()*.3
          if best is None or sc<best[0]:best=(sc,sy,sx)
      _,sy,sx=best;P=o0[sy:sy+ph,sx:sx+pw_].copy();Phf=P-cv2.GaussianBlur(P,(0,0),4)
      rp=o0[ring0];lumr=rp.sum(1);sk=np.median(rp[lumr>np.percentile(lumr,40)],0)
      gy_=np.linspace(0,1,ph)[:,None,None];lf=sk[None,None,:]*(0.93+0.05*gy_)*np.ones((ph,pw_,1))
      inp[y0:y1,x0:x1]=np.where((m[y0:y1,x0:x1]>0)[...,None],lf+Phf*0.9,inp[y0:y1,x0:x1])
    # лёгкая тень века: темнее у ресниц
    sh=np.clip(1-(0 if n=='klik' else 0.04)*np.clip((yy-(cy-ry))/(2*ry),0,1),0.85,1)[...,None]
    inp=inp*sh
    # зерно кожи, как в кольце вокруг глаза
    g0=np.array(out)[...,:3].astype(float);bl=cv2.GaussianBlur(g0,(0,0),2.5);hf=g0-bl
    ring=(d>1.1)&(d<2.0)&(a[...,3]>250);sd=hf[ring].std(0)
    rng=np.random.default_rng(cx);nz=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),0.9);nz=nz/nz.std()
    inp=inp+(nz[...,None]*np.median(np.abs(hf[ring]),0)[None,None,:]*1.0 if n.startswith('glyuk') else 0)
    soft=np.array(Image.fromarray(m).filter(ImageFilter.GaussianBlur(3.0 if n.startswith('glyuk') else 1.5))).astype(float)[...,None]/255
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
