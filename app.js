(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var clamp=function(v,a,b){a=a==null?0:a;b=b==null?1:b;return Math.min(b,Math.max(a,v))};
  var ease=function(t){return t*t*(3-2*t)}, lerp=function(a,b,t){return a+(b-a)*t};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA='919824625024';
  var vw=innerWidth, vh=innerHeight, sy=scrollY, sp=sy, truckW=400;

  /* ---------- intro ---------- */
  var intro=$('#intro'), tStart=performance.now()+(reduce?0:1100);
  setTimeout(function(){intro.classList.add('done')}, reduce?0:1100);

  /* ---------- word-reveal text ---------- */
  $$('.words').forEach(function(el){
    var w=el.textContent.trim().split(/\s+/); el.textContent='';
    w.forEach(function(t){var s=document.createElement('span');s.textContent=t;el.appendChild(s)});
    el._w=$$('span',el);
  });
  function reveal(el,p,a,b){
    var w=el._w,n=w.length,x=clamp((p-a)/(b-a))*n;
    for(var i=0;i<n;i++) w[i].style.opacity=(.14+.86*clamp(x-i)).toFixed(3);
  }

  /* ---------- scenes ---------- */
  var sc={};
  $$('.scene').forEach(function(el){sc[el.dataset.scene]={el:el,top:0,h:0,p:0}});

  var cam=$('#cam'),sky2=$('#sky2'),sun=$('#sun'),flare=$('#flare'),mfar=$('#mfar'),mnear=$('#mnear'),
      truck=$('#truck'),dusk=$('#dusk'),copy1=$('#copy1'),copy2=$('#copy2'),w1=$('#w1'),w2=$('#w2'),hint=$('#hint');

  /* dust particles */
  var dc=$('#dust'),dx=dc.getContext('2d'),dp=[];
  function sizeDust(){
    dc.width=vw;dc.height=vh;
    dp=[];for(var i=0;i<(vw<700?26:52);i++)dp.push({x:Math.random()*vw,y:Math.random()*vh,r:Math.random()*2.2+.6,s:Math.random()*.5+.15,a:Math.random()*.5+.2});
  }
  function drawDust(){
    dx.clearRect(0,0,vw,vh);
    for(var i=0;i<dp.length;i++){var o=dp[i];o.x-=o.s;o.y-=o.s*.25;if(o.x<-5)o.x=vw+5;if(o.y<-5)o.y=vh+5;
      dx.fillStyle='rgba(255,205,120,'+o.a+')';dx.beginPath();dx.arc(o.x,o.y,o.r,0,6.283);dx.fill();}
  }

  function hero(p,now){
    var e=clamp((now-tStart)/3200), ei=1-Math.pow(1-e,3);
    var W=truckW, rest=(vw-W)/2, ex=ease(clamp(p/.6));
    var x=lerp(-W*1.15,rest,ei)+ex*(vw-rest+W*.15);
    truck.style.transform='translate3d('+x.toFixed(1)+'px,'+(Math.sin(now*.009)*.8).toFixed(2)+'px,0)';
    truck.style.setProperty('--beam',clamp((p-.15)*1.6).toFixed(2));
    cam.style.transform='scale('+(1+p*.16).toFixed(4)+')';
    sun.style.transform='translateY('+(p*20).toFixed(2)+'vh)';
    flare.style.transform='translateY('+(p*20).toFixed(2)+'vh)';
    flare.style.opacity=(.8*(1-p)).toFixed(2);
    sky2.style.opacity=clamp(p*1.3).toFixed(3);
    dusk.style.opacity=clamp((p-.1)*1.15).toFixed(3);
    mfar.style.transform='translateX('+(-p*5).toFixed(2)+'vw)';
    mnear.style.transform='translateX('+(-p*10).toFixed(2)+'vw)';
    copy1.style.opacity=(1-ease(clamp((p-.06)/.22))).toFixed(3);
    copy1.style.transform='translateY('+(-p*90).toFixed(1)+'px)';
    copy1.style.pointerEvents=p>.25?'none':'auto';
    copy2.style.opacity=ease(clamp((p-.38)/.12)).toFixed(3);
    reveal(w1,p,.46,.88);
    hint.style.opacity=(clamp(1-p*8)*.9).toFixed(2);
    drawDust();
  }

  /* ---------- network map ---------- */
  var mc=$('#map'),mx=mc.getContext('2d'),logo=new Image(),pts=[],cities=[],dimL=null,briL=null,M={s:1,cx:0,cy:0,sh:0};
  var CITY=[['Delhi',175,109],['Jaipur',165,124],['Ahmedabad',140,157],['Mumbai',142,191],['Hyderabad',185,205],['Bengaluru',178,243],['Chennai',199,242],['Kolkata',261,160],['Guwahati',286,130]];
  var ROUTES=[[0,3],[0,7],[3,5],[7,6],[2,0],[4,6],[0,8],[3,4],[1,2],[5,6]];
  logo.onload=function(){buildPts();sizeMap()};
  logo.src='assets/logo.webp';
  function buildPts(){
    var c=document.createElement('canvas');c.width=c.height=400;var x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,400,400);x.drawImage(logo,0,0,400,400);
    var d=x.getImageData(0,0,400,400).data;pts=[];
    for(var y=34;y<288;y+=3)for(var xx=103;xx<334;xx+=3){var i=(y*400+xx)*4;if(d[i]<110&&d[i+1]<130)pts.push([xx,y])}
    cities=CITY.map(function(c){var b=pts[0],bd=1e9;pts.forEach(function(p){var dd=(p[0]-c[1])*(p[0]-c[1])+(p[1]-c[2])*(p[1]-c[2]);if(dd<bd){bd=dd;b=p}});return{n:c[0],x:b[0],y:b[1]}});
  }
  function mp(px,py){return[M.cx+(px-218.5)*M.s,M.cy+(py-161)*M.s]}
  function sizeMap(){
    var dpr=Math.min(2,window.devicePixelRatio||1);
    mc.width=vw*dpr;mc.height=vh*dpr;mx.setTransform(dpr,0,0,dpr,0,0);
    if(!pts.length)return;
    var bw,bh;
    if(vw<1000){bw=vw*.94;bh=vh*.5;M.cx=vw/2;M.cy=vh*.6}else{bw=vw*.46;bh=vh*.8;M.cx=vw*.69;M.cy=vh*.52}
    M.s=Math.min(bw/231,bh/254);M.sh=254*M.s;
    function layer(fill,glow){
      var c=document.createElement('canvas');c.width=vw*dpr;c.height=vh*dpr;var x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
      x.fillStyle=fill;if(glow){x.shadowColor='#14a37a';x.shadowBlur=7}
      var r=Math.max(1,3*M.s*.3);
      pts.forEach(function(p){var q=mp(p[0],p[1]);x.beginPath();x.arc(q[0],q[1],r,0,6.283);x.fill()});
      return c;
    }
    dimL=layer('rgba(20,163,122,.3)',false);briL=layer('#6af2c4',true);
  }
  function qp(a,b,t,lift){
    var mx_=(a[0]+b[0])/2,my_=(a[1]+b[1])/2,d=Math.hypot(b[0]-a[0],b[1]-a[1]),cx=mx_,cy=my_-d*lift;
    var u=1-t;return[u*u*a[0]+2*u*t*cx+t*t*b[0],u*u*a[1]+2*u*t*cy+t*t*b[1]];
  }
  function arc(a,b,prog,lift,col,now,dash){
    if(prog<=0)return;
    mx.strokeStyle=col;mx.lineWidth=1.6;mx.setLineDash(dash?[5,6]:[]);mx.beginPath();
    for(var i=0;i<=28;i++){var t=i/28*prog,q=qp(a,b,t,lift);i?mx.lineTo(q[0],q[1]):mx.moveTo(q[0],q[1])}
    mx.stroke();mx.setLineDash([]);
    if(prog>=1){var t2=(now*.00018+a[0]*.001)%1,q2=qp(a,b,t2,lift);mx.fillStyle='#fff3c8';mx.beginPath();mx.arc(q2[0],q2[1],2.4,0,6.283);mx.fill()}
  }
  function net(p,now){
    $('#nca').style.opacity=(1-ease(clamp((p-.46)/.12))).toFixed(3);
    $('#ncb').style.opacity=ease(clamp((p-.56)/.12)).toFixed(3);
    mx.clearRect(0,0,vw,vh);
    if(!dimL)return;
    mx.drawImage(dimL,0,0,vw,vh);
    var top=M.cy-M.sh/2,ry=top+clamp(p/.4)*M.sh*1.08;
    mx.save();mx.beginPath();mx.rect(0,0,vw,ry);mx.clip();mx.drawImage(briL,0,0,vw,vh);mx.restore();
    var P=cities.map(function(c){return mp(c.x,c.y)});
    ROUTES.forEach(function(r,i){arc(P[r[0]],P[r[1]],ease(clamp((p-.24-i*.04)/.14)),.28,'rgba(255,160,60,.85)',now,false)});
    var out=[[3,[-vw*.05,vh*.3]],[6,[vw*1.05,vh*.62]],[0,[vw*.55,-vh*.05]],[7,[vw*1.05,vh*.18]]];
    out.forEach(function(o,i){arc(P[o[0]],o[1],ease(clamp((p-.6-i*.06)/.16)),.18,'rgba(255,225,150,.9)',now,true)});
    var fs=vw<700?11:13;mx.font='600 '+fs+'px Inter,sans-serif';
    cities.forEach(function(c,i){
      var q=P[i],a=clamp((p-.2-i*.015)/.08);if(a<=0)return;
      mx.globalAlpha=a;mx.fillStyle='#ffc35c';mx.beginPath();mx.arc(q[0],q[1],3+Math.sin(now*.004+i)*1,0,6.283);mx.fill();
      mx.fillStyle='rgba(255,255,255,.88)';mx.fillText(c.n,q[0]+7,q[1]-7);mx.globalAlpha=1;
    });
  }

  /* ---------- blueprint truck ---------- */
  var ribsG=$('#ribs'),NS='http://www.w3.org/2000/svg';
  for(var i=0;i<12;i++){var l=document.createElementNS(NS,'path');l.setAttribute('d','M'+(54+i*40)+' 34v94');l.setAttribute('class','ln');l.setAttribute('pathLength','1');l.setAttribute('data-d',(.06+i*.025).toFixed(3));l.setAttribute('stroke-opacity','.55');ribsG.appendChild(l)}
  var lns=$$('#bpsvg .ln'),notes=$$('.bp-notes li'),glow=$('#bpglow'),scan=$('#scanline');
  function bp(p){
    lns.forEach(function(el){el.style.strokeDashoffset=(1-ease(clamp((p-.04-(+el.dataset.d)*.5)/.3))).toFixed(3)});
    glow.style.opacity=(clamp((p-.72)/.2)*.95).toFixed(2);
    var sx=clamp(p/.7)*960-60;scan.setAttribute('x',sx.toFixed(1));scan.style.opacity=(p>.02&&p<.74?.85:0);
    notes.forEach(function(li,i){var a=ease(clamp((p-.5-i*.1)/.12));li.style.opacity=a.toFixed(2);li.style.transform='translateY('+((1-a)*16).toFixed(1)+'px)'});
  }

  /* ---------- horizontal services ---------- */
  var track=$('#track'),hsbar=$('#hsbar');
  function hs(p){var q=clamp((p-.04)/.9);track.style.transform='translate3d('+(-q*sc.hs.dist).toFixed(1)+'px,0,0)';hsbar.style.transform='scaleX('+q.toFixed(3)+')'}

  var fn={hero:hero,net:net,bp:bp,hs:hs,st:function(p){reveal(w2,p,.08,.75)}};

  /* ---------- measure ---------- */
  function measure(){
    vw=innerWidth;vh=innerHeight;
    sc.hs.dist=Math.max(0,track.scrollWidth-vw);
    sc.hs.el.style.height=(vh+sc.hs.dist+vh*.25)+'px';
    for(var k in sc){var s=sc[k];s.top=s.el.getBoundingClientRect().top+scrollY;s.h=s.el.offsetHeight}
    truckW=vw<700?vw*1.1:Math.min(vw*.62,1000);
    truck.style.setProperty('--tw',truckW+'px');
    sizeDust();sizeMap();
  }
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
  addEventListener('load',function(){measure();setTimeout(measure,800)});
  measure();

  /* ---------- loop ---------- */
  var nav=$('#nav'),prog=$('#prog');
  function frame(now){
    sy=scrollY;sp=reduce?sy:sp+(sy-sp)*.14;if(Math.abs(sy-sp)<.1)sp=sy;
    for(var k in sc){var s=sc[k];s.p=clamp((sp-s.top)/Math.max(1,s.h-vh));
      if(sp>s.top-vh&&sp<s.top+s.h)fn[k](s.p,now)}
    nav.classList.toggle('solid',sy>40);
    var doc=document.documentElement.scrollHeight-vh;
    prog.style.transform='scaleX('+(doc>0?clamp(sy/doc):0).toFixed(4)+')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- reveal on scroll ---------- */
  var els=$$('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){io.observe(el)});
  }else els.forEach(function(el){el.classList.add('in')});

  /* ---------- quote form -> WhatsApp ---------- */
  var form=$('#quoteForm');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(form),ok=true;
    ['name','from','to'].forEach(function(k){var i=form.elements[k],bad=!String(d.get(k)).trim();i.classList.toggle('bad',bad);if(bad)ok=false});
    if(!ok)return;
    var msg='Hello Super Carriers of India,\nName: '+d.get('name')+'\nPickup: '+d.get('from')+'\nDrop: '+d.get('to')+'\nService: '+d.get('service')+'\nWeight: '+(d.get('weight')||'Not sure')+'\nPlease share a quote.';
    window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener');
  });
  $('#yr').textContent=new Date().getFullYear();
})();
