'use strict';
// ===== Зона 3: Мастерская — собрать компьютер по теням на столе =====
// места на столе (координаты фона 1280x720): x, низ, высота
const Z3P=[{id:'printer',x:360,b:430,h:146},{id:'speakers',x:520,b:430,h:115},{id:'monitor',x:718,b:430,h:245},{id:'sysunit',x:945,b:430,h:250},{id:'mic',x:1095,b:430,h:180},
 {id:'keyboard',x:690,b:462,h:90},{id:'mouse',x:880,b:462,h:66}];
const Z3ORD=['monitor','keyboard','sysunit','mouse','speakers','printer','mic'];
const HOL={};function holo(n){if(HOL[n])return HOL[n];const i=IM[n];if(!okI(i))return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);x.globalCompositeOperation='source-atop';const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'rgba(40,110,200,.80)');g.addColorStop(1,'rgba(14,40,110,.88)');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);HOL[n]=c;return c}
const SIL={};function silh(n,col){const key=n+(col||'');if(SIL[key])return SIL[key];const i=IM[n];if(!okI(i))return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col||'#0d1b3a';x.fillRect(0,0,c.width,c.height);SIL[key]=c;return c}
// места на столе раздвигаются между героями (стол во всю ширину); на узком экране чуть мельче
const Z3BACK=['printer','speakers','monitor','sysunit','mic'];
function z3slots(){const s=bgScale(),P=lineup(10);const PP=id=>Z3P.find(p=>p.id===id);const gap=22;
 const raw=Z3BACK.map(id=>PP(id).h*s*aspect(id));const need=raw.reduce((a,b)=>a+b,0)+gap*s*4;const k=Math.min(1,(P.x1-P.x0)/need);
 const gr=goalRect(),gTop=gr.top+gr.bh+14;
 const kTop=Math.min(...Z3BACK.map(id=>{const p=PP(id),b=bgXY(0,p.b)[1];return (b-gTop)/(p.h*s)}));const k2=Math.min(k,kTop);
 const [tl]=bgXY(70,0),[tr]=bgXY(1215,0);const span=need*k2;let x=clamp(P.cx-span/2,tl,tr-span);const R={};
 Z3BACK.forEach((id,i)=>{const p=PP(id),h=p.h*s*k2,w=raw[i]*k2;const b=bgXY(0,p.b)[1];R[id]={id,x:x+w/2,y:b-h/2,w:Math.max(w,90),h:Math.max(h,90),b,sh:h,sw:w};x+=w+gap*s*k2});
 for(const [id,base,f] of [['keyboard','monitor',-.11],['mouse','sysunit',-.36]]){const p=PP(id),h=p.h*s*k2,w=h*aspect(id),bx=R[base].x+R[base].sw*f,b=bgXY(0,p.b)[1];R[id]={id,x:bx,y:b-h/2,w:Math.max(w,90),h:Math.max(h,90),b,sh:h,sw:w,k}}
 R.k=k2;return R}
function z3slot(p){return z3slots()[p.id]}
SC.z3=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{side:'L'}),hero('bit',0,{side:'R'}),hero('klik',0,{riding:true})];const z=zoneStart(3,{placed:{},n:0,on:0});
  run(async()=>{await wait(300);await say('w1');GOAL='Перетащи деталь на её тень';SC.z3.layout();await say('w2')})},
 prog(){return ZS.n},
 layout(){const z=ZS;const P=lineup(16),x0=P.x0,x1=P.x1;let k=.66*bgScale();let ws=Z3ORD.map(id=>Z3P.find(p=>p.id===id).h*k*aspect(id));
  const t0=ws.reduce((a,b)=>a+b,0)+10*6;if(t0>x1-x0){const f=(x1-x0)/t0;k*=f;ws=ws.map(w=>w*f)}
  const tot=ws.reduce((a,b)=>a+b,0),gap=Math.max(8,(x1-x0-tot)/(Z3ORD.length-1));let x=x0;const by=safeB()-14;
  z.items=Z3ORD.map((id,i)=>{const p=Z3P.find(q=>q.id===id),h=p.h*k,w=ws[i];const o={id,x:x+w/2,y:by-h/2,hx:x+w/2,hy:by-h/2,r:Math.max(56,Math.max(w,h)/2),th:h};x+=w+gap;return o});
  dragReset(z.items,Z3P.map(p=>Object.assign(z3slot(p),{})),(o,t)=>SC.z3.drop(o,t))},
 drop(o,t){const z=ZS;if(t.id===o.id&&!z.placed[o.id]){o.off=1;z.placed[o.id]=1;z.n++;SFX.clink();burst(t.x,t.y,26,'spark',200);react(true,t.x,t.y);sayNow('p_'+o.id);
   if(z.n>=7){z.lock=true;run(async()=>{await wait(700);z.on=T;SFX.star();GOAL='';await wait(900);z.lock=false;await winZone('w_win','g_z3')})}return true}
  mistake();sayNow('w_wrong');return false},
 draw(){const z=ZS;bgDraw('workshop');lineup();
  // тени-места и поставленные детали: сначала дальний ряд
  if(z.items){DRG.targets=Z3P.map(z3slot);
   for(const p of Z3P){const t=z3slot(p);if(z.placed[p.id]){spr(p.id,t.x,t.b,t.sh,{ay:1});
     if(p.id==='monitor'&&z.on){const a=clamp((T-z.on)/.6,0,1);X.save();X.globalAlpha=a*.85;X.fillStyle='#7fe0ff';X.beginPath();X.roundRect(t.x-t.sw*.36,t.b-t.sh*.86,t.sw*.66,t.sh*.5,10);X.fill();X.restore();
      X.save();X.globalAlpha=a;txt('Привет!',t.x-t.sw*.03,t.b-t.sh*.61,Math.max(30,t.sh*.17),'#0a3a7a',{f:FONT,st:'#ffffff',lw:6,box:null});X.restore()}}
    else{const c=holo(p.id),cw=silh(p.id,'#aef4ff');if(c&&cw){const pu=.5+.5*Math.sin(T*3+t.x*.01),g=1.05;X.save();
      // светящийся контур-тень: мягкое голубое сияние, тёмно-синяя «ночная» заливка, бегущий блик
      X.shadowColor='rgba(140,235,255,.95)';X.shadowBlur=(14+16*pu)*S*DPR;X.globalAlpha=.75+.25*pu;X.drawImage(cw,t.x-t.sw*g/2,t.b-t.sh*(g+1)/2,t.sw*g,t.sh*g);
      X.shadowBlur=0;X.globalAlpha=.9;X.drawImage(c,t.x-t.sw/2,t.b-t.sh,t.sw,t.sh);X.restore();
      if(Math.random()<.04)burst(t.x+rnd(-t.sw/2,t.sw/2),t.b-rnd(0,t.sh),1,'spark',190,.15)}}}}
  drawCast();
  if(z.items){stepItems();for(const o of z.items){if(o.off)continue;const k=o.lift?1.3:1;selGlow(o,o.r+10);spr(o.id,o.x,o.y,o.th*k,{rot:o.lift?Math.sin(T*9)*.04:0})}}},
 ui(){progDots(7,ZS.n)},
 taps(ok){const z=ZS;if(!z.items||z.lock)return['wait'];const o=z.items.find(q=>!q.off);if(!o)return['wait'];const ts=DRG.targets;const t=ts.find(q=>ok?q.id===o.id:q.id!==o.id);return[[o.x,o.y],[t.x,t.y]]}});
