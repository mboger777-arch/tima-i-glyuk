# Нарезка многорядных листов по явным рамкам (пиксели 1280x720): /home/box/rbvenv/bin/python tools/cut_boxes.py [sheet]
from rembg import remove,new_session
from PIL import Image
import numpy as np,sys,json,os
from scipy import ndimage
import onnxruntime as ort
SO=ort.SessionOptions();SO.enable_cpu_mem_arena=False;SO.intra_op_num_threads=6
S=new_session('birefnet-general',sess_opts=SO)
k=1.25
def B(*a):return tuple(int(v*k) for v in a)
BOX={'tima_poses':{'tima_cheer':B(14,72,238,462),'tima_point':B(244,78,442,464),'tima_think':B(444,82,590,466)},
 'bit_klik_poses':{'bit_cheer':B(6,100,247,448),'bit_point':B(249,105,434,448),'bit_wow':B(437,105,584,448),'klik_jump':B(608,125,803,428),'klik_wave':B(804,155,1003,448)},
 'senses_items':{'bell':B(22,55,208,235),'drum':B(236,60,410,240),'rose':B(436,45,585,245),'perfume':B(620,40,805,250),'lemon':B(812,90,1004,235),
  'lollipop':B(36,280,175,480),'hedgehog':B(196,295,390,475),'teddy':B(405,280,585,495),'rainbow':B(596,315,828,465),'traffic':B(855,280,970,485)},
 'devices2':{'scanner':B(25,15,282,248),'webcam':B(308,55,432,220),'joystick':B(452,30,605,215),'headphones':B(615,35,775,220),'projector':B(790,75,1005,235),
  'loco':B(40,250,407,530),'wagon':B(415,335,675,505),'sphere':B(715,260,960,505)},
 'action_houses':{'h_get':B(6,32,234,470),'h_store':B(238,32,505,470),'h_send':B(510,32,752,470),'h_proc':B(756,32,1020,470)},
 'situations':{'s_radio':B(10,50,305,250),'s_telescope':B(322,20,528,280),'s_album':B(538,20,765,270),'s_diary':B(782,35,995,275),
  's_envelope':B(15,288,275,470),'s_pigeon':B(276,280,525,475),'s_puzzle':B(530,288,755,520),'s_abacus':B(760,288,1005,535)},
 'misc':{'vacuum':B(40,20,350,295),'pixels':B(395,25,660,265),'trophy':B(708,25,965,270),'infocube':B(80,305,295,525),'notes':B(395,305,625,525),'painting':B(700,295,960,535)}}
KEEPALL={'pixels','notes','s_radio','s_envelope','headphones'}
def clean(a,keepall):
    al=a[...,3].copy();lab,n=ndimage.label(al>40)
    if n>=1:
        sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1));thr=(0.004 if keepall else 0.03)*sz.max()
        big=[i+1 for i,v in enumerate(sz) if v>=thr]
        m=ndimage.binary_dilation(np.isin(lab,big),iterations=3);al=(al*m).astype(np.uint8)
    al[al<14]=0
    edge=(al>0)&(al<245);solid=al>=245
    if edge.any() and solid.any():
        idx=ndimage.distance_transform_edt(~solid,return_distances=False,return_indices=True)
        rgb=a[...,:3].copy();rgb[edge]=a[...,:3][idx[0][edge],idx[1][edge]];a[...,:3]=rgb
    a[...,3]=al;return a
FILL={'sphere','infocube','painting','s_puzzle','s_album','s_diary'}
only=sys.argv[1:]
for sh,objs in BOX.items():
    if only and sh not in only:continue
    img=Image.open(f'refs/{sh}.jpg').convert('RGB');bgc=img.getpixel((2,2))
    for nm,(x0,y0,x1,y1) in objs.items():
        P=Image.new('RGB',(x1-x0+40,y1-y0+40),bgc);P.paste(img.crop((x0,y0,x1,y1)),(20,20))
        s=max(1,1000/max(P.size));P=P.resize((int(P.width*s),int(P.height*s)),Image.LANCZOS)
        o=clean(np.array(remove(P,session=S,post_process_mask=True)),nm in KEEPALL)
        if nm in FILL:
            Pa=np.array(P);fm=ndimage.binary_fill_holes(o[...,3]>40);hole=fm&(o[...,3]<250);o[...,:3][hole]=Pa[hole];o[...,3][hole]=255
        al=o[...,3];touch=bool(al[:22].max()>40 or al[-22:].max()>40 or al[:,:22].max()>40 or al[:,-22:].max()>40)
        im=Image.fromarray(o);im=im.crop(im.getbbox())
        mx=1000 if nm in('loco',) else 700
        if max(im.size)>mx: q=mx/max(im.size);im=im.resize((round(im.width*q),round(im.height*q)),Image.LANCZOS)
        dst='sprites' if sh in('tima_poses','bit_klik_poses') else 'ui'
        if dst=='sprites':mx=900
        if max(im.size)>mx: q=mx/max(im.size);im=im.resize((round(im.width*q),round(im.height*q)),Image.LANCZOS)
        im.save(f'assets/{dst}/{nm}.png',optimize=True);print(sh,nm,im.size,'EDGE!' if touch else '',flush=True)
