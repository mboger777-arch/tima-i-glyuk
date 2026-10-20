import sys,glob
from PIL import Image
d=sys.argv[1];out=sys.argv[2];fs=sorted(glob.glob(d+'/*.png'));W=int(sys.argv[3]) if len(sys.argv)>3 else 600
im0=Image.open(fs[0]);H=int(W*im0.size[1]/im0.size[0]);cols=2
sh=Image.new('RGB',(W*cols,H*((len(fs)+cols-1)//cols)))
for i,f in enumerate(fs):sh.paste(Image.open(f).convert('RGB').resize((W-3,H-3)),((i%cols)*W,(i//cols)*H))
sh.save(out)
