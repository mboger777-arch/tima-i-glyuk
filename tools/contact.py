# Контакт-лист вырезок на тёмном и светлом фоне: python3 tools/contact.py out.png files...
import sys
from PIL import Image,ImageDraw
out=sys.argv[1];fs=sys.argv[2:];C=8;cw=200
sh=Image.new('RGB',(C*cw,((len(fs)+C-1)//C)*(cw+16)),(40,40,60));d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGBA');im.thumbnail((cw-10,cw-10));x=(i%C)*cw;y=(i//C)*(cw+16)
  bg=Image.new('RGBA',(cw,cw),(255,0,255,255) if i%2 else (30,160,90,255));bg.alpha_composite(im,((cw-im.width)//2,(cw-im.height)//2));sh.paste(bg.convert('RGB'),(x,y))
  d.text((x+3,y+cw+2),f.split('/')[-1][:24],fill='white')
sh.save(out)
