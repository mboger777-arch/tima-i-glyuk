'use strict';
// ===== Финал: поймать Глюка на экране, пароль антивируса, антивирус, медаль =====
const FQ=[{k:'q1',opts:['g_eye','g_ear','g_hand'],ok:'g_ear'},{k:'q2',opts:['keyboard','mic','monitor'],ok:'monitor'},{k:'q3',opts:['n_apple','c_flash','n_ball'],ok:'c_flash'}];
const FHITS=5;
function fingeo(){const x0=safeL()+heroX(cast[0])+30,x1=safeR()-(cast[1]?heroX(cast[1]):0)-30;return{x0,x1,cx:(x0+x1)/2}}
SC.fin=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{h:360}),hero('bit',0,{h:330})];const z=zoneStart(6,{ph:0,hits:0,pop:null,q:-1,clean:0,miss:0});
  run(async()=>{await wait(300);await say('f1');GOAL='Лови Глюка! Нажимай на него';z.ph=1;SC.fin.pop()})},
 prog(){const z=ZS;return z.ph*100+(z.ph===1?z.hits:z.ph===2?z.q:0)},
 pop(){const z=ZS,g=fingeo();const last=z.pop;let x,y;for(let k=0;k<10;k++){x=rnd(g.x0+70,g.x1-70);y=rnd(260,520);if(!last||Math.hypot(x-last.x,y-last.y)>260)break}z.pop={x,y,t0:T,life:G.fast?99:2.2}},
 hold(p,x,y){const z=ZS;if(locked())return;if(z.ph===1&&z.pop){const P=z.pop;if(Math.hypot(x-P.x,y-(P.y-60))<110){z.hits++;burst(P.x,P.y-60,30,'conf',null,.8);SFX.squeak();shake=8;
    if(z.hits>=FHITS){z.ph=1.5;z.pop=null;GOAL='';run(async()=>{await sayNow('f_hit2');await say('f2');SC.fin.quiz()})}else{sayNow(z.hits%2?'f_hit1':'f_hit2');SC.fin.pop()}}
   else{z.mist++;z.miss++;if(z.miss%3===1)sayNow('f_hit3')}return}
  dragHold(p,x,y)},
 quiz(){const z=ZS;z.ph=2;z.q++;if(z.q>=FQ.length){SC.fin.vac();return}GOAL='Пароль: вопрос '+(z.q+1)+' из 3';sayNow(FQ[z.q].k)},
 answer(id){const z=ZS,q=FQ[z.q];if(!q||z.lock)return;if(id===q.ok){SFX.ok();z.lock=true;run(async()=>{await sayNow('q_ok');z.lock=false;SC.fin.quiz()})}else{mistake();sayNow('q_no')}},
 vac(){const z=ZS;z.ph=3;GOAL='Перетащи антивирус к Глюку';cast.push(hero('glyuk',0,{pose:'angry',h:300}));const g=fingeo();
  const o={id:'vac',x:g.x0+110,y:gY()-90,hx:g.x0+110,hy:gY()-90,r:100};z.vacO=o;dragReset([o],[{id:'glyuk',x:g.cx+120,y:gY()-150,w:280,h:320}],(o,t)=>SC.fin.suck());sayNow('f3')},
 suck(){const z=ZS;if(z.ph!==3)return false;const o=z.vacO;o.off=1;z.lock=true;z.ph=4;z.clean=T;SFX.suck();GOAL='';
  run(async()=>{await wait(1300);pose('glyuk','');const gl=cast.find(c=>c.n==='glyuk');z.kind=1;burst(gl.dx,gY()-200,60,'spark',90);SFX.star();
   SV.fin=1;save();cast.splice(1,0,hero('klik',0));await say('f4');cheer();burst(640,250,120,'conf',null,1.5);await say('f5');z.medal=T;SFX.star();await say('f6');cheer();await say('f7');z.lock=false;z.done=true});return true},
 draw(){const z=ZS;bgDraw('screen');const g=fingeo();const L=safeL(),R=safeR();
  cast[0].x=L+heroX(cast[0])/2;const bit=cast.find(c=>c.n==='bit');bit.x=R-heroX(bit)/2;const kl=cast.find(c=>c.n==='klik');if(kl)kl.x=L+heroX(cast[0])+heroX(kl)/2-4;
  const gl=cast.find(c=>c.n==='glyuk');if(gl){gl.x=z.medal?g.x1-60:g.cx+120;if(z.kind){gl.pose='kind';gl.poseT=0}}
  if(z.ph===1&&z.pop){const P=z.pop,a=T-P.t0;if(a>P.life){SC.fin.pop()}else{const up=clamp(a/.25,0,1)*clamp((P.life-a)/.25,0,1);
    X.save();X.globalAlpha=.85;sprW('screen',P.x,P.y-60,230);X.restore();X.save();X.beginPath();X.rect(P.x-100,P.y-150,200,180);X.clip();spr(z.hits%2?'glyuk_laugh':'glyuk',P.x,P.y+20-up*150+150,170,{ay:1});X.restore()}}
  if(z.ph===2){const q=FQ[z.q];if(q){q.opts.forEach((id,i)=>{const x=g.cx+(i-1)*200,y=380;X.save();X.translate(x,y);sprW('tile',0,0,170);X.restore();spr(id,x,y,id.startsWith('g_')?140:110)})}}
  if(gl&&z.kind){gl.k=1}
  drawCast();
  if(gl&&!z.kind&&z.ph===3)DRG.targets[0]&&Object.assign(DRG.targets[0],{x:gl.dx,y:gY()-150});
  if(z.vacO){const o=z.vacO;stepItems();if(!o.off){selGlow(o,110);spr('vacuum',o.x,o.y,170,{rot:o.lift?Math.sin(T*9)*.05:0})}
   else if(gl){const u=clamp((T-z.clean)/1.2,0,1);spr('vacuum',gl.dx-200,gY()-85,170,{flip:true});if(u<1){for(let i=0;i<3;i++){const v=(u*3+i/3)%1;spr('pixels',lerp(gl.dx,gl.dx-190,v),gY()-200+v*90,120*(1-v)+20,{a:1-v})}}}}
  if(z.medal){const u=ease(clamp((T-z.medal)/.8,0,1));X.save();X.translate(g.cx-90,300);X.scale(u,u);X.rotate(Math.sin(T*2)*.06);spr('medal',0,0,230);X.restore();
   plaque('Знаток информации',g.cx-90,462,420,{size:46,id:'medal',sp:'sign4'});for(let i=0;i<5;i++)spr('star',g.cx-90+(i-2)*66,545,58,{rot:Math.sin(T*2+i)*.1})}},
 ui(){const z=ZS,g=fingeo();if(z.ph===1)progDots(FHITS,z.hits);
  if(z.ph===2){const q=FQ[z.q];if(q)q.opts.forEach((id,i)=>UI.push({id:'q_'+id,x:g.cx+(i-1)*200,y:380,w:170,h:170,fn:()=>SC.fin.answer(id)}))}
  if(z.done)boardBtn('again',safeR()-150,safeT()+62,270,'На карту',()=>go('map'),{size:46})},
 taps(ok){const z=ZS,g=fingeo();if(z.lock)return['wait'];
  if(z.ph===1&&z.pop){const P=z.pop;if(ok)return[[P.x,P.y-60]];const x=P.x<g.cx?g.x1-60:g.x0+60;return[[x,600]]}
  if(z.ph===2){const q=FQ[z.q];const i=q.opts.findIndex(o=>ok?o===q.ok:o!==q.ok);return[[g.cx+(i-1)*200,380]]}
  if(z.ph===3&&z.vacO){if(!ok)return[];const t=DRG.targets[0];return[[z.vacO.x,z.vacO.y],[t.x,t.y]]}
  return['wait']}});
