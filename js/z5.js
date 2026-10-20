'use strict';
// ===== Зона 5: Город Памяти — четыре дела с информацией =====
const Z5H=[{id:'get',lab:'Получать'},{id:'store',lab:'Хранить'},{id:'send',lab:'Передавать'},{id:'proc',lab:'Обрабатывать'}];
const Z5C=[{k:'radio',s:'s_radio',a:'get',lab:'Слушаем новости'},{k:'album',s:'s_album',a:'store',lab:'Фото в альбом'},{k:'env',s:'s_envelope',a:'send',lab:'Письмо другу'},{k:'abacus',s:'s_abacus',a:'proc',lab:'Решаем пример'},
 {k:'tele',s:'s_telescope',a:'get',lab:'Смотрим на звёзды'},{k:'pigeon',s:'s_pigeon',a:'send',lab:'Голубь несёт письмо'},{k:'diary',s:'s_diary',a:'store',lab:'Пишем в дневник'},{k:'puzzle',s:'s_puzzle',a:'proc',lab:'Собираем картинку'}];
const Z5FX={get:'bell',store:'clink',send:'rocket',proc:'gear'};
function z5geo(){const x0=safeL()+heroX(cast[0])+6,x1=safeR()-6,st=(x1-x0)/4,hh=232;return{x0,x1,cx:(x0+x1)/2,cy:288,houses:Z5H.map((h,i)=>({id:h.id,lab:h.lab,x:x0+st*(i+.5),y:gY()-hh/2,w:Math.min(st-6,260),h:hh+60,hh,pw:Math.min(st-4,250)}))}}
SC.z5=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{h:360})];const z=zoneStart(5,{i:-1,card:null,anim:{}});
  run(async()=>{await wait(300);await say('c1');GOAL='Перетащи картинку к нужному домику';SC.z5.next();await say('c2')})},
 prog(){return ZS.i},
 next(){const z=ZS;z.i++;if(z.i>=Z5C.length){z.card=null;GOAL='';winZone('c_win','g_z5');return}const d=Z5C[z.i],g=z5geo();
  const o={id:d.k,d,x:g.cx,y:-120,hx:g.cx,hy:g.cy,r:80};flyTo(o,g.cx,g.cy,.5);z.card=o;SFX.whoosh();dragReset([o],g.houses,(o,t)=>SC.z5.drop(o,t));sayNow('c_'+d.k)},
 drop(o,t){const z=ZS;if(o.d.a===t.id){o.off=1;flyTo(o,t.x,t.y,.4);z.lock=true;SFX.pop();
   run(async()=>{await wait(420);z.anim[t.id]=T;SFX[Z5FX[t.id]]();burst(t.x,t.y-60,34,'spark',{get:50,store:30,send:0,proc:200}[t.id]);if(t.id==='send')for(let i=0;i<14;i++)PS.push({x:t.x,y:t.y-120,vx:rnd(-30,30),vy:rnd(-600,-350),life:1,dec:.8,kind:'spark',hue:30,s:rnd(4,8),rot:0,vr:0});
    hop('tima');pose('tima','cheer',1.2);z.card=null;z.lock=false;await sayNow('o_'+t.id);await wait(200);if(ZS===z)SC.z5.next()});return true}
  mistake();oops('tima');pose('tima','think',2);sayNow('hh_'+o.d.a);return false},
 draw(){const z=ZS;bgDraw('memory');const g=z5geo();cast[0].x=safeL()+heroX(cast[0])/2;
  g.houses.forEach((h,i)=>{const a=z.anim[h.id]?T-z.anim[h.id]:9;let sx=1,sy=1,rot=0;if(a<.8){const u=a/.8;sy=1+Math.sin(u*Math.PI*3)*.06*(1-u);sx=1/sy;if(h.id==='proc')rot=Math.sin(u*30)*.03}
   X.save();X.translate(h.x,gY());X.rotate(rot);X.scale(sx,sy);spr('h_'+h.id,0,0,h.hh,{ay:1});X.restore();
   const hl=DRG.drag||DRG.sel?1+Math.sin(T*6+i)*.03:1;X.save();X.translate(h.x,gY()-h.hh-26);X.scale(hl,hl);plaque(h.lab,0,0,h.pw,{size:38,id:'house'});X.restore()});
  drawCast();
  const o=z.card;if(o){stepItems();stepFly(o);const k=o.off?.7:1;selGlow(o,92);const bob=o.fly||o.lift?0:Math.sin(T*2.4)*4;
   X.save();X.translate(o.x,o.y+bob);X.scale(k*(o.lift?1.1:1),k*(o.lift?1.1:1));sprW('tile',0,0,170);spr(o.d.s,0,0,120);X.restore();
   if(!o.off&&!o.lift)plaque(o.d.lab,o.x,o.y+bob+108,360,{size:36,id:'card'})}},
 ui(){progDots(8,Math.max(0,ZS.i))},
 taps(ok){const z=ZS,o=z.card;if(!o||o.fly||z.lock)return['wait'];const g=z5geo();const t=g.houses.find(h=>ok?h.id===o.d.a:h.id!==o.d.a);return[[o.x,o.y],[t.x,t.y]]}});
