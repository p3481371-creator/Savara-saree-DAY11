(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,clamp=S.clamp,reduce=S.reduce,D=window.SVARA_DATA;

  /* ---------- loader: wait for the opening film ---------- */
  var loader=$("#loader"),lbar=$("#lbar"),lnote=$("#lnote"),enterBtn=$("#enterBtn"),entered=false;
  S.filmsEnabled=false;
  document.body.classList.add("locked");
  function enter(){if(entered)return;entered=true;loader.classList.add("gone");document.body.classList.add("entered");document.body.classList.remove("locked");S.filmsEnabled=true;loadRest()}
  enterBtn.addEventListener("click",enter);
  $("#enterSnd").addEventListener("click",function(){S.setSound(true);enter()});
  setTimeout(function(){$("#choices").classList.add("show")},1800);
  setTimeout(enter,12000);
  var hero=S.films[0];hero.started=true;
  var q=hero.clips.map(function(){return 0}),wt=hero.clips.map(function(c){return MANIFEST[c].n/hero.n});
  hero.clips.forEach(function(c,k){S.reel(c,function(v){q[k]=v;var t=q.reduce(function(a,x,i){return a+x*wt[i]},0);lbar.style.width=(t*100)+"%";lnote.textContent="Lighting the lamps · "+Math.round(t*100)+"%"})});
  Promise.all(hero.clips.map(function(c){return S.reel(c).promise})).then(function(){lnote.textContent="The lamps are lit";$("#choices").classList.add("show");setTimeout(enter,2600)});
  function loadRest(){S.films.slice(1).reduce(function(ch,f){return ch.then(function(){S.startFilm(f);return Promise.all(f.clips.map(function(c){return S.reel(c).promise}))})},Promise.resolve())}

  /* ---------- collections → Sarees page ---------- */
  var arrow='<svg viewBox="0 0 26 10"><use href="#arrow"/></svg>';
  var cols=[
    {id:"Kanchipuram",tok:"kanchipuram",img:"img/kanchi.webp",tags:"Royal · Rich · Timeless",from:"from ₹24,800",alt:"A woman in a maroon Kanchipuram saree walking through a lamp-lit temple corridor"},
    {id:"Tissue",tok:"tissue",img:"img/tissue.webp",tags:"Light · Luxury · Grace",from:"from ₹18,900",alt:"Hands gathering the pleats of an emerald tissue silk saree"},
    {id:"Chanderi",tok:"chanderi",img:"img/chanderi-2.webp",tags:"Elegant · Airy · Classic",from:"from ₹9,400",alt:"A woman in an ivory Chanderi saree standing between carved temple pillars"},
    {id:"Silk Cotton",tok:"silk-cotton",img:"img/silkcotton.webp",tags:"Comfort · Tradition · Style",from:"from ₹6,200",alt:"Drape of a purple silk cotton saree with gold mango buttas"}
  ];
  $("#cards").innerHTML=cols.map(function(c,i){return '<a class="card reveal" href="sarees.html#'+c.tok+'" data-cursor="Shop"><span class="idx">0'+(i+1)+'</span><img src="'+c.img+'" alt="'+c.alt+'" loading="lazy"><svg class="corner" viewBox="0 0 30 30" fill="none" stroke="currentColor"><path d="M2 2h26v26"/><path d="M8 2v6H2"/></svg><span class="cap2"><h3>'+c.id+'</h3><span class="tags">'+c.tags+'</span><span class="more"><span>'+c.from+'</span>'+arrow+'</span></span></a>'}).join("");

  /* ---------- anatomy ---------- */
  var terms=[
    {t:"Zari",s:"the gold border",x:33.0,y:62.7,d:"Silk thread twisted with fine silver wire and dipped in gold. Pure zari stays soft and dulls gracefully with age instead of tarnishing black."},
    {t:"Korvai",s:"the temple-spire edge",x:50.0,y:52.7,d:"Where the gold border meets the green body. The two are woven in separate colours and interlocked by hand at every pass, so the border can never separate."},
    {t:"Butta",s:"the scattered motif",x:68.6,y:51.5,d:"Small woven medallions repeated across the body. Coins, mangoes and temple flowers are the classic South Indian buttas."},
    {t:"Body",s:"the mulberry silk",x:89.4,y:65.0,d:"Three-ply mulberry silk gives a Kanchipuram its weight and deep, even lustre. The heavier the ply, the longer the saree holds its drape."}
  ];
  var termsEl=$("#terms"),inner=$("#anaInner"),pickI=-1;
  termsEl.innerHTML=terms.map(function(t,i){return '<button class="term reveal" data-i="'+i+'" aria-expanded="false"><span class="n">'+(i+1)+'</span><span class="t">'+t.t+'<small>'+t.s+'</small></span><span class="d">'+t.d+'</span></button>'}).join("");
  terms.forEach(function(t,i){var s=document.createElement("button");s.className="spot";s.style.left=t.x+"%";s.style.top=t.y+"%";s.textContent=i+1;s.dataset.i=i;s.setAttribute("aria-label",t.t);inner.appendChild(s)});
  function pick(i,zoom){pickI=i;
    $$(".term",termsEl).forEach(function(el,j){el.classList.toggle("on",j===i);el.setAttribute("aria-expanded",j===i)});
    $$(".spot",inner).forEach(function(el,j){el.classList.toggle("on",j===i)});
    inner.style.setProperty("--ox",terms[i].x+"%");inner.style.setProperty("--oy",terms[i].y+"%");inner.classList.toggle("zoom",!!zoom)}
  termsEl.addEventListener("click",function(e){var b=e.target.closest(".term");if(b){var i=+b.dataset.i;pick(i,!(pickI===i&&inner.classList.contains("zoom")))}});
  inner.addEventListener("click",function(e){var b=e.target.closest(".spot");if(b){var i=+b.dataset.i;pick(i,!(pickI===i&&inner.classList.contains("zoom")))}else if(inner.classList.contains("zoom"))inner.classList.remove("zoom")});
  pick(0,false);

  /* ---------- home shop: six signature pieces ---------- */
  var home=D.products.filter(function(p){return p.home}),cur="All";
  var fEl=$("#filters"),grid=$("#grid");
  ["All","Bridal","Kanchipuram","Tissue","Chanderi","Silk Cotton"].forEach(function(w){var b=document.createElement("button");b.className="chip";b.setAttribute("role","tab");b.dataset.w=w;b.textContent=w;fEl.appendChild(b)});
  fEl.addEventListener("click",function(e){var b=e.target.closest(".chip");if(b)setFilter(b.dataset.w)});
  function setFilter(w){cur=w;$$(".chip",fEl).forEach(function(c){var on=c.dataset.w===w;c.classList.toggle("on",on);c.setAttribute("aria-selected",on)});
    grid.innerHTML=home.filter(function(p){return w==="All"||(w==="Bridal"?p.occ==="Bridal":p.w===w)}).map(S.cardHTML).join("")}
  setFilter("All");S.bindGrid(grid);

  /* ---------- hero: the temple doorway opens as you scroll in ---------- */
  var hf=S.films[0],stage=$(".stage",hf.el),reel=$("#heroReel"),line=$("#portalLine"),fl=$("#flankL"),fr=$("#flankR"),sl=$("#sideL"),sr=$("#sideR"),bt=$("#barT"),bb=$("#barB"),hs=$("#hotspot"),rule=$("#heroRule");
  reel.style.setProperty("--arch",'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2762%27 height=%27100%27 viewBox=%270 0 62 100%27%3E%3Cpath d=%27M0 100V31A31 31 0 0 1 62 31V100Z%27/%3E%3C/svg%3E")');
  var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var title=$("#heroTitle");S.split(title);var words=$$(".w>span",title);words.forEach(function(w){w.style.transition="none"});
  hs.addEventListener("click",function(){S.openQuick(hs.dataset.open)});
  var last={};
  function set(el,prop,val){var k=el.id+prop;if(last[k]===val)return;last[k]=val;el.style[prop]=val}
  S.onTick(function(vh){
    var p=hf.p,vw=innerWidth,mob=S.mqMobile.matches;
    var o=ease(clamp(p/0.2,0,1));
    var h0=mob?Math.min(vh*.5,vw*1.25):Math.min(vh*.72,vw*.548),h1=2.7*Math.max(vh,vw/.62);
    var mh=h0*Math.pow(h1/h0,o);
    if(o>=.999){reel.classList.add("open")}else{reel.classList.remove("open");var v=mh.toFixed(1)+"px";if(last.mh!==v){last.mh=v;stage.style.setProperty("--mh",v)}}
    set(line,"opacity",String(1-clamp(o*2.4,0,1)));
    var fo=String(1-clamp(o*2.2,0,1));
    set(fl,"opacity",fo);set(fr,"opacity",fo);set(sl,"opacity",fo);set(sr,"opacity",fo);
    var sx=Math.round(o*vw*.3),sy=Math.round(o*80);
    set(fl,"transform",o===0?"none":mob?"translateY("+(-sy)+"px)":"translateX("+(-sx)+"px)");
    set(fr,"transform",o===0?"none":mob?"translateY("+sy+"px)":"translateX("+sx+"px)");
    fl.style.pointerEvents=fr.style.pointerEvents=o>.4?"none":"";
    var b=clamp((p-.19)/.06,0,1)*(1-clamp((p-.42)/.07,0,1)),bh=(b*(mob?6:9)).toFixed(2)+"vh";
    set(bt,"height",bh);set(bb,"height",bh);
    hs.classList.toggle("show",p>.66&&p<.97);
    var q=(p-.5)/.09;words.forEach(function(w,i){var t=ease(clamp(q*1.5-i*.16,0,1));w.style.transform=t>=1?"none":"translateY("+((1-t)*112).toFixed(1)+"%)"});
    set(rule,"transform","scaleX("+clamp((p-.55)/.07,0,1).toFixed(3)+")");
  });

  /* ---------- marquee of weave words ---------- */
  var mw=["Kanchipuram","Arakku","Korvai","Mayil Kazhuthu","Pure Zari","Temple Border","Manthulir","Mulberry Silk"];
  var mq=$("#marq");
  if(mq){mq.innerHTML='<div class="grp">'+mw.map(function(w,i){return '<span class="'+(i%2?"o":"")+'">'+w+'</span><img src="img/lotus-sm.png" alt="">'}).join("")+'</div>';
    var im=mq.querySelectorAll("img"),left=im.length;im.forEach(function(x){if(x.complete)left--;else x.addEventListener("load",function(){if(--left===0)S.marquee(mq)})});if(left===0)S.marquee(mq)}

  /* ---------- chapter index (right edge) ---------- */
  var chaps=[["filmHero","Doorway"],["story","Heritage"],["filmPallu","The pallu"],["sarees","Weaves"],["zari","Zari"],["anatomy","Anatomy"],["muhurtham","Muhurtham"],["shop","The season"],["filmDeepam","The lamp"],["journal","Journal"],["visit","Visit"]];
  var cn=$("#chapNav");
  cn.innerHTML=chaps.map(function(c,i){return '<a href="#'+c[0]+'" data-c="'+c[0]+'"><span>'+c[1]+'</span><b>'+String(i+1).padStart(2,"0")+'</b><i></i></a>'}).join("");
  var cels=chaps.map(function(c){return document.getElementById(c[0])}),clinks=$$("a",cn),cur=-1;
  S.onTick(function(vh){
    cn.classList.toggle("show",hf.p>.2&&entered);
    var a=0;cels.forEach(function(el,i){if(el&&el.getBoundingClientRect().top<vh*.5)a=i});
    if(a!==cur){cur=a;clinks.forEach(function(l,i){l.classList.toggle("on",i===a)})}
  });

  /* ---------- parallax ---------- */
  var weaver=$("#weaverImg"),gop=$("#gopuramImg");
  if(!reduce)S.onTick(function(vh){
    var wr=weaver.getBoundingClientRect();if(wr.bottom>0&&wr.top<vh)weaver.style.transform="scale(1.08) translateY("+clamp((wr.top+wr.height/2-vh/2)*-0.06,-30,30)+"px)";
    var gr=gop.getBoundingClientRect();if(gr.bottom>0&&gr.top<vh)gop.style.transform="translateY("+clamp((gr.top-vh/2)*-0.08-30,-60,0)+"px)";
  });
  S.reveal();
})();
