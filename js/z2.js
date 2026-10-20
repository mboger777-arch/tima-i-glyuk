'use strict';
// ===== Зона 2: Библиотека Сундуков — виды информации, затем носители =====
const Z2T=['text','num','sound','pic'];const Z2L={text:'Текст',num:'Числа',sound:'Звуки',pic:'Картинки'};
const Z2W=[[{t:'text',w:'КОТ'},{t:'num',w:'25'},{t:'sound',s:'notes',fx:'melody'},{t:'pic',s:'painting'}],
 [{t:'pic',s:'c_photo'},{t:'sound',s:'bell',fx:'bell'},{t:'num',w:'7+3'},{t:'text',w:'Привет!'}]];
const Z2C=[{k:'c_book',ok:1,v:'lc_book'},{k:'n_apple'},{k:'c_flash',ok:1,v:'lc_flash'},{k:'n_sock'},{k:'n_ball'},{k:'c_disc',ok:1,v:'lc_disc'},{k:'n_cup'},{k:'c_note',ok:1,v:'lc_note'}];
function z2geo(){const x0=safeL()+heroX(cast[0])+10,x1=safeR()-heroX(cast[1])-6;const step=(x1-x0)/4;const ch=200;
 return{x0,x1,chests:Z2T.map((t,i)=>({id:t,x:x0+step*(i+.5),y:gY()-ch/2,w:Math.min(step-8,200),h:ch+70,ch})),sy:325,step}}
SC.z2=Object.assign({},DRAGSC,{enter(){cast=[hero('tima',0,{h:360}),hero('bit',0,{h:340})];const z=zoneStart(2,{ph:0,wave:-1,items:[],done:0,stored:0});
  run(async()=>{await wait(300);await say('l1');await say('l2');GOAL='Перетащи шарик в нужный сундук';SC.z2.wave();await say('l3')})},
 prog(){return ZS.ph*100+ZS.done},
 wave(){const z=ZS;z.wave++;const g=z2geo();z.items=Z2W[z.wave].map((d,i)=>{const x=g.x0+g.step*(i+.5);return{id:'s'+i,d,x,y:-120,hx:x,hy:g.sy,r:66}});
  z.items.forEach((o,i)=>{o.x=o.hx;o.y=-100;flyTo(o,o.hx,o.hy,.5+i*.12)});SFX.whoosh();dragReset(z.items,g.chests,(o,t)=>SC.z2.drop(o,t));
  DRG.onTap=o=>{if(o.d.fx)SFX[o.d.fx]()}},
 drop(o,t){const z=ZS;if(z.ph===0){if(o.d.t===t.id){o.off=1;flyTo(o,t.x,t.y-20,.35);o.gone=T+.35;z.done++;SFX.pop();setTimeout(()=>{if(ZS===z){burst(t.x,t.y-40,30,'spark',50);SFX.ok()}},G.fast?20:350);
    sayNow('lt_'+t.id);hop('tima');if(z.items.every(q=>q.off)){z.lock=true;run(async()=>{await wait(600);z.lock=false;if(z.wave<1)SC.z2.wave();else SC.z2.phaseB()})}return true}
   mistake();oops('tima');sayNow('lw_'+o.d.t);return false}
  // носители
  if(o.d.ok){o.off=1;const v=z.vault;flyTo(o,v.x,v.y,.4);o.gone=T+.4;z.stored++;SFX.pop();setTimeout(()=>{if(ZS===z){burst(v.x,v.y,30,'spark',45);SFX.clink()}},G.fast?20:400);sayNow(o.d.v);hop('bit');
   if(z.stored>=4){z.lock=true;run(async()=>{await wait(500);z.lock=false;GOAL='';await winZone('l_win','g_z2')})}return true}
  mistake();oops('bit');sayNow('lc_no');return false},
 phaseB(){const z=ZS;z.ph=1;z.done=0;GOAL='';const g=z2geo();
  run(async()=>{await say('l4');const vx=g.x1-120,vh=270;z.vault={id:'vault',x:vx,y:gY()-vh/2,w:250,h:vh,vh};
   const ax0=g.x0,ax1=vx-140,st=(ax1-ax0)/4;z.items=Z2C.map((d,i)=>{const x=ax0+st*((i%4)+.5),y=i<4?300:450;return{id:d.k,d,x,y:-100,hx:x,hy:y,r:58}});
   z.items.forEach((o,i)=>flyTo(o,o.hx,o.hy,.4+i*.07));SFX.whoosh();dragReset(z.items,[z.vault],(o,t)=>SC.z2.drop(o,t));DRG.onTap=null;
   GOAL='Положи в хранилище только носители';await say('l5')})},
 draw(){const z=ZS;bgDraw('library');X.fillStyle='rgba(10,10,40,.18)';const v=vis();X.fillRect(v.x0,v.y0,v.w,v.h);const g=z2geo();
  cast[0].x=safeL()+heroX(cast[0])/2;cast[1].x=safeR()-heroX(cast[1])/2;
  if(z.ph===0){g.chests.forEach(t=>{spr('ch_'+t.id,t.x,gY(),t.ch,{ay:1});plaque(Z2L[t.id],t.x,gY()-t.ch-34,Math.min(t.w+30,230),{size:40,id:'chest'})})}
  else if(z.vault){const t=z.vault;spr('h_store',t.x,gY(),t.vh,{ay:1});plaque('Хранилище',t.x,gY()-t.vh-30,250,{size:40,id:'vault'})}
  drawCast();stepItems();
  for(const o of z.items){stepFly(o);if(o.gone&&T>o.gone)continue;const k=o.gone?clamp((o.gone-T)/.35,.15,1):1;const r=o.r*k*(o.lift?1.12:1);const bob=o.fly||o.lift?0:Math.sin(T*2+o.hx)*5;selGlow(o,r+16);
   if(z.ph===0){spr('sphere',o.x,o.y+bob,r*2.2);const d=o.d;
    if(d.s)spr(d.s,o.x,o.y+bob,r*1.25);else{X.save();X.translate(o.x,o.y+bob);X.scale(k,k);textIn(d.w,0,0,o.r*1.6,o.r*1.1,d.t==='num'?62:46,d.t==='num'?'#ffe066':'#ffffff',{f:d.t==='num'?NUM:FONT,st:'#1a2a6a',lw:7,id:'sph',min:24});X.restore()}}
   else spr(o.d.k,o.x,o.y+bob,r*2)}},
 ui(){const z=ZS;if(z.ph===0)progDots(8,z.done);else progDots(4,z.stored)},
 taps(ok){const z=ZS;const it=z.items.filter(o=>!o.off&&!o.fly);if(z.lock||!it.length||(z.ph===1&&!z.vault))return['wait'];
  if(z.ph===0){const o=it[0];const g=z2geo();const t=g.chests.find(c=>ok?c.id===o.d.t:c.id!==o.d.t);return[[o.x,o.y],[t.x,t.y]]}
  const o=it.find(q=>ok?q.d.ok:!q.d.ok);if(!o)return[];return[[o.x,o.y],[z.vault.x,z.vault.y]]}});
