'use strict';
// ===== Зона 4: Дорога информации — ввод или вывод; затем путь ввод → процессор → вывод =====
const Z4D=[{id:'keyboard',io:'in'},{id:'monitor',io:'out'},{id:'mic',io:'in'},{id:'speakers',io:'out'},{id:'printer',io:'out'},{id:'scanner',io:'in'},{id:'headphones',io:'out'},{id:'webcam',io:'in'}];
const Z4T=[{k:'t_song',goal:'Спеть песенку и послушать',i:'mic',o:'speakers'},{k:'t_letter',goal:'Написать письмо и напечатать',i:'keyboard',o:'printer'},{k:'t_photo',goal:'Снять себя и посмотреть',i:'webcam',o:'monitor'}];
const Z4IN=['keyboard','mic','webcam'],Z4OUT=['monitor','speakers','printer'];
function z4geo(){const P=lineup(16);const x0=P.x0,x1=P.x1;const cx=(x0+x1)/2;const[px,py]=bgXY(640,300);
 return{x0,x1,cx,sin:{x:x0+130,y:430},sout:{x:x1-130,y:430},ty:gY()-60,px,py:Math.min(py,330)}}
SC.z4=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{side:'L'}),hero('bit',0,{side:'R'}),hero('klik',0,{riding:true})];const z=zoneStart(4,{ph:0,i:-1,cur:null,pile:{in:[],out:[]},task:-1,si:null,so:null,run:null});
  run(async()=>{await wait(300);await say('r1');GOAL='Куда отвезти: ввод или вывод?';SC.z4.next();await say('r2')})},
 prog(){return ZS.ph*100+(ZS.ph?ZS.task:ZS.i)},
 next(){const z=ZS;z.i++;if(z.i>=Z4D.length){z.cur=null;SC.z4.phaseB();return}const d=Z4D[z.i],g=z4geo();
  const o={id:d.id,d,x:-999,y:0,hx:0,hy:0,r:80};z.cur=o;z.train={from:vis().x0-260,to:g.cx,t0:T,d:1.1,x:vis().x0-260};SFX.train();
  dragReset([o],[{id:'in',x:g.sin.x,y:g.sin.y+60,w:260,h:400},{id:'out',x:g.sout.x,y:g.sout.y+60,w:260,h:400}],(o,t)=>SC.z4.pick(t.id))},
 pick(io){const z=ZS,o=z.cur;if(!o||z.lock||z.ph!==0||!z.train||!z.train.stop)return false;if(o.d.io===io){const g=z4geo(),s=io==='in'?g.sin:g.sout;o.off=1;flyTo(o,s.x,gY()-110,.45);z.lock=true;SFX.pop();
   run(async()=>{await wait(460);z.pile[io].push(o.id);z.cur=null;burst(s.x,s.y,30,'spark',io==='in'?120:30);react(true,s.x,gY()-140);z.lock=false;z.train={from:z.train.x,to:vis().x0+vis().w+300,t0:T,d:.9,x:z.train.x};SFX.train();await sayNow('r_'+o.id);await wait(200);if(ZS===z&&z.ph===0)SC.z4.next()});return true}
  mistake();sayNow(o.d.io==='in'?'r_in':'r_out');return false},
 phaseB(){const z=ZS;z.ph=1;GOAL='';dragReset([],[],()=>false);run(async()=>{await say('r3');SC.z4.task()})},
 task(){const z=ZS;z.task++;z.si=null;z.so=null;if(z.task>=Z4T.length){GOAL='';winZone('r_win','g_z4');return}const t=Z4T[z.task];GOAL=t.goal;
  run(async()=>{await say(t.k);await say('t_pick')})},
 choose(side,id){const z=ZS,t=Z4T[z.task];if(!t||z.lock)return;
  if(side==='in'){if(id===t.i){z.si=id;SFX.pop()}else{z.si=null;mistake();sayNow('t_bad_in');return}}
  else{if(id===t.o){z.so=id;SFX.pop()}else{z.so=null;mistake();sayNow('t_bad_out');return}}
  if(z.si&&z.so){z.lock=true;z.run={t0:T};SFX.train();run(async()=>{await wait(G.fast?40:2400);z.run=null;const g2=z4geo();react(true,g2.x1-120,322+Z4OUT.indexOf(t.o)*126);burst(g2.x1-120,322+Z4OUT.indexOf(t.o)*126,40,'conf',null,.9);await say('t_ok');z.lock=false;SC.z4.task()})}},
 draw(){const z=ZS;bgDraw('rail');const g=z4geo();
  plaque('Процессор',g.px,g.py+20,260,{size:40,id:'cpu'});
  if(z.ph===0){
   for(const [io,s,lab] of [['in',g.sin,'Ввод'],['out',g.sout,'Вывод']]){const sel=DRG.sel||DRG.drag;const pu=sel?1+Math.sin(T*6)*.03:1;
    X.save();X.translate(s.x,gY()-218);X.scale(pu,pu);plaque(lab,0,0,250,{size:56,id:'st'+io});X.restore();
    spr('wagon',s.x,gY()-6,120,{ay:1});z.pile[io].forEach((id,i)=>spr(id,s.x-62+(i%4)*42,gY()-92-Math.floor(i/4)*40-(i%2)*10,70,{ay:1}));
    }
   // поезд: вагончик везёт устройство
   if(z.train){const tr=z.train;const u=clamp((T-tr.t0)/(G.fast?.03:tr.d),0,1);tr.x=lerp(tr.from,tr.to,ease(u));tr.stop=u>=1;
    const wy=g.ty+20,x=tr.x;spr('wagon',x-70,wy,82,{ay:1});spr('loco',x+85,wy,122,{ay:1});
    const o=z.cur;if(o&&!o.off){o.hx=x-70;o.hy=wy-95;if(!o.lift&&!o.ret&&!(DRG.drag&&DRG.drag.o===o)){o.x=o.hx;o.y=o.hy}stepItems();selGlow(o,86);spr(o.id,o.x,o.y+(o.lift?0:Math.sin(T*3)*3),110)}}
   if(z.cur&&z.cur.off){stepFly(z.cur);spr(z.cur.id,z.cur.x,z.cur.y,90)}}
  else{// путь информации: столбец ввода слева, вывода справа
   const t=Z4T[z.task];const L=Z4IN.map((id,i)=>({id,x:g.x0+120,y:322+i*126})),R=Z4OUT.map((id,i)=>({id,x:g.x1-120,y:322+i*126}));
   plaque('Ввод',g.x0+120,215,200,{size:44,id:'cin'});plaque('Вывод',g.x1-120,215,200,{size:44,id:'cout'});
   for(const [arr,side] of [[L,'in'],[R,'out']])for(const c of arr){const on=(side==='in'?z.si:z.so)===c.id;X.save();X.translate(c.x,c.y);if(on)X.scale(1.08,1.08);sprW('tile',0,0,122);X.restore();fitSpr(c.id,c.x,c.y,88);
    if(on){X.save();X.strokeStyle='#7dff7a';X.lineWidth=8;X.beginPath();X.roundRect(c.x-64,c.y-64,128,128,18);X.stroke();X.restore()}}
   if(z.run&&t){const a=L.find(c=>c.id===t.i),b=R.find(c=>c.id===t.o);const u=clamp((T-z.run.t0)/2.2,0,1);let x,y;
    if(u<.5){const v=ease(u*2);x=lerp(a.x,g.px,v);y=lerp(a.y,g.py,v)-Math.sin(v*Math.PI)*80}else{const v=ease((u-.5)*2);x=lerp(g.px,b.x,v);y=lerp(g.py,b.y,v)-Math.sin(v*Math.PI)*80}
    spr('sphere',x,y,90);spr(t.i==='mic'?'notes':t.i==='keyboard'?'c_note':'painting',x,y,52);if(Math.random()<.4)burst(x,y,2,'spark',190,.4);
    if(Math.abs(u-.5)<.06){X.save();X.globalAlpha=.6;X.fillStyle='#fff7a0';X.beginPath();X.arc(g.px,g.py,90,0,7);X.fill();X.restore()}}}
  drawCast()},
 ui(){const z=ZS,g=z4geo();if(z.ph===0){progDots(8,z.pile.in.length+z.pile.out.length);
   for(const [io,s] of [['in',g.sin],['out',g.sout]])UI.push({id:'st'+io,x:s.x,y:s.y+60,w:260,h:400,fn:()=>{if(DRG.drag)return;SC.z4.pick(io)}})}
  else{progDots(3,Math.max(0,z.task));if(z.task<0||z.task>=Z4T.length)return;
   Z4IN.forEach((id,i)=>UI.push({id:'in_'+id,x:g.x0+120,y:322+i*126,w:124,h:124,fn:()=>SC.z4.choose('in',id)}));Z4OUT.forEach((id,i)=>UI.push({id:'out_'+id,x:g.x1-120,y:322+i*126,w:124,h:124,fn:()=>SC.z4.choose('out',id)}))}},
 taps(ok){const z=ZS,g=z4geo();if(z.lock)return['wait'];
  if(z.ph===0){const o=z.cur;if(!o||o.off||!z.train||!z.train.stop||z.train.to!==g.cx)return['wait'];const io=ok?o.d.io:(o.d.io==='in'?'out':'in');const s=io==='in'?g.sin:g.sout;return[[s.x,s.y+60]]}
  const t=Z4T[z.task];if(!t)return['wait'];
  if(ok){const r=[];if(!z.si)r.push([g.x0+120,322+Z4IN.indexOf(t.i)*126]);if(!z.so)r.push([g.x1-120,322+Z4OUT.indexOf(t.o)*126]);return r}
  if(!z.si){const w=Z4IN.find(q=>q!==t.i);return[[g.x0+120,322+Z4IN.indexOf(w)*126]]}const w=Z4OUT.find(q=>q!==t.o);return[[g.x1-120,322+Z4OUT.indexOf(w)*126]]}});
