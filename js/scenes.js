'use strict';
// ===== общие помощники, титул, вступление, карта, финал =====
const ZONES=[{n:1,sc:'z1',name:'Город Чувств',pos:[400,560]},{n:2,sc:'z2',name:'Библиотека',pos:[215,250]},{n:3,sc:'z3',name:'Мастерская',pos:[720,540]},
 {n:4,sc:'z4',name:'Ввод и вывод',pos:[1000,420]},{n:5,sc:'z5',name:'Город Памяти',pos:[640,250]}];
const FINPOS=[1065,150];
// надпись на нарисованной табличке; текст всегда внутри
function plaque(t,x,y,w,o){o=o||{};const sp=o.sp||'sign3';const h=w/aspect(sp);X.save();X.translate(x,y);if(o.a!=null)X.globalAlpha=o.a;sprW(sp,0,0,w);X.restore();
 textIn(t,x,y,w*.84,h*.62,o.size||44,o.col||'#fff6dc',{f:o.f||FONT,st:'#3a1a06',lw:6,id:o.id||'plaque',min:o.min||18});return h}
// картинка вписана в квадрат d×d (без растяжения)
function fitSpr(n,x,y,d,o){const a=aspect(n);return spr(n,x,y,a>1?d/a:d,o)}
// ---- перетаскивание: тащить пальцем ИЛИ нажать на предмет, потом на цель ----
// объект: {id,x,y,hx,hy,r (радиус касания), off(не трогается)}; цель: {id,x,y,w,h}
const DRG={items:[],targets:[],drag:null,sel:null,onDrop:null};
function dragReset(items,targets,onDrop){DRG.items=items;DRG.targets=targets;DRG.drag=null;DRG.sel=null;DRG.onDrop=onDrop;DRG.onTap=null}
function hitItem(x,y){let best=null,bd=1e9;for(const o of DRG.items){if(o.off)continue;const d=Math.hypot(x-o.x,y-o.y);if(d<(o.r||70)+18&&d<bd){bd=d;best=o}}return best}
function hitTarget(x,y){let best=null,bd=1e9;for(const t of DRG.targets){if(t.off)continue;const dx=Math.abs(x-t.x),dy=Math.abs(y-t.y);if(dx<t.w/2+10&&dy<t.h/2+10){const d=Math.hypot(dx/(t.w/2+10),dy/(t.h/2+10));if(d<bd){bd=d;best=t}}}return best}
function dragHold(pid,x,y){if(locked()||DRG.drag)return;const o=hitItem(x,y);
 if(o){DRG.drag={o,pid,dx:x-o.x,dy:y-o.y,sx:x,sy:y,moved:false};o.ret=0;o.lift=1;SFX.blip();return}
 if(DRG.sel){const t=hitTarget(x,y);if(t){const s=DRG.sel;DRG.sel=null;dropOn(s,t)}}}
function dragMove(pid,x,y){const d=DRG.drag;if(!d||d.pid!==pid)return;if(Math.hypot(x-d.sx,y-d.sy)>14)d.moved=true;if(d.moved){d.o.x=x-d.dx;d.o.y=y-d.dy}}
function dragUp(pid){const d=DRG.drag;if(!d||d.pid!==pid)return;DRG.drag=null;const o=d.o;o.lift=0;
 if(!d.moved){DRG.sel=DRG.sel===o?null:o;if(DRG.onTap)DRG.onTap(o);return}
 DRG.sel=null;const t=hitTarget(o.x,o.y)||hitTarget(PX,PY);if(t)dropOn(o,t);else goHome(o)}
function goHome(o){o.ret=1;o.rx=o.x;o.ry=o.y;o.rt=T}
function dropOn(o,t){if(locked()){goHome(o);return}const ok=DRG.onDrop(o,t);if(ok===false)goHome(o)}
// плавный возврат на место (ошибку можно сразу исправить)
function stepItems(){for(const o of DRG.items){if(o.ret){const u=clamp((T-o.rt)/(G.fast?.03:.35),0,1),e=ease(u);o.x=lerp(o.rx,o.hx,e);o.y=lerp(o.ry,o.hy,e);if(u>=1)o.ret=0}}}
function selGlow(o,r){if(DRG.sel!==o)return;X.save();X.strokeStyle='rgba(255,236,120,.95)';X.lineWidth=7;X.setLineDash([16,12]);X.lineDashOffset=-T*40;X.beginPath();X.arc(o.x,o.y,r,0,7);X.stroke();X.restore()}
// летит по дуге в цель
function flyTo(o,x,y,dur){o.fx=o.x;o.fy=o.y;o.tx=x;o.ty=y;o.ft=T;o.fd=G.fast?.03:(dur||.45);o.fly=1}
function stepFly(o){if(!o.fly)return;const u=clamp((T-o.ft)/o.fd,0,1),e=ease(u);o.x=lerp(o.fx,o.tx,e);o.y=lerp(o.fy,o.ty,e)-Math.sin(u*Math.PI)*60;if(u>=1)o.fly=0}
// ---- общая рамка зоны ----
function zoneStart(n,o){STF.length=0;for(const k in PDOT)delete PDOT[k];ZS=Object.assign({n,r:0,done:false,lock:false,mist:0,step:0},o||{});dragReset([],[],()=>false);return ZS}
function mistake(){ZS.mist++;SFX.bad();react(false)}
// ---- герои по краям: c.side 'L'/'R', c.ov — насколько заходит на соседа; возвращает свободную середину ----
function HR(n){return cast.find(c=>c.n===n)}
function lineup(gap){gap=gap==null?14:gap;let xl=safeL(),xr=safeR();
 for(const c of cast)c.hide=c.minW?vis().w<c.minW:c.hide;
 for(const c of cast){if(c.side!=='L'||c.hide)continue;const w=heroBW(c),lw=heroLW(c);const edge=xl===safeL();c.x=edge?xl+w/2:xl-(c.ov||0)*lw+lw/2;xl=Math.max(xl,c.x+(edge?w/2-(w-lw)/2:lw/2))}
 for(const c of cast){if(c.side!=='R'||c.hide)continue;const w=heroBW(c),lw=heroLW(c);const edge=xr===safeR();c.x=edge?xr-w/2:xr+(c.ov||0)*lw-lw/2;xr=Math.min(xr,c.x-(edge?w/2-(w-lw)/2:lw/2))}
 return{x0:xl+gap,x1:xr-gap,cx:(xl+xr)/2}}
// реакции героев: верно — все радуются, Глюк ворчит; ошибка — Глюк хихикает, Тима думает
function react(ok,x,y){const t=HR('tima'),b=HR('bit'),k=HR('klik'),g=HR('glyuk');
 if(ok){if(t){t.jump=T;pose('tima','cheer',1.3)}if(b){b.jump=T+.12;pose('bit','cheer',1.3)}if(k){k.jump=T+.22;pose('klik','jump',1.2)}
  if(g&&g.pose!=='kind'&&!g.kind){pose('glyuk','angry',1.6);g.wob=T;setTimeout(()=>SFX.grumble(),G.fast?0:300)}
  SFX.yay();if(x!=null)flyStar(x,y)}
 else{if(t){t.wob=T;pose('tima','think',1.8)}if(b)pose('bit','wow',1.4);if(g&&!g.kind){pose('glyuk','laugh',1.4);g.jump=T;SFX.giggle()}}}
// звёздочка летит из места ответа к счётчику
const STF=[];function flyStar(x,y){STF.push({x,y,t0:T})}
async function winZone(line,gl){const z=ZS;z.lock=true;cheer();burst(640,300,90,'conf',null,1.4);SFX.star();
 const i=z.n-1;SV.stars[i]=1;SV.open=Math.max(SV.open,Math.min(6,z.n+1));save();z.won=1;
 await say(line);if(gl){z.glq=1;await say(gl)}await wait(500);z.done=true;z.lock=false;go('map')}
// счётчик прогресса зоны: звёздочки-огоньки внизу справа
function progDots(n,done){const v=vis();const gR=GOAL?640+Math.min(780,v.w*.58)/2+14:safeL()+110;const x1=safeR()-14,avail=x1-gR;
 let rows=1,per=n,r=Math.min(26,avail/(n*2.3));if(r<20&&n>4){rows=2;per=Math.ceil(n/2);r=Math.min(26,avail/(per*2.3))}r=Math.max(r,15);
 const px=i=>x1-(per-1-(i%per))*(r*2.3)-r,py=i=>safeT()+r+14+Math.floor(i/per)*(r*2.2);const y=safeT()+42;
 for(let i=0;i<n;i++){const x=px(i),y=py(i);const pop=PDOT[i]&&T-PDOT[i]<.5?1+Math.sin((T-PDOT[i])/.5*Math.PI)*.45:1;X.save();X.globalAlpha=i<done?1:.35;spr('star',x,y,r*2.2*pop,{rot:i<done?Math.sin(T*2+i)*.1:0});X.restore()}
 for(let j=STF.length-1;j>=0;j--){const s=STF[j],u=clamp((T-s.t0)/(G.fast?.05:.7),0,1),e=ease(u);const i=Math.max(0,Math.min(n-1,done-1));const tx=px(i);
  const x=lerp(s.x,tx,e),yy=lerp(s.y,py(i),e)-Math.sin(u*Math.PI)*120;spr('star',x,yy,70*(1-u*.4),{rot:u*8});if(Math.random()<.5)burst(x,yy,1,'spark',50,.3);
  if(u>=1){STF.splice(j,1);PDOT[i]=T;SFX.coin()}}}
const PDOT={};
// ---- титул ----
SC.title={enter(){cast=[hero('tima',0),hero('klik',0),hero('bit',0)];},
 draw(){bgDraw('title');const v=vis();const hw=c=>heroX(c);
  cast[0].x=safeL()+hw(cast[0])/2;cast[1].x=safeL()+hw(cast[0])+hw(cast[1])/2-6;cast[2].x=safeR()-hw(cast[2])/2;drawCast();
  // Глюк выглядывает у монитора на столе
  {const[x0,y0]=bgXY(945,78),[x1,y1]=bgXY(1170,250);const cyc=(T%4.5)/4.5,up=clamp(Math.min(cyc/.15,(1-cyc)/.15),0,1);const e=ease(up);
   X.save();X.beginPath();X.roundRect(x0,y0,x1-x0,y1-y0,18);X.clip();const gh=(y1-y0)*1.05;spr(cyc<.5?'glyuk_laugh':'glyuk',(x0+x1)/2+Math.sin(T*1.3)*20,y1+gh*.55-e*gh*.62,gh,{ay:1});X.restore()}
  const lw=Math.min(500,v.w*.36),lh=lw/aspect('screen'),lx=(cast[1].x+hw(cast[1])/2+cast[2].x-hw(cast[2])/2)/2,ly=safeT()+lh/2;
  X.save();X.translate(lx,ly);X.rotate(Math.sin(T*1.1)*.01);sprW('screen',0,0,lw);X.restore();
  textIn('Тима и Глюк',lx,ly-lh*.12,lw*.66,lh*.3,80,'#fff6dc',{f:FONT,st:'#0a2a6a',lw:9,id:'logo'});
  textIn('путешествие внутрь компьютера',lx,ly+lh*.17,lw*.64,lh*.22,40,'#ffe27a',{f:FONT,st:'#0a2a6a',lw:6,id:'logo2'});SC.title.lx=lx;SC.title.ly=ly+lh/2},
 ui(){const lx=SC.title.lx||640;boardBtn('play',lx,Math.min(safeB()-80,SC.title.ly+100),380,'Играть',()=>{if(!SV.intro)go('intro');else go('map')},{pulse:1,size:72});
  btn('sound','b_sound',safeR()-44,safeT()+42,84,()=>{G.mute=!G.mute;if(G.mute)stopTalk()},{always:1});if(G.mute){X.save();X.strokeStyle='#d0202a';X.lineWidth=9;X.lineCap='round';const x=safeR()-44,y=safeT()+42;X.beginPath();X.moveTo(x-30,y-30);X.lineTo(x+30,y+30);X.stroke();X.restore()}}};
// ---- вступление ----
SC.intro={enter(){cast=[hero('tima',0,{side:'L'}),hero('klik',0,{side:'L',ov:.22}),hero('bit',0,{side:'R'}),hero('glyuk',0,{pose:'laugh',h:320,k:.001})];ZS=zoneStart(0);
  const gl=HR('glyuk');
  run(async()=>{await wait(400);await say('i1');
   // Глюк выскакивает из экрана-воронки
   tween(gl,'out',.8);SFX.zip();shake=6;await wait(G.fast?20:800);burst(gl.dx||640,gY()-160,40,'spark',100);SFX.giggle();
   pose('glyuk','laugh');await say('i2');pose('glyuk','');
   // и ныряет обратно в компьютер
   tween(gl,'in',.7);SFX.zip();await wait(G.fast?20:700);
   pose('tima','think');await say('i3');pose('tima','');pose('bit','point');await say('i4');pose('bit','');pose('klik','wave');await say('i5');pose('klik','');cheer();await say('i6');
   // герои уменьшаются и улетают в экран: Бит, Клик, Тима
   for(const n of ['bit','klik','tima']){tween(HR(n),'in',.85);SFX.zip();await wait(G.fast?20:330)}
   await wait(G.fast?20:700);ZS.zoom=T;SFX.whoosh();await wait(G.fast?20:900);SV.intro=1;save();go('map')})},
 draw(){bgDraw('title');const P=lineup();const gl=HR('glyuk');if(!gl.tw||gl.tw.mode!=='in'||1){gl.x=P.cx}
  const[sx,sy]=bgXY(1047,150);const t0=T;
  // воронка на экране мерцает сильнее, пока кто-то пролетает
  const busy=cast.some(c=>c.tw&&T-c.tw.t0<c.tw.d+.2);if(busy){X.save();X.globalAlpha=.35+.25*Math.sin(T*12);X.fillStyle='#bff4ff';X.beginPath();X.arc(sx,sy,60+Math.sin(T*9)*10,0,7);X.fill();X.restore()}
  for(const c of cast){const w=c.tw;if(!w){c.gy=null;c.spin=0;continue}const u=clamp((T-w.t0)/(G.fast?.02:w.d),0,1),e=ease(u);
   const hx=c.x,hy=gY();const [ax,ay,bx,by]=w.mode==='in'?[hx,hy,sx,sy+20]:[sx,sy+20,hx,hy];
   c.x=lerp(ax,bx,e);c.gy=lerp(ay,by,e)-Math.sin(u*Math.PI)*140;const kk=w.mode==='in'?lerp(1,.03,e):lerp(.05,1,e);c.k=kk;c.spin=(w.mode==='in'?u:1-u)*Math.PI*2*(c.n==='glyuk'?1:1.5);
   if(u<1&&Math.random()<.7)burst(c.x,c.gy-c.h*kk*.5,1,'spark',c.n==='glyuk'?100:190,.25);
   if(u>=1){if(w.mode==='in'){c.hide=1}else{c.tw=null;c.k=1;c.gy=null;c.spin=0}}}
  drawCast();
  if(ZS.zoom){const u=clamp((T-ZS.zoom)/.9,0,1);X.save();X.globalAlpha=u;X.fillStyle='rgba(150,220,255,1)';X.beginPath();X.arc(sx,sy,30+u*1600,0,7);X.fill();X.restore()}},
 ui(){boardBtn('skip',safeR()-150,safeB()-50,260,'Дальше',()=>{SV.intro=1;save();go('map')},{size:44})}};
// плавный перелёт героя в экран-воронку ('in') или из него ('out')
function tween(c,mode,d){if(!c)return;c.tw={mode,t0:T,d};c.hide=0;if(mode==='out')c.k=.05}
// ---- карта: вся карта видна целиком; поля — размытый фон ----
function mapRect(){const v=vis(),k=Math.min(v.w/1280,v.h/720);const w=1280*k,h=720*k;return{x:640-w/2,y:v.y0+v.h-h,k,w,h}}
SC.map={enter(){cast=[hero('tima',0,{h:340}),hero('klik',0,{h:190})];GOAL='';
  run(async()=>{await wait(300);if(SV.stars.every(v=>!v))await say('m1');else if(SV.stars.every(v=>v)&&!SV.fin)await say('m_fin')})},
 draw(){const v=vis(),m=mapRect();const b=IM.bg_map;
  if(okI(b)){X.save();X.filter='blur(14px) brightness(.8)';const s=Math.max(v.w/1280,v.h/720)*1.1;X.drawImage(b,640-640*s,v.y0+v.h/2-360*s,1280*s,720*s);X.restore();X.drawImage(b,m.x,m.y,m.w,m.h)}
  BGN='map';for(const c of cast){c.gy=safeB()-4}
  cast[0].x=safeL()+heroX(cast[0])/2;cast[1].x=safeL()+heroX(cast[0])+heroX(cast[1])/2-4;drawCast()},
 ui(){const m=mapRect();progDots(5,SV.stars.filter(v=>v).length);
  ZONES.forEach((z,i)=>{const x=m.x+z.pos[0]*m.k,y=m.y+z.pos[1]*m.k,open=SV.open>=z.n,done=SV.stars[i];const d=112,bob=Math.sin(T*2+i)*4;
   btn('zone'+z.n,'tile',x,y+bob,d,()=>{if(!open){sayNow('m_lock');SFX.bad();return}go(z.sc)},{pulse:open&&!done});
   txt(String(z.n),x,y+bob+2,70,open?'#fff6dc':'#9ab0c0',{f:NUM,st:'#0a3a5a',lw:8,box:[x-d*.4,y+bob-d*.4,x+d*.4,y+bob+d*.4],id:'zn'});
   if(!open)spr('lock',x+38,y+bob+34,56);if(done)spr('star',x+40,y+bob-40,60,{rot:Math.sin(T*2)*.1});
   plaque(z.name,x,y+bob+d/2+38,250,{size:40,id:'zname'})});
  const allS=SV.stars.every(v=>v);const[fx,fy]=[m.x+FINPOS[0]*m.k,m.y+FINPOS[1]*m.k];const bob=Math.sin(T*2.2)*5;
  btn('zone6','tile',fx,fy+bob,112,()=>{if(!allS){sayNow('m_lock');SFX.bad();return}go('fin')},{pulse:allS&&!SV.fin});spr(allS?'glyuk_laugh':'lock',fx,fy+bob,allS?92:60);
  if(SV.fin)spr('medal',fx+42,fy+bob-40,74);plaque('Экран',fx,fy+bob+94,200,{size:40,id:'zname'})}};
