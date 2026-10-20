'use strict';
// ===== общие помощники, титул, вступление, карта, финал =====
const ZONES=[{n:1,sc:'z1',name:'Город Чувств',pos:[400,560]},{n:2,sc:'z2',name:'Библиотека',pos:[215,250]},{n:3,sc:'z3',name:'Мастерская',pos:[720,540]},
 {n:4,sc:'z4',name:'Ввод и вывод',pos:[1000,420]},{n:5,sc:'z5',name:'Город Памяти',pos:[640,250]}];
const FINPOS=[1065,150];
// надпись на нарисованной табличке; текст всегда внутри
function plaque(t,x,y,w,o){o=o||{};const sp=o.sp||'sign3';const h=w/aspect(sp);X.save();X.translate(x,y);if(o.a!=null)X.globalAlpha=o.a;sprW(sp,0,0,w);X.restore();
 textIn(t,x,y,w*.84,h*.62,o.size||44,o.col||'#fff6dc',{f:o.f||FONT,st:'#3a1a06',lw:6,id:o.id||'plaque',min:o.min||18});return h}
// ---- перетаскивание: тащить пальцем ИЛИ нажать на предмет, потом на цель ----
// объект: {id,x,y,hx,hy,r (радиус касания), off(не трогается)}; цель: {id,x,y,w,h}
const DRG={items:[],targets:[],drag:null,sel:null,onDrop:null};
function dragReset(items,targets,onDrop){DRG.items=items;DRG.targets=targets;DRG.drag=null;DRG.sel=null;DRG.onDrop=onDrop;DRG.onTap=null}
function hitItem(x,y){let best=null,bd=1e9;for(const o of DRG.items){if(o.off)continue;const d=Math.hypot(x-o.x,y-o.y);if(d<(o.r||70)+18&&d<bd){bd=d;best=o}}return best}
function hitTarget(x,y){for(const t of DRG.targets){if(t.off)continue;if(Math.abs(x-t.x)<t.w/2+10&&Math.abs(y-t.y)<t.h/2+10)return t}return null}
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
function zoneStart(n,o){ZS=Object.assign({n,r:0,done:false,lock:false,mist:0,step:0},o||{});dragReset([],[],()=>false);return ZS}
function mistake(){ZS.mist++;SFX.bad()}
async function winZone(line,gl){const z=ZS;z.lock=true;cheer();burst(640,300,90,'conf',null,1.4);SFX.star();
 const i=z.n-1;SV.stars[i]=1;SV.open=Math.max(SV.open,Math.min(6,z.n+1));save();z.won=1;
 await say(line);if(gl){z.glq=1;await say(gl)}await wait(500);z.done=true;z.lock=false;go('map')}
// счётчик прогресса зоны: звёздочки-огоньки внизу справа
function progDots(n,done){const r=26,x1=safeR()-20,y=safeT()+42;for(let i=0;i<n;i++){const x=x1-(n-1-i)*(r*2+8)-r;X.save();X.globalAlpha=i<done?1:.35;spr('star',x,y,r*2.2,{rot:i<done?Math.sin(T*2+i)*.1:0});X.restore()}}
// ---- титул ----
SC.title={enter(){cast=[hero('tima',0),hero('klik',0),hero('bit',0)];},
 draw(){bgDraw('title');const v=vis();const hw=c=>heroX(c);
  cast[0].x=safeL()+hw(cast[0])/2;cast[1].x=safeL()+hw(cast[0])+hw(cast[1])/2-6;cast[2].x=safeR()-hw(cast[2])/2;drawCast();
  // Глюк выглядывает у монитора на столе
  const[gx,gy]=bgXY(1010,322);const bob=Math.abs(Math.sin(T*2.4))*14;spr('glyuk_laugh',gx-150,gy-bob,150,{ay:1});
  const lw=Math.min(500,v.w*.36),lh=lw/aspect('screen'),lx=(cast[1].x+hw(cast[1])/2+cast[2].x-hw(cast[2])/2)/2,ly=safeT()+lh/2;
  X.save();X.translate(lx,ly);X.rotate(Math.sin(T*1.1)*.01);sprW('screen',0,0,lw);X.restore();
  textIn('Тима и Глюк',lx,ly-lh*.12,lw*.66,lh*.3,80,'#fff6dc',{f:FONT,st:'#0a2a6a',lw:9,id:'logo'});
  textIn('путешествие внутрь компьютера',lx,ly+lh*.17,lw*.64,lh*.22,40,'#ffe27a',{f:FONT,st:'#0a2a6a',lw:6,id:'logo2'});SC.title.lx=lx;SC.title.ly=ly+lh/2},
 ui(){const lx=SC.title.lx||640;boardBtn('play',lx,Math.min(safeB()-80,SC.title.ly+100),380,'Играть',()=>{if(!SV.intro)go('intro');else go('map')},{pulse:1,size:72});
  btn('sound','b_sound',safeR()-44,safeT()+42,84,()=>{G.mute=!G.mute;if(G.mute)stopTalk()},{always:1});if(G.mute){X.save();X.strokeStyle='#d0202a';X.lineWidth=9;X.lineCap='round';const x=safeR()-44,y=safeT()+42;X.beginPath();X.moveTo(x-30,y-30);X.lineTo(x+30,y+30);X.stroke();X.restore()}}};
// ---- вступление ----
SC.intro={enter(){cast=[hero('tima',0),hero('klik',0),hero('glyuk',0,{pose:'laugh',h:300}),hero('bit',0)];ZS=zoneStart(0);ZS.gin=0;
  run(async()=>{await wait(400);await say('i1');ZS.gin=T;SFX.whoosh();await wait(500);pose('glyuk','laugh');await say('i2');pose('glyuk','');
   pose('tima','think');await say('i3');pose('tima','');pose('bit','point');await say('i4');pose('bit','');pose('klik','wave');await say('i5');pose('klik','');cheer();await say('i6');
   ZS.zoom=T;SFX.whoosh();await wait(900);SV.intro=1;save();go('map')})},
 draw(){bgDraw('title');const hw=c=>heroX(c);const L=safeL(),R=safeR();
  cast[0].x=L+hw(cast[0])/2;cast[1].x=L+hw(cast[0])+hw(cast[1])/2-6;cast[3].x=R-hw(cast[3])/2;
  const g=cast[2];g.x=(cast[1].x+hw(cast[1])/2+cast[3].x-hw(cast[3])/2)/2;g.k=ZS.gin?ease((T-ZS.gin)/.6):0.001;
  if(ZS.gin&&T-ZS.gin<1.2)burst(g.x,gY()-150,3,'spark',rnd(80,300),.5);
  drawCast();
  if(ZS.zoom){const u=clamp((T-ZS.zoom)/.9,0,1);const v=vis();const[mx,my]=bgXY(1080,180);X.save();X.globalAlpha=u;X.fillStyle='rgba(120,200,255,1)';X.beginPath();X.arc(mx,my,30+u*1500,0,7);X.fill();X.restore()}},
 ui(){boardBtn('skip',safeR()-150,safeB()-50,260,'Дальше',()=>{SV.intro=1;save();go('map')},{size:44})}};
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
