# Настоящее перетаскивание пальцем (CDP touch): ошибка -> предмет вернулся на место; верно -> принят. Зоны 1,2,3,5 и антивирус в финале.
import asyncio,os
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:18691/index.html')
VPS=[tuple(map(int,v.split('x'))) for v in os.environ.get('VPS','844x390,667x375,932x430').split(',')]
async def main():
  F=[];R=[]
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in VPS:
      ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=1)
      pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      cdp=await ctx.new_cdp_session(pg)
      await pg.goto(URL);await pg.wait_for_function('G.scene==="title"',timeout=40000)
      await pg.evaluate('G.fast=true;G.mute=true;SV.open=6;SV.stars=[1,1,1,1,1]')
      async def drag(a,c):
        A=await pg.evaluate(f'G.pg({a[0]},{a[1]})');C=await pg.evaluate(f'G.pg({c[0]},{c[1]})')
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':A['x'],'y':A['y']}]})
        for i in range(1,13):
          x=A['x']+(C['x']-A['x'])*i/12;y=A['y']+(C['y']-A['y'])*i/12
          await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]});await pg.wait_for_timeout(16)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(500)
      for sc in ['z1','z2','z3','z5','fin']:
        await pg.evaluate(f'G.go("{sc}")')
        if sc=='fin':await pg.wait_for_timeout(300);await pg.evaluate('SC.fin.vac()')
        ok=False
        for k in range(80):
          L=await pg.evaluate('G.taps(false)')
          if L and L!=['wait'] and len(L)==2:ok=True;break
          if sc=='fin':ok=True;break
          await pg.wait_for_timeout(150)
        if not ok:F.append(f'{W}x{H} {sc}: no draggable');continue
        if sc!='fin':
          m0=await pg.evaluate('ZS.mist');p0=await pg.evaluate('G.prog()');home=L[0]
          await drag(L[0],L[1]);await pg.wait_for_timeout(400)
          m1=await pg.evaluate('ZS.mist')
          L2=await pg.evaluate('G.taps(true)')
          if m1<=m0:F.append(f'{W}x{H} {sc}: wrong drag not counted')
          if L2 and L2!=['wait'] and (abs(L2[0][0]-home[0])>3 or abs(L2[0][1]-home[1])>3):F.append(f'{W}x{H} {sc}: item not back home {L2[0]} vs {home}')
        else:
          p0=await pg.evaluate('G.prog()')
        L2=await pg.evaluate('G.taps(true)')
        await drag(L2[0],L2[1]);await pg.wait_for_timeout(500)
        p1=await pg.evaluate('G.prog()')
        if p1==p0:F.append(f'{W}x{H} {sc}: correct drag not accepted (prog {p0})')
        else:R.append(f'{W}x{H} {sc}: drag ok')
      if errs:F.append(f'{W}x{H} errors {errs[:3]}')
      await ctx.close()
    await b.close()
  print('\n'.join(R));print('FAILS:',len(F));print('\n'.join(F))
asyncio.run(main())
