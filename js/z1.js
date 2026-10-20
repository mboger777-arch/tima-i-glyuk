'use strict';
// ===== Зона 1: Город Чувств — вещь в ворота нужного чувства =====
const DRAGSC={hold:(p,x,y)=>dragHold(p,x,y),move:(p,x,y)=>dragMove(p,x,y),up:p=>dragUp(p)};
G.prog=()=>SCN&&SCN.prog?SCN.prog():0;G.taps=ok=>SCN&&SCN.taps?SCN.taps(ok):[];
const SENSES=['eye','ear','nose','mouth','hand'];
const Z1I=[{k:'bell',s:'ear',lab:'Звенит'},{k:'lemon',s:'mouth',lab:'Кислый'},{k:'hedgehog',s:'hand',lab:'Колючий'},{k:'rainbow',s:'eye',lab:'Разноцветная'},{k:'rose',s:'nose',lab:'Пахнет'},
 {k:'drum',s:'ear',lab:'Гремит'},{k:'teddy',s:'hand',lab:'Мягкий'},{k:'lollipop',s:'mouth',lab:'Сладкий'},{k:'traffic',s:'eye',lab:'Горит зелёный'},{k:'perfume',s:'nose',lab:'Пахнет цветами'}];
const SND={bell:'bell',drum:'drum'};
function z1geo(){const t=cast[0];const x0=safeL()+heroX(t)+10,x1=safeR()-(cast[1]?heroX(cast[1]):0)-6;const gh=230,n=5,gw=Math.min(150,(x1-x0)/n-8);const step=(x1-x0)/n;
 return{gates:SENSES.map((s,i)=>({id:s,x:x0+step*(i+.5),y:gY()-gh/2,w:Math.max(gw,step-6),h:gh,gh})),cx:(x0+x1)/2,iy:320}}
SC.z1=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{h:360}),hero('glyuk',0,{h:240})];const z=zoneStart(1,{i:-1,item:null,eat:null});
  run(async()=>{await wait(300);await say('s1');pose('glyuk','laugh',2);await say('s2');GOAL='Перетащи вещь в нужные ворота';await say('s3');SC.z1.next()})},
 prog(){return ZS.i},
 next(){const z=ZS;z.i++;if(z.i>=Z1I.length){z.item=null;GOAL='';winZone('s_win','g_z1');return}
  const d=Z1I[z.i],g=z1geo();const gl=cast[1];const o={id:d.k,d,x:gl.dx||safeR()-100,y:gY()-200,hx:g.cx,hy:g.iy,r:85};z.item=o;flyTo(o,g.cx,g.iy,.6);SFX.whoosh();pose('glyuk','laugh',1);
  dragReset([o],g.gates,(o,t)=>SC.z1.drop(o,t));GOAL='Перетащи вещь в нужные ворота';
  if(SND[d.k])SFX[SND[d.k]]();sayNow('it_'+d.k)},
 drop(o,t){const z=ZS;if(t.id===o.d.s){o.off=1;flyTo(o,t.x,t.y+20,.35);z.eat={o,t,t0:T};z.lock=true;SFX.pop();
   run(async()=>{await wait(380);burst(t.x,t.y,36,'spark',{eye:200,ear:30,nose:320,mouth:0,hand:120}[t.id]);SFX.ok();hop('tima');pose('tima','cheer',1.4);z.item=null;z.eat=null;
    pose('glyuk','angry',1.5);z.lock=false;await sayNow('ok_'+t.id);await wait(200);if(ZS===z)SC.z1.next()});return true}
  mistake();oops('tima');pose('tima','think',2);sayNow('h_'+o.d.s);return false},
 draw(){const z=ZS;bgDraw('senses');const g=z1geo();cast[0].x=safeL()+heroX(cast[0])/2;cast[1].x=safeR()-heroX(cast[1])/2;
  g.gates.forEach((t,i)=>{const hl=DRG.drag||DRG.sel?Math.sin(T*6+i)*.02:0;spr('g_'+t.id,t.x,gY(),t.gh*(1+hl),{ay:1});
   // вихрь в воротах
   if(z.eat&&z.eat.t===t){X.save();X.globalAlpha=.5;X.fillStyle='#fff';X.beginPath();X.arc(t.x,t.y+20,40+Math.sin(T*20)*8,0,7);X.fill();X.restore()}});
  drawCast();
  const o=z.item;if(o){stepItems();stepFly(o);const k=z.eat?clamp(1-(T-z.eat.t0)/.4,.1,1):1;const h=150*k*(o.lift?1.12:1);selGlow(o,95);
   X.save();if(okI(IM.shadow)&&!o.lift){}spr(o.d.k,o.x,o.y+Math.sin(T*2.5)*4,h,{rot:o.lift?Math.sin(T*8)*.05:0});X.restore();
   if(k>.9)plaque(o.d.lab,o.x,o.y+h/2+32,Math.max(220,o.d.lab.length*24),{size:38,id:'lab'})}},
 ui(){progDots(Z1I.length,Math.max(0,ZS.i))},
 taps(ok){const z=ZS,o=z.item;if(!o||o.fly||z.lock)return['wait'];const g=z1geo();const want=o.d.s;const t=g.gates.find(q=>ok?q.id===want:q.id!==want);return[[o.x,o.y],[t.x,t.y]]}});
