/* SVARA shared engine: nav, bag + wishlist across pages, quick view, cursor, grain,
   scroll films (2x2 WebP sprite sheets), section transitions and the page-to-page pallu sweep. */
(function(){
  "use strict";
  var S=window.SVARA={};
  var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var mqMobile=matchMedia("(max-width:760px)");
  S.$=$;S.$$=$$;S.clamp=clamp;S.reduce=reduce;S.mqMobile=mqMobile;
  S.rupee=function(n){return "₹"+n.toLocaleString("en-IN")};
  var DATA=window.SVARA_DATA||{products:[],posts:[]};
  var byId={};DATA.products.forEach(function(p){byId[p.id]=p});
  S.product=function(id){return byId[id]};
  function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  S.load=load;S.save=save;

  /* ---------- grain ---------- */
  var grain=$("#grain");
  if(grain){var c=document.createElement("canvas");c.width=c.height=160;var x=c.getContext("2d"),d=x.createImageData(160,160);for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);grain.style.backgroundImage="url("+c.toDataURL()+")"}

  /* ---------- toast ---------- */
  var toastEl=$("#toast"),tt;
  S.toast=function(m){if(!toastEl)return;toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove("show")},2600)};

  /* ---------- bag + wishlist (kept per browser across pages) ---------- */
  var bag=load("svara-bag",[]).filter(function(id){return byId[id]});
  var wish=load("svara-wish",{});
  var listeners=[];
  S.onBag=function(fn){listeners.push(fn)};
  function renderBag(){
    var c=$("#bagCount");if(c){c.textContent=bag.length;c.classList.toggle("show",bag.length>0)}
    var it=$("#bagItems");
    if(it)it.innerHTML=bag.length?bag.map(function(id,k){var p=byId[id];return '<div class="bitem"><img src="'+p.a+'" alt=""><div><h4>'+p.n+'</h4><small>'+p.w+' · '+p.c+'</small></div><div class="r"><b>'+S.rupee(p.p)+'</b><button data-rm="'+k+'">Remove</button></div></div>'}).join(""):'<p class="empty">Your bag is empty. Choose a saree to begin.</p>';
    var sum=bag.reduce(function(a,id){return a+byId[id].p},0),t=$("#bagTotal");if(t)t.textContent=S.rupee(sum);
    var GOAL=25000,pt=$("#bagProgTxt");
    if(pt){pt.innerHTML=sum>=GOAL?"Your sarees arrive in a carved <b>rosewood trousseau box</b>, on us.":"Add "+S.rupee(GOAL-sum)+" more for a complimentary <b>rosewood trousseau box</b>.";$("#bagProgBar").style.width=Math.min(100,sum/GOAL*100)+"%";$("#bagProg").classList.toggle("done",sum>=GOAL)}
    listeners.forEach(function(fn){fn(bag)});
  }
  S.addBag=function(id){if(!byId[id])return;bag.push(id);save("svara-bag",bag);renderBag();S.toast(byId[id].n+" added to your bag")};
  S.isWished=function(id){return !!wish[id]};
  S.toggleWish=function(id){wish[id]=!wish[id];if(!wish[id])delete wish[id];save("svara-wish",wish);S.toast(wish[id]?"Saved to your wishlist":"Removed from your wishlist");return !!wish[id]};
  var scrim=$("#scrim"),bagEl=$("#bag");
  function openBag(){if(!bagEl)return;bagEl.classList.add("open");scrim.classList.add("open");bagEl.setAttribute("aria-hidden","false");$("#bagClose").focus()}
  function closeBag(){if(!bagEl)return;bagEl.classList.remove("open");scrim.classList.remove("open");bagEl.setAttribute("aria-hidden","true")}
  S.openBag=openBag;
  if(bagEl){
    $("#bagBtn").addEventListener("click",openBag);$("#bagClose").addEventListener("click",closeBag);scrim.addEventListener("click",closeBag);
    $("#bagItems").addEventListener("click",function(e){var b=e.target.closest("[data-rm]");if(b){bag.splice(+b.dataset.rm,1);save("svara-bag",bag);renderBag()}});
    $("#checkout").addEventListener("click",function(){S.toast(bag.length?"Checkout is switched off on this concept site":"Add a saree to your bag first")});
  }
  renderBag();

  /* ---------- product cards (shared markup) ---------- */
  S.cardHTML=function(p,k){
    return '<article class="prod" style="animation-delay:'+((k||0)*70)+'ms"><div class="ph" data-open="'+p.id+'" data-cursor="View">'+
      '<img class="a" src="'+p.a+'" alt="'+p.n+' saree, '+p.c+'" loading="lazy"'+(p.aPos?' style="object-position:'+p.aPos+'"':'')+'>'+
      '<img class="b" src="'+p.b+'" alt="" loading="lazy"'+(p.bPos?' style="object-position:'+p.bPos+'"':'')+'>'+
      (p.badge?'<span class="badge">'+p.badge+'</span>':'')+
      '<button class="heart'+(wish[p.id]?' on':'')+'" data-wish="'+p.id+'" aria-label="Save '+p.n+'" aria-pressed="'+!!wish[p.id]+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg></button>'+
      '<button class="add" data-add="'+p.id+'">Add to Bag</button></div>'+
      '<div class="row"><h3><button data-open="'+p.id+'">'+p.n+'</button></h3><span class="price">'+S.rupee(p.p)+'</span></div>'+
      '<p class="sub">'+p.w+' · '+p.c+'</p><div class="swatch" aria-hidden="true">'+p.sw.map(function(c){return '<i style="background:'+c+'"></i>'}).join("")+'</div></article>';
  };
  S.bindGrid=function(grid){
    grid.addEventListener("click",function(e){
      var a=e.target.closest("[data-add]"),w=e.target.closest("[data-wish]"),o=e.target.closest("[data-open]");
      if(a){e.stopPropagation();S.addBag(a.dataset.add);return}
      if(w){e.stopPropagation();var on=S.toggleWish(w.dataset.wish);w.classList.toggle("on",on);w.setAttribute("aria-pressed",on);return}
      if(o)S.openQuick(o.dataset.open);
    });
  };

  /* ---------- quick view ---------- */
  var modal=$("#modal"),qid=null,lastFocus;
  S.openQuick=function(id){
    var p=byId[id];if(!p||!modal)return;qid=id;lastFocus=document.activeElement;
    var img=$("#qImg");img.src=p.a;img.alt=p.n+" saree";img.style.objectPosition=p.aPos||"";
    $("#qThumbs").innerHTML=[p.a,p.b].map(function(s,k){return '<button class="'+(k?"":"on")+'" data-src="'+s+'" aria-label="View image '+(k+1)+'"><img src="'+s+'" alt=""></button>'}).join("");
    $("#qTag").textContent=p.w+" · "+p.occ;$("#qTitle").textContent=p.n;$("#qPrice").textContent=S.rupee(p.p);$("#qDesc").textContent=p.d;
    $("#qSpec").innerHTML=p.spec.map(function(s){return "<dt>"+s[0]+"</dt><dd>"+s[1]+"</dd>"}).join("");
    modal.classList.add("open");$("#qClose").focus();
  };
  function closeQ(){if(!modal||!modal.classList.contains("open"))return;modal.classList.remove("open");if(lastFocus)lastFocus.focus()}
  if(modal){
    $("#qThumbs").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;$$("button",this).forEach(function(x){x.classList.toggle("on",x===b)});var im=$("#qImg");im.style.opacity=0;setTimeout(function(){im.src=b.dataset.src;im.style.objectPosition="";im.style.opacity=1},220)});
    $("#qClose").addEventListener("click",closeQ);modal.addEventListener("click",function(e){if(e.target===modal)closeQ()});
    $("#qAdd").addEventListener("click",function(){S.addBag(qid);closeQ()});
  }

  /* ---------- zari magnifier in quick view ---------- */
  var gal=modal&&$(".gal",modal);
  if(gal&&matchMedia("(hover:hover) and (pointer:fine)").matches){
    var lens=document.createElement("div");lens.className="lens";lens.setAttribute("aria-hidden","true");gal.appendChild(lens);
    gal.addEventListener("pointermove",function(e){if(e.target.closest(".thumbs")){lens.classList.remove("on");return}var im=$("#qImg"),r=gal.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      lens.style.backgroundImage="url("+im.currentSrc+")";
      // the image is object-fit:cover; map the pointer into the source image and zoom 2.6x
      var iw=im.naturalWidth,ih=im.naturalHeight,s=Math.max(r.width/iw,r.height/ih),dw=iw*s,dh=ih*s,ox2=(r.width-dw)/2,oy=(r.height-dh)/2,Z=2.6;
      lens.style.backgroundSize=(dw*Z)+"px "+(dh*Z)+"px";
      lens.style.backgroundPosition=(-(x-ox2)*Z+90)+"px "+(-(y-oy)*Z+90)+"px";
      lens.style.transform="translate("+(x-90)+"px,"+(y-90)+"px)";lens.classList.add("on")});
    gal.addEventListener("pointerleave",function(){lens.classList.remove("on")});
  }

  /* ---------- drawer, search ---------- */
  var drawer=$("#drawer");
  function closeDrawer(){if(drawer){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true")}}
  if(drawer){$("#menuBtn").addEventListener("click",function(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false")});$("#closeDrawer").addEventListener("click",closeDrawer)}
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeQ();closeDrawer();closeBag();if(S.onEscape)S.onEscape()}});
  var sb=$("#searchBtn");if(sb)sb.addEventListener("click",function(){if(document.body.dataset.page==="sarees"){var t=$("#catalogue");if(t)scrollTo({top:t.getBoundingClientRect().top+scrollY-80,behavior:reduce?"auto":"smooth"})}else go("sarees.html")});

  /* ---------- in-page anchors ---------- */
  document.addEventListener("click",function(e){
    var a=e.target.closest('a[href^="#"]');if(!a)return;var h=a.getAttribute("href");if(h.length<2)return;var t=$(h);if(!t)return;
    e.preventDefault();closeDrawer();
    var y=t.getBoundingClientRect().top+scrollY-(t.classList.contains("film")?0:70);
    scrollTo({top:y,behavior:reduce?"auto":"smooth"});
  });

  /* ---------- copy buttons, newsletter ---------- */
  $$("[data-copy]").forEach(function(btn){btn.addEventListener("click",function(){
    var src=$(btn.dataset.copy),t=src.textContent,done=function(){btn.textContent="Copied";setTimeout(function(){btn.textContent="Copy"},1600)};
    function sel(){var r=document.createRange();r.selectNodeContents(src);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent="Selected"}
    try{navigator.clipboard.writeText(t).then(done,sel)}catch(_){sel()}
  })});
  var lf=$("#letterForm");
  if(lf)lf.addEventListener("submit",function(e){e.preventDefault();var v=$("#email").value.trim(),n=$("#letterNote");
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){n.textContent="Enter an email address like name@example.com.";return}
    n.textContent="Thank you. Your first letter arrives with the next festival edit.";$("#email").value=""});

  /* ---------- cursor ---------- */
  var cursor=$("#cursor"),cl=$("#cursorLabel"),mx=-100,my=-100,cx=-100,cy=-100;
  if(cursor&&matchMedia("(hover:hover) and (pointer:fine)").matches&&!reduce){
    addEventListener("pointermove",function(e){mx=e.clientX;my=e.clientY;cursor.style.opacity=1;var t=e.target.closest&&e.target.closest("[data-cursor]");if(t){cl.textContent=t.dataset.cursor;cursor.classList.add("big")}else cursor.classList.remove("big")},{passive:true});
    document.addEventListener("pointerleave",function(){cursor.style.opacity=0});
  }

  /* ---------- films ---------- */
  var MAN=window.MANIFEST||{},TILE=2,PER=4,reels={};
  // Each film loads twice: small preview sheets first (so it plays at once), then the full-HD
  // sheets (every frame at 1920x1080), which replace the previews as soon as each one arrives.
  S.reel=function(clip,onProgress){
    if(reels[clip])return reels[clip];
    var m=MAN[clip],r=reels[clip]={sd:new Array(m.sheets),sdOk:[],hd:new Array(m.sheets),hdOk:[],loaded:0,count:m.sheets,n:m.n};
    function load(dir,arr,ok,each,done){
      var next=0,fin=0;
      function one(){if(next>=m.sheets)return;var k=next++,img=new Image();img.decoding="async";
        function end(){fin++;if(each)each(fin);if(fin===m.sheets)done();else one()}
        img.onload=function(){(img.decode?img.decode():Promise.resolve()).catch(function(){}).then(function(){ok[k]=true;end()})};
        img.onerror=end;img.src=dir+"/"+clip+"-"+String(k+1).padStart(2,"0")+".webp";arr[k]=img}
      for(var c=0;c<4;c++)one();
    }
    r.promise=new Promise(function(res){
      load("film-sd",r.sd,r.sdOk,function(n){r.loaded=n;if(onProgress)onProgress(n/r.count)},function(){res();hdQueue.push(function(next){load("film-hd",r.hd,r.hdOk,null,next)});pump()});
    });
    return r;
  };
  var hdQueue=[],hdBusy=false;
  function pump(){if(hdBusy||!hdQueue.length)return;hdBusy=true;hdQueue.shift()(function(){hdBusy=false;S.films.forEach(function(f){f.drawn=-1});pump()})}
  S.films=$$(".film").map(function(el){
    var clips=el.dataset.clips.split(",");
    var f={el:el,clips:clips,focal:parseFloat(el.dataset.focal||".5"),canvas:$("canvas",el),poster:$(".poster",el),caps:$$(".cap",el),chapters:$$(".chapters span",el),
      n:clips.reduce(function(a,c){return a+MAN[c].n},0),cur:0,target:0,drawn:-1,p:0,started:false};
    f.ctx=f.canvas.getContext("2d");return f;
  });
  S.filmsEnabled=true;
  S.startFilm=function(f){if(f.started)return;f.started=true;f.clips.forEach(function(c){S.reel(c)})};
  function frameAt(f,i){
    var k=0;
    for(var c=0;c<f.clips.length;c++){
      var clip=f.clips[c],n=MAN[clip].n;
      if(i<k+n){
        var r=reels[clip];if(!r)return null;var j=i-k;
        for(var d=0;d<n;d++){var cand=[j-d,j+d];for(var q=0;q<2;q++){var x=cand[q];if(x<0||x>=n)continue;var s=Math.floor(x/PER);var hdo=r.hdOk[s];if(hdo||r.sdOk[s]){var pos=x%PER;return {img:hdo?r.hd[s]:r.sd[s],col:pos%TILE,row:Math.floor(pos/TILE),id:clip+x+(hdo?"h":"s")}}}}
        return null;
      }
      k+=n;
    }
    return null;
  }
  function sizeCanvas(f){var dpr=Math.min(devicePixelRatio||1,2),w=f.canvas.clientWidth,h=f.canvas.clientHeight;if(f.canvas.width!==Math.round(w*dpr)||f.canvas.height!==Math.round(h*dpr)){f.canvas.width=Math.round(w*dpr);f.canvas.height=Math.round(h*dpr);f.drawn=-1}}
  function draw(f){
    var fr=frameAt(f,Math.round(f.cur));if(!fr||fr.id===f.drawn)return;
    var iw=fr.img.naturalWidth/TILE,ih=fr.img.naturalHeight/TILE,cw=f.canvas.width,ch=f.canvas.height,s=Math.max(cw/iw,ch/ih),w=iw*s,h=ih*s;
    f.ctx.imageSmoothingEnabled=true;f.ctx.imageSmoothingQuality="high";
    f.ctx.drawImage(fr.img,fr.col*iw,fr.row*ih,iw,ih,Math.round((cw-w)*f.focal),Math.round((ch-h)/2),Math.round(w),Math.round(h));f.drawn=fr.id;
    if(f.poster&&!f.poster.classList.contains("off"))f.poster.classList.add("off");
  }
  function caps(f){
    var p=f.p;
    f.caps.forEach(function(c){
      var a=parseFloat(c.dataset.in),b=parseFloat(c.dataset.out),fade=.07,o,inPhase;
      if(p<a){o=0;inPhase=true}else if(p<=b){o=a===0?1:clamp((p-a)/fade,0,1);inPhase=true}else{o=clamp(1-(p-b)/fade,0,1);inPhase=false}
      var ty=Math.round((1-o)*30*(inPhase?1:-1)),cent=c.classList.contains("center")&&mqMobile.matches;
      c.style.opacity=o.toFixed(3);
      c.style.transform=ty===0?(cent?"translateX(-50%)":"none"):(cent?"translateX(-50%) ":"")+"translateY("+ty+"px)";
      c.style.pointerEvents=o>.5?"auto":"none";
    });
    f.chapters.forEach(function(s){var a=+s.dataset.a,b=+s.dataset.b,q=clamp((p-a)/(b-a),0,1);s.querySelector("i").style.width=(q*100)+"%";s.classList.toggle("on",p>=a&&p<b)});
  }
  S.films.forEach(caps);
  addEventListener("resize",function(){S.films.forEach(function(f){f.drawn=-1})});

  /* ---------- pallu sweep + smoke ---------- */
  var sw=$("#sweep"),sx=sw&&sw.getContext("2d"),silk=new Image(),silkPat=null;
  if(sx){silk.onload=function(){silkPat=sx.createPattern(silk,"repeat");if(S._pendingSweep!=null)drawSweep(S._pendingSweep)};silk.src="img/silk.webp"}
  var smk=$("#smokefx"),veil=smk&&$(".veil",smk),s1=smk&&$(".s1",smk),s2=smk&&$(".s2",smk);
  var GOLD=["#7d5a26","#e9cb85","#a9803a","#f6dea0","#8f6a2c","#d9b468"];
  function goldGrad(L,ph){var g=sx.createLinearGradient(0,-L,0,L),n=16;for(var i=0;i<=n;i++)g.addColorStop(i/n,GOLD[(i+Math.floor(ph*3))%GOLD.length]);return g}
  function drawSweep(t){
    if(!sx)return;S._pendingSweep=t;
    if(t<0){if(sw.classList.contains("on")){sw.classList.remove("on");sx.setTransform(1,0,0,1,0,0);sx.clearRect(0,0,sw.width,sw.height)}return}
    sw.classList.add("on");
    var dpr=Math.min(devicePixelRatio||1,1.5),W=innerWidth,H=innerHeight;
    if(sw.width!==Math.round(W*dpr)||sw.height!==Math.round(H*dpr)){sw.width=Math.round(W*dpr);sw.height=Math.round(H*dpr)}
    sx.setTransform(dpr,0,0,dpr,0,0);sx.clearRect(0,0,W,H);
    var D=Math.hypot(W,H),w=D*1.9,L=D/2+80,B=Math.max(26,D*0.024),T=Math.max(18,B*0.75);
    var e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;e=t*0.55+e*0.45;
    var c=-(D/2+w/2+120)+(D+w+240)*e,ph=t*8;
    sx.translate(W/2,H/2);sx.rotate(-0.18);
    function edge(y,side){var a=D*(side>0?0.045:0.03);return c+side*w/2+a*Math.sin(y/D*5.2+ph*(side>0?1:1.4))+a*0.45*Math.sin(y/D*12.5-ph*1.8)}
    var ys=[];for(var y=-L;y<=L;y+=10)ys.push(y);
    sx.beginPath();ys.forEach(function(y,i){var x=edge(y,1);i?sx.lineTo(x,y):sx.moveTo(x,y)});for(var i=ys.length-1;i>=0;i--)sx.lineTo(edge(ys[i],-1),ys[i]);sx.closePath();
    sx.save();sx.shadowColor="rgba(0,0,0,.55)";sx.shadowBlur=36;sx.shadowOffsetX=10;
    if(silkPat){var sc=Math.max(.5,D/3400);silkPat.setTransform(new DOMMatrix().translate(c*0.92,ph*6).scale(sc))}
    sx.fillStyle=silkPat||"#8e1c1f";sx.fill();sx.restore();
    sx.save();sx.clip();
    var g=sx.createLinearGradient(c-w/2,0,c+w/2,0),folds=9;
    for(var k=0;k<=folds*2;k++){var u=k/(folds*2),wob=Math.sin(u*20+ph)*0.012;g.addColorStop(clamp(u+wob,0,1),k%2?"rgba(255,214,170,.10)":"rgba(20,4,2,.38)")}
    sx.fillStyle=g;sx.fillRect(c-w/2-200,-L,w+400,2*L);
    var gs=sx.createLinearGradient(0,-L,0,L);gs.addColorStop(0,"rgba(0,0,0,.25)");gs.addColorStop(.5,"rgba(255,230,190,.06)");gs.addColorStop(1,"rgba(0,0,0,.3)");
    sx.fillStyle=gs;sx.fillRect(c-w/2-200,-L,w+400,2*L);sx.restore();
    var gg=goldGrad(L,ph);
    [1,-1].forEach(function(side){
      sx.beginPath();ys.forEach(function(y,i){var x=edge(y,side);i?sx.lineTo(x,y):sx.moveTo(x,y)});for(var i=ys.length-1;i>=0;i--)sx.lineTo(edge(ys[i],side)-side*B,ys[i]);sx.closePath();sx.fillStyle=gg;sx.fill();
      sx.beginPath();for(var y=-L;y<L;y+=T){var x0=edge(y,side)-side*B,x1=edge(y+T,side)-side*B,xm=edge(y+T/2,side)-side*(B+T*0.95);sx.moveTo(x0,y);sx.lineTo(xm,y+T/2);sx.lineTo(x1,y+T)}sx.closePath();sx.fill();
      sx.strokeStyle="rgba(70,30,12,.55)";sx.lineWidth=1.2;
      [0.34,0.66].forEach(function(f){sx.beginPath();ys.forEach(function(y,i){var x=edge(y,side)-side*B*f;i?sx.lineTo(x,y):sx.moveTo(x,y)});sx.stroke()});
      sx.fillStyle="rgba(90,40,14,.6)";for(var y2=-L;y2<L;y2+=T){sx.beginPath();sx.arc(edge(y2,side)-side*B*0.5,y2,1.6,0,6.283);sx.fill()}
    });
    sx.strokeStyle="rgba(214,176,104,.8)";sx.lineWidth=1;sx.beginPath();
    for(var y3=-L;y3<L;y3+=4){var xx=edge(y3,-1),len=12+9*Math.sin(y3*.37+ph*3)+5*Math.sin(y3*.11);sx.moveTo(xx,y3);sx.lineTo(xx-len,y3+len*0.25)}
    sx.stroke();
  }
  S.drawSweep=drawSweep;
  function smoke(t){
    if(!smk)return;
    if(t<0){if(smk.classList.contains("on")){smk.classList.remove("on");veil.style.backdropFilter=veil.style.webkitBackdropFilter=""}return}
    smk.classList.add("on");
    var b=Math.min(1,Math.sin(Math.PI*t)*1.15);
    veil.style.opacity=(b*0.86).toFixed(3);
    s1.style.opacity=(b*0.62).toFixed(3);
    s1.style.transform="translate3d("+((t-.5)*-8)+"%,"+((1-t)*60-30)+"%,0) scale("+(1.3+t*.4).toFixed(3)+")";
    s2.style.opacity=(Math.pow(b,1.6)*0.45).toFixed(3);
    s2.style.transform="translate3d("+((t-.5)*10)+"%,"+((1-t)*80-40)+"%,0) scale(-1.8,1.8)";
  }
  // skip boundaries that sit inside the first screen: nothing to transition from yet
  var trs=$$("[data-tr]").map(function(el){return {el:el,type:el.dataset.tr}}).filter(function(tr){return tr.el.getBoundingClientRect().top+scrollY>innerHeight*1.05});
  var pageAnim=null; // when a page-to-page sweep is running it owns the canvas
  function transitions(vh){
    if(reduce||pageAnim)return;
    var st=-1,mt=-1;
    trs.forEach(function(tr){var top=tr.el.getBoundingClientRect().top,q=(vh-top)/vh;
      if(tr.type==="sweep"){q=(q-.12)/.76;if(q>0&&q<1)st=q}else{q=(q-.3)/.4;if(q>0&&q<1)mt=q}});
    drawSweep(st);smoke(mt);
  }

  /* ---------- page-to-page pallu sweep ---------- */
  function animate(from,to,ms,done){
    var t0=performance.now();
    pageAnim=true;
    (function step(now){var k=clamp((now-t0)/ms,0,1);drawSweep(from+(to-from)*k);if(k<1)requestAnimationFrame(step);else done()})(t0);
  }
  function go(href){
    if(reduce){location.href=href;return}
    try{sessionStorage.setItem("svara-pt","1")}catch(e){}
    closeDrawer();
    animate(0.08,0.5,700,function(){location.href=href});
  }
  S.go=go;
  document.addEventListener("click",function(e){
    var a=e.target.closest("a[href]");if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank")return;
    var h=a.getAttribute("href");
    if(!/^(index|sarees|muhurtham|story|journal|contact)\.html(#[\w-]+)?$/.test(h))return;
    var cur=(location.pathname.split("/").pop()||"index.html");
    var page=h.split("#")[0];
    if(page===cur||(cur===""&&page==="index.html")){ // same page: let the hash handler do it
      var hash=h.split("#")[1];if(hash){var t=document.getElementById(hash);if(t){e.preventDefault();scrollTo({top:t.getBoundingClientRect().top+scrollY-70,behavior:reduce?"auto":"smooth"});history.replaceState(null,"","#"+hash);window.dispatchEvent(new HashChangeEvent("hashchange"))}}
      return;
    }
    e.preventDefault();go(h);
  });
  // arriving from another page: start covered, sweep out
  var arrived=document.documentElement.classList.contains("pt-in");
  try{sessionStorage.removeItem("svara-pt")}catch(e){}
  if(arrived&&!reduce&&sx){
    drawSweep(0.5);
    requestAnimationFrame(function(){document.documentElement.classList.remove("pt-in");animate(0.5,0.96,900,function(){pageAnim=null;drawSweep(-1)})});
  }else document.documentElement.classList.remove("pt-in");
  addEventListener("pageshow",function(e){if(e.persisted){pageAnim=null;drawSweep(-1);document.documentElement.classList.remove("pt-in")}});

  /* ---------- main loop ---------- */
  var nav=$("#nav"),fill=$("#threadFill"),hooks=[],lastY=scrollY,vel=0;
  S.velocity=function(){return vel};
  S.onTick=function(fn){hooks.push(fn)};
  S.navSolidAt=function(vh){var h=$("#filmHero");if(h)return h.offsetHeight-vh-10;var ph=$(".phero,.film");return ph?Math.max(40,(ph.classList.contains("film")?ph.offsetHeight-vh:ph.offsetHeight-120)):40};
  function tick(){
    var vh=innerHeight,y=scrollY,H=document.documentElement.scrollHeight-vh;
    if(fill)fill.style.height=(H>0?clamp(y/H,0,1)*100:0)+"%";
    if(nav){nav.classList.toggle("solid",y>S.navSolidAt(vh));
      var dy=y-lastY;if(Math.abs(dy)>4){var hide=dy>0&&y>Math.max(400,S.navSolidAt(vh))&&!document.body.classList.contains("locked");nav.classList.toggle("hide",hide);document.body.classList.toggle("nav-hidden",hide);vel=dy}lastY=y}
    S.films.forEach(function(f){
      var r=f.el.getBoundingClientRect(),len=r.height-vh;
      if(S.filmsEnabled&&r.top<vh*2.5&&r.bottom>-vh)S.startFilm(f);
      if(r.bottom<0||r.top>vh)return;
      f.p=clamp(-r.top/len,0,1);f.target=f.p*(f.n-1);
      f.cur+=reduce?(f.target-f.cur):(f.target-f.cur)*0.16;
      if(Math.abs(f.target-f.cur)<0.05)f.cur=f.target;
      sizeCanvas(f);draw(f);caps(f);
    });
    transitions(vh);
    hooks.forEach(function(fn){fn(vh,y)});
    if(cursor&&cursor.style.opacity==="1"){cx+=(mx-cx)*.22;cy+=(my-cy)*.22;cursor.style.transform="translate("+cx+"px,"+cy+"px)"}
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- split a heading into words for a staggered rise ---------- */
  function split(el){
    if(el.classList.contains("split"))return;var i=0;
    function wrap(node){var w=document.createElement("span");w.className="w";var s=document.createElement("span");s.style.transitionDelay=(i++*75+120)+"ms";w.appendChild(s);s.appendChild(node);return w}
    [].slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType===3){var frag=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t))frag.appendChild(document.createTextNode(" "));else frag.appendChild(wrap(document.createTextNode(t)))});el.replaceChild(frag,n)}
      else if(n.nodeType===1&&n.tagName!=="BR"){var ph=document.createTextNode("");el.replaceChild(ph,n);el.replaceChild(wrap(n),ph)}
    });
    el.classList.add("split");
  }
  S.split=split;

  /* ---------- embers: glowing motes rising through the opening scene ---------- */
  S.embers=function(cv){
    if(reduce)return;
    var ctx=cv.getContext("2d"),N=mqMobile.matches?20:42,P=[],W=0,H=0,dpr=1;
    var spr=document.createElement("canvas");spr.width=spr.height=48;var g=spr.getContext("2d"),rg=g.createRadialGradient(24,24,0,24,24,24);
    rg.addColorStop(0,"rgba(255,236,190,1)");rg.addColorStop(.25,"rgba(246,190,96,.85)");rg.addColorStop(1,"rgba(214,120,40,0)");g.fillStyle=rg;g.fillRect(0,0,48,48);
    function rs(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
    function spawn(p,init){p.x=Math.random()*W;p.y=init?Math.random()*H:H+20;p.r=2+Math.random()*5;p.v=.18+Math.random()*.55;p.s=Math.random()*6.28;p.a=.25+Math.random()*.55;return p}
    rs();for(var i=0;i<N;i++)P.push(spawn({},true));addEventListener("resize",rs);
    (function frame(t){
      var r=cv.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){
        if(cv.clientWidth!==W||cv.clientHeight!==H)rs();
        ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
        P.forEach(function(p){p.y-=p.v;p.x+=Math.sin(t/1100+p.s)*.35;if(p.y<-20)spawn(p);
          var fl=.65+.35*Math.sin(t/160+p.s*5),al=p.a*fl*clamp(p.y/H*1.6,0,1)*clamp((H-p.y)/80,0,1);
          ctx.globalAlpha=al;var d=p.r*2;ctx.drawImage(spr,p.x-d,p.y-d,d*2,d*2)});
        ctx.globalAlpha=1;
      }
      requestAnimationFrame(frame);
    })(performance.now());
  };
  var firstStage=$(".film .stage")||$(".phero");
  if(firstStage&&(document.body.dataset.page==="home"||$(".film")===firstStage.parentNode||firstStage.classList.contains("phero"))){var ec=document.createElement("canvas");ec.className="embers";ec.setAttribute("aria-hidden","true");firstStage.appendChild(ec);S.embers(ec)}

  /* ---------- marquee: drifts on its own, runs faster with the scroll ---------- */
  S.marquee=function(track){
    var grp=track.firstElementChild;if(!grp)return;track.appendChild(grp.cloneNode(true));
    var x=0,w=grp.getBoundingClientRect().width,dir=-1;
    addEventListener("resize",function(){w=grp.getBoundingClientRect().width});
    S.onTick(function(){
      var r=track.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      var v=vel;if(Math.abs(v)>1)dir=v>0?-1:1;
      x+=dir*(reduce?0:(.55+Math.min(Math.abs(v),60)*.12));
      if(x<=-w)x+=w;if(x>0)x-=w;
      track.style.transform="translate3d("+x.toFixed(1)+"px,0,0)";vel*=.9;
    });
  };

  /* ---------- tilt on product photos, magnetic buttons ---------- */
  if(matchMedia("(hover:hover) and (pointer:fine)").matches&&!reduce){
    var tiltEl=null,magEl=null;
    document.addEventListener("pointermove",function(e){
      var t=e.target.closest&&e.target.closest(".prod .ph");
      if(tiltEl&&tiltEl!==t){tiltEl.classList.remove("tilt");tiltEl.style.setProperty("--rx","0deg");tiltEl.style.setProperty("--ry","0deg");tiltEl=null}
      if(t){tiltEl=t;var r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;t.classList.add("tilt");
        t.style.setProperty("--ry",((px-.5)*9).toFixed(2)+"deg");t.style.setProperty("--rx",((.5-py)*7).toFixed(2)+"deg");
        t.style.setProperty("--gx",(px*100).toFixed(1)+"%");t.style.setProperty("--gy",(py*100).toFixed(1)+"%")}
      var m=e.target.closest&&e.target.closest(".btn");
      if(magEl&&magEl!==m){magEl.classList.remove("mag");magEl.style.transform="";magEl=null}
      if(m){magEl=m;var b=m.getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2);m.classList.add("mag");m.style.transform="translate("+(dx*.22).toFixed(1)+"px,"+(dy*.3).toFixed(1)+"px)"}
    },{passive:true});
  }

  /* ---------- footer wordmark rises as the footer arrives ---------- */
  var wm=$("#wordmark");
  if(wm&&!reduce)S.onTick(function(vh){var r=wm.parentNode.getBoundingClientRect();if(r.top>vh||r.bottom<0)return;var q=clamp((vh-r.top)/(r.height+vh*.35),0,1);wm.style.transform="translateY("+((1-q)*55).toFixed(1)+"%)";wm.style.backgroundPosition=(q*100).toFixed(1)+"% 50%"});

  /* ---------- temple sound: a tanpura drone and temple bells, synthesised live ---------- */
  var AC=null,master=null,bus=null,soundOn=false,droneT=null,bellT=null,sbtn=$("#soundBtn");
  function audioInit(){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return false;
    AC=new C();master=AC.createGain();master.gain.value=0;bus=AC.createGain();
    var conv=AC.createConvolver(),len=Math.floor(AC.sampleRate*3.4),buf=AC.createBuffer(2,len,AC.sampleRate);
    for(var ch=0;ch<2;ch++){var d=buf.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8)}
    conv.buffer=buf;var wet=AC.createGain(),dry=AC.createGain();wet.gain.value=.5;dry.gain.value=.6;
    bus.connect(dry);bus.connect(conv);conv.connect(wet);dry.connect(master);wet.connect(master);master.connect(AC.destination);return true;
  }
  function pluck(f,t,v){
    var lp=AC.createBiquadFilter(),g=AC.createGain();lp.type="lowpass";lp.Q.value=1.4;
    lp.frequency.setValueAtTime(f*16,t);lp.frequency.exponentialRampToValueAtTime(f*3,t+3.6);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(v*.32,t+1.3);g.gain.exponentialRampToValueAtTime(.0001,t+5);
    [["sawtooth",1],["triangle",1.0035],["sine",2.001]].forEach(function(x){var o=AC.createOscillator();o.type=x[0];o.frequency.value=f*x[1];o.connect(lp);o.start(t);o.stop(t+5.1)});
    lp.connect(g);g.connect(bus);
  }
  function bell(t,v){
    var base=480+Math.random()*90;
    [1,2.02,2.76,4.07,5.43,6.8].forEach(function(r,i){var o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=base*r;
      var vv=v/(1+i*.85);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vv,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+6-i*.75);
      o.connect(g);g.connect(bus);o.start(t);o.stop(t+6.2)});
  }
  var SA=138.59;
  function cycle(){var t=AC.currentTime+.05;pluck(SA*.75,t,.09);pluck(SA,t+1.15,.08);pluck(SA,t+2.3,.08);pluck(SA/2,t+3.45,.11)}
  function bells(){bell(AC.currentTime+.05,.06);bellT=setTimeout(bells,14000+Math.random()*12000)}
  function setSound(on){
    if(on&&!AC&&!audioInit())return;
    soundOn=on;S.save("svara-sound",on);
    if(sbtn){sbtn.classList.toggle("on",on);sbtn.setAttribute("aria-pressed",on)}
    if(!AC)return;
    var now=AC.currentTime;master.gain.cancelScheduledValues(now);master.gain.setValueAtTime(master.gain.value,now);
    if(on){AC.resume();master.gain.linearRampToValueAtTime(.55,now+2.5);cycle();clearInterval(droneT);droneT=setInterval(cycle,4600);clearTimeout(bellT);bellT=setTimeout(bells,3500)}
    else{master.gain.linearRampToValueAtTime(0,now+1.2);clearInterval(droneT);clearTimeout(bellT)}
  }
  S.setSound=setSound;
  S.chime=function(v){if(soundOn&&AC)bell(AC.currentTime+.02,v||.09)};
  if(sbtn)sbtn.addEventListener("click",function(){setSound(!soundOn)});
  // someone who turned sound on before gets it back on their first tap (browsers need a gesture)
  if(S.load("svara-sound",false)&&!document.getElementById("loader")){
    if(sbtn)sbtn.classList.add("pending");
    var once=function(){document.removeEventListener("pointerdown",once);if(sbtn)sbtn.classList.remove("pending");setSound(true)};
    document.addEventListener("pointerdown",once);
  }
  var _add=S.addBag;S.addBag=function(id){_add(id);S.chime(.07)};

  /* ---------- jasmine and rose petals ---------- */
  function petalSprites(){
    var out=[];
    var j=document.createElement("canvas");j.width=j.height=64;var x=j.getContext("2d");x.translate(32,32);
    for(var i=0;i<5;i++){x.save();x.rotate(i*Math.PI*2/5);var g=x.createLinearGradient(0,0,0,-26);g.addColorStop(0,"#f4ead0");g.addColorStop(1,"#fffdf6");x.fillStyle=g;x.beginPath();x.ellipse(0,-14,7,14,0,0,6.283);x.fill();x.restore()}
    x.fillStyle="#e4c16a";x.beginPath();x.arc(0,0,4,0,6.283);x.fill();out.push(j);
    [["#a8142a","#e0405a"],["#c2185b","#f06a92"],["#8e1020","#c8303f"]].forEach(function(c){var r=document.createElement("canvas");r.width=48;r.height=64;var y=r.getContext("2d"),g=y.createRadialGradient(24,40,2,24,32,30);g.addColorStop(0,c[1]);g.addColorStop(1,c[0]);y.fillStyle=g;y.beginPath();y.moveTo(24,4);y.bezierCurveTo(46,14,44,52,24,60);y.bezierCurveTo(4,52,2,14,24,4);y.fill();out.push(r)});
    return out;
  }
  var SPR=null;
  S.petals=function(host,opts){
    if(reduce)return null;opts=opts||{};SPR=SPR||petalSprites();
    var cv=document.createElement("canvas");cv.className="petals";cv.setAttribute("aria-hidden","true");host.appendChild(cv);
    var ctx=cv.getContext("2d"),P=[],W=0,H=0,dpr=1,rate=opts.rate==null?.18:opts.rate;
    function add(burst,x0){var j=Math.random()<.45;P.push({x:x0!=null?x0+(Math.random()-.5)*W*.5:Math.random()*W,y:burst?-20-Math.random()*H*.5:-30,s:(j?.42:.36)+Math.random()*.3,img:j?SPR[0]:SPR[1+Math.floor(Math.random()*3)],
      vy:.6+Math.random()*1.1,vx:(Math.random()-.5)*.6,rot:Math.random()*6.28,vr:(Math.random()-.5)*.04,ph:Math.random()*6.28,vp:.02+Math.random()*.04})}
    var api={burst:function(n){for(var i=0;i<(n||60);i++)add(true,W/2)}};
    (function frame(){
      var r=host.getBoundingClientRect(),vis=r.bottom>0&&r.top<innerHeight;
      if(vis){
        dpr=Math.min(devicePixelRatio||1,2);if(cv.clientWidth!==W||cv.clientHeight!==H){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
        if(Math.random()<rate&&P.length<70)add(false);
        ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
        for(var i=P.length-1;i>=0;i--){var p=P[i];p.y+=p.vy;p.x+=p.vx+Math.sin(p.ph)*.6;p.ph+=p.vp;p.rot+=p.vr;
          if(p.y>H+40){P.splice(i,1);continue}
          ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(p.s,p.s*Math.abs(Math.cos(p.ph*1.3))+.15*p.s);ctx.globalAlpha=.92;ctx.drawImage(p.img,-p.img.width/2,-p.img.height/2);ctx.restore()}
      }
      requestAnimationFrame(frame);
    })();
    return api;
  };
  $$("[data-petals]").forEach(function(h){var v=parseFloat(h.dataset.petals);h._petals=S.petals(h,{rate:isNaN(v)?.18:v})});

  /* ---------- kolam mandala that draws itself as you scroll ---------- */
  S.mandala=function(host){
    var ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg"),paths=[];svg.setAttribute("viewBox","-100 -100 200 200");svg.setAttribute("aria-hidden","true");
    function P(d,ring,cls){var p=document.createElementNS(ns,"path");p.setAttribute("d",d);p.setAttribute("pathLength","1");if(cls)p.setAttribute("class",cls);svg.appendChild(p);paths.push({el:p,ring:ring})}
    function circle(r,ring,cls){P("M "+(-r)+" 0 a "+r+" "+r+" 0 1 0 "+(2*r)+" 0 a "+r+" "+r+" 0 1 0 "+(-2*r)+" 0",ring,cls)}
    function petals(n,r0,r1,w,ring,off){for(var i=0;i<n;i++){var a=(i+(off||0))/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a),nx=-s,ny=c,
      x0=c*r0,y0=s*r0,x1=c*r1,y1=s*r1,mx=c*(r0+r1)/2,my=s*(r0+r1)/2;
      P("M "+x0.toFixed(2)+" "+y0.toFixed(2)+" Q "+(mx+nx*w).toFixed(2)+" "+(my+ny*w).toFixed(2)+" "+x1.toFixed(2)+" "+y1.toFixed(2)+" Q "+(mx-nx*w).toFixed(2)+" "+(my-ny*w).toFixed(2)+" "+x0.toFixed(2)+" "+y0.toFixed(2),ring)}}
    function dots(n,r,ring){for(var i=0;i<n;i++){var a=i/n*Math.PI*2;var x=Math.cos(a)*r,y=Math.sin(a)*r;P("M "+(x-.9).toFixed(2)+" "+y.toFixed(2)+" a .9 .9 0 1 0 1.8 0 a .9 .9 0 1 0 -1.8 0",ring,"dot")}}
    circle(6,0);petals(8,6,26,8,1);circle(28,2);petals(16,28,48,7,3,.5);dots(16,52,4);circle(56,4);petals(24,56,74,5,5);circle(76,6,"o");dots(48,82,6);petals(12,84,97,6,7,.5);
    host.appendChild(svg);
    S.onTick(function(vh){var r=host.getBoundingClientRect();if(r.bottom<-100||r.top>vh+100)return;
      var q=clamp((vh-r.top)/(vh+r.height*.6),0,1);
      paths.forEach(function(p){var k=clamp(q*1.5-p.ring*.07,0,1);p.el.style.strokeDashoffset=(1-k).toFixed(3)});
      svg.style.transform=reduce?"":"rotate("+(q*40-20).toFixed(2)+"deg)";
    });
  };
  $$("[data-mandala]").forEach(S.mandala);

  /* ---------- reveal ---------- */
  S.reveal=function(root){
    if(!("IntersectionObserver" in window)||reduce)return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
    var seen=new Map();
    $$(".reveal",root).forEach(function(el){
      if(el.classList.contains("rv"))return;
      if(el.getBoundingClientRect().top<=innerHeight)return;
      var k=seen.get(el.parentNode)||0;seen.set(el.parentNode,k+1);
      el.style.transitionDelay=Math.min(k,5)*110+"ms";
      if(/^H[12]$/.test(el.tagName))split(el);
      el.classList.add("rv","pre");io.observe(el);
    });
  };
})();
