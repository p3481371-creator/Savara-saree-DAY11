(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,D=window.SVARA_DATA;
  var st={w:"All",occ:"",col:"",sort:"feat"};
  var weaves=["All","Kanchipuram","Tissue","Chanderi","Silk Cotton"];
  var cols=[["Red","#8e1c1f"],["Maroon","#5e1a1e"],["Pink","#c2185b"],["Green","#0f5a37"],["Ivory","#efe2c4"],["Purple","#4b1d5e"]];
  var chips=$("#weaveChips"),dots=$("#dots"),grid=$("#grid");
  chips.innerHTML=weaves.map(function(w){return '<button class="chip" role="tab" data-w="'+w+'">'+w+'</button>'}).join("");
  dots.innerHTML=cols.map(function(c){return '<button class="dot" data-c="'+c[0]+'" style="background:'+c[1]+'" aria-label="'+c[0]+'" aria-pressed="false" title="'+c[0]+'"></button>'}).join("");
  function render(){
    $$(".chip",chips).forEach(function(c){var on=c.dataset.w===st.w;c.classList.toggle("on",on);c.setAttribute("aria-selected",on)});
    $$(".dot",dots).forEach(function(d){var on=d.dataset.c===st.col;d.classList.toggle("on",on);d.setAttribute("aria-pressed",on)});
    $("#occSel").value=st.occ;$("#sortSel").value=st.sort;
    var list=D.products.filter(function(p){return (st.w==="All"||p.w===st.w)&&(!st.occ||p.occ===st.occ)&&(!st.col||p.col===st.col)});
    if(st.sort==="low")list=list.slice().sort(function(a,b){return a.p-b.p});
    if(st.sort==="high")list=list.slice().sort(function(a,b){return b.p-a.p});
    $("#count").textContent=list.length+(list.length===1?" saree":" sarees");
    grid.innerHTML=list.length?list.map(S.cardHTML).join(""):'<div class="empty-state"><h3 style="font-size:30px">No sarees match all of these</h3><p>Try another colour or occasion.</p><button class="btn ghost" id="clearF">Clear filters</button></div>';
    var cf=$("#clearF");if(cf)cf.addEventListener("click",function(){st={w:"All",occ:"",col:"",sort:st.sort};render()});
  }
  chips.addEventListener("click",function(e){var b=e.target.closest(".chip");if(b){st.w=b.dataset.w;render()}});
  dots.addEventListener("click",function(e){var b=e.target.closest(".dot");if(b){st.col=st.col===b.dataset.c?"":b.dataset.c;render()}});
  $("#occSel").addEventListener("change",function(){st.occ=this.value;render()});
  $("#sortSel").addEventListener("change",function(){st.sort=this.value;render()});
  S.bindGrid(grid);
  // links like sarees.html#kanchipuram or #bridal open the matching filter
  function fromHash(scroll){
    var h=(location.hash||"").slice(1).toLowerCase();if(!h)return;
    var w=weaves.filter(function(x){return x.toLowerCase().replace(/\s+/g,"-")===h})[0];
    if(h==="studio"){var sd=$("#studio");if(sd&&scroll)setTimeout(function(){scrollTo({top:sd.getBoundingClientRect().top+scrollY-20,behavior:"auto"})},80);return}
    if(w){st.w=w;st.occ=""}else if(h==="bridal"||h==="festive"||h==="everyday"){st.w="All";st.occ=h[0].toUpperCase()+h.slice(1)}else return;
    render();
    if(scroll){var t=$("#catalogue");setTimeout(function(){scrollTo({top:t.getBoundingClientRect().top+scrollY-20,behavior:"auto"})},60)}
  }
  render();fromHash(true);
  addEventListener("hashchange",function(){fromHash(true)});
  S.reveal();
})();

/* ---------- Loom Studio: a live, woven preview of your own saree ---------- */
(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,clamp=S.clamp;
  var cv=$("#studioCv");if(!cv)return;
  var COLS=[
    {id:"arakku",n:"Arakku",c:"#8a1a1d"},{id:"mayil",n:"Mayil Kazhuthu",c:"#0e5a52"},{id:"rani",n:"Rani Pink",c:"#c0175a"},
    {id:"manjal",n:"Manjal",c:"#d79a16"},{id:"kili",n:"Kili Pachai",c:"#3e8a2c"},{id:"kathirikai",n:"Kathirikai",c:"#4a1c5c"},
    {id:"mampazham",n:"Mampazham",c:"#dc6f1c"},{id:"neelam",n:"Neelam",c:"#1c2f6e"},{id:"karuppu",n:"Karuppu",c:"#17110d"},{id:"vellai",n:"Vellai",c:"#ece0c4"}
  ];
  var ZARI={gold:{n:"Gold",a:"#f3dc9c",b:"#b9893c",d:"#6e4e1d"},antique:{n:"Antique gold",a:"#d8b878",b:"#93703a",d:"#4e3618"},silver:{n:"Silver",a:"#f2f1ec",b:"#a9a8a2",d:"#5b5a56"}};
  var BUTTA={coin:"Kaasu (coin)",mango:"Maanga (mango)",peacock:"Mayil (peacock)",lotus:"Thamarai (lotus)",none:"Plain body"};
  var WIDTH={3:"3 in",4.5:"4½ in",6:"6 in"},DRAPE={6:"Six yards",9:"Nine yards"};
  var PAIRS=[["arakku","mayil","gold","mango",6],["manjal","arakku","gold","coin",4.5],["rani","kili","gold","peacock",4.5],["mayil","rani","antique","lotus",6],["karuppu","arakku","gold","coin",3],["vellai","arakku","gold","none",4.5],["kathirikai","manjal","antique","mango",4.5],["neelam","mampazham","silver","peacock",6]];
  var st=S.load("svara-studio",null)||{body:"arakku",border:"mayil",zari:"gold",butta:"mango",width:6,drape:6};
  var col=function(id){return COLS.filter(function(c){return c.id===id})[0]||COLS[0]};

  /* controls */
  function sw(el,key){el.innerHTML=COLS.map(function(c){return '<button class="sw" role="radio" data-k="'+key+'" data-v="'+c.id+'" style="background:'+c.c+'" aria-label="'+c.n+'" title="'+c.n+'"></button>'}).join("")}
  function seg(el,key,map,dot){el.innerHTML=Object.keys(map).map(function(k){var m=map[k];return '<button role="radio" data-k="'+key+'" data-v="'+k+'">'+(dot?'<i style="background:linear-gradient(135deg,'+m.a+','+m.b+')"></i>':'')+(m.n||m)+'</button>'}).join("")}
  sw($("#cBody"),"body");sw($("#cBorder"),"border");seg($("#cZari"),"zari",ZARI,true);seg($("#cButta"),"butta",BUTTA);seg($("#cWidth"),"width",WIDTH);seg($("#cDrape"),"drape",DRAPE);
  $(".studio-ctl").addEventListener("click",function(e){var b=e.target.closest("[data-k]");if(!b)return;var k=b.dataset.k,v=b.dataset.v;st[k]=(k==="width"||k==="drape")?+v:v;sync()});

  /* silk texture: desaturated so it can be tinted any colour */
  var tex=null,img=new Image();
  img.onload=function(){var c=document.createElement("canvas");c.width=1376;c.height=552;var x=c.getContext("2d");x.filter="grayscale(1) contrast(1.35) brightness(1.05)";x.drawImage(img,0,0,1376,552,0,0,1376,552);tex=c;paint()};
  img.src="img/silk.webp";

  var off=document.createElement("canvas"),ox=off.getContext("2d"),W=900,H=1125;
  off.width=W;off.height=H;
  function zg(ctx,x0,y0,x1,y1,z){var g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,z.b);g.addColorStop(.35,z.a);g.addColorStop(.5,"#fffaf0");g.addColorStop(.62,z.a);g.addColorStop(1,z.b);return g}
  function textured(x,y,w,h,c,alpha){
    ox.fillStyle=c;ox.fillRect(x,y,w,h);
    if(tex){ox.save();ox.globalCompositeOperation="soft-light";ox.globalAlpha=alpha;var p=ox.createPattern(tex,"repeat");p.setTransform(new DOMMatrix().scale(.62));ox.fillStyle=p;ox.fillRect(x,y,w,h);ox.restore()}
  }
  function motif(kind,x,y,s,fill,dark){
    ox.save();ox.translate(x,y);ox.fillStyle=fill;ox.strokeStyle=dark;ox.lineWidth=Math.max(1,s*.08);
    if(kind==="coin"){ox.beginPath();ox.arc(0,0,s,0,6.283);ox.fill();ox.beginPath();ox.arc(0,0,s*.62,0,6.283);ox.stroke();ox.beginPath();ox.arc(0,0,s*.18,0,6.283);ox.fillStyle=dark;ox.fill()}
    else if(kind==="mango"){ox.rotate(-.5);ox.beginPath();ox.moveTo(0,-s*1.2);ox.bezierCurveTo(s*1.15,-s*.8,s*1.05,s*.95,0,s*1.05);ox.bezierCurveTo(-s*.95,s*.95,-s*.95,-s*.1,-s*.15,-s*.25);ox.bezierCurveTo(s*.3,-s*.35,s*.15,-s*.9,0,-s*1.2);ox.fill();ox.beginPath();ox.moveTo(-s*.05,s*.75);ox.bezierCurveTo(s*.6,s*.5,s*.6,-s*.3,s*.05,-s*.55);ox.stroke()}
    else if(kind==="peacock"){for(var i=-2;i<=2;i++){ox.save();ox.rotate(i*.32);ox.beginPath();ox.ellipse(0,-s*.95,s*.22,s*.55,0,0,6.283);ox.fill();ox.restore()}ox.beginPath();ox.ellipse(0,s*.25,s*.42,s*.62,0,0,6.283);ox.fill();ox.beginPath();ox.arc(s*.05,-s*.35,s*.22,0,6.283);ox.fill();ox.beginPath();ox.arc(s*.12,-s*.38,s*.06,0,6.283);ox.fillStyle=dark;ox.fill()}
    else if(kind==="lotus"){for(var k=0;k<8;k++){ox.save();ox.rotate(k*Math.PI/4);ox.beginPath();ox.ellipse(0,-s*.6,s*.28,s*.6,0,0,6.283);ox.fill();ox.restore()}ox.beginPath();ox.arc(0,0,s*.3,0,6.283);ox.fillStyle=dark;ox.fill()}
    ox.restore();
  }
  function teeth(x0,x1,y,h,dir,fill){ // a row of temple-spire triangles
    var n=Math.max(4,Math.round((x1-x0)/(h*.9))),w=(x1-x0)/n;ox.fillStyle=fill;ox.beginPath();
    for(var i=0;i<n;i++){ox.moveTo(x0+i*w,y);ox.lineTo(x0+i*w+w/2,y+dir*h);ox.lineTo(x0+(i+1)*w,y)}ox.fill()
  }
  function vteeth(x,y0,y1,h,dir,fill){
    var n=Math.max(4,Math.round((y1-y0)/(h*.9))),w=(y1-y0)/n;ox.fillStyle=fill;ox.beginPath();
    for(var i=0;i<n;i++){ox.moveTo(x,y0+i*w);ox.lineTo(x+dir*h,y0+i*w+w/2);ox.lineTo(x,y0+(i+1)*w)}ox.fill()
  }
  function paint(){
    var body=col(st.body),bord=col(st.border),z=ZARI[st.zari],bw=W*(.07+st.width*.018),pal=H*(st.drape===9?.58:.62);
    ox.clearRect(0,0,W,H);
    textured(0,0,W,H,body.c,.75);
    // buttas across the body
    if(st.butta!=="none"){var s=W*.022,gx=s*4.2,gy=s*4.6,row=0;var zf=zg(ox,0,0,W,0,z);
      for(var y=s*3;y<pal-s*3.2;y+=gy,row++)for(var x=bw+s*2.6+(row%2?gx/2:0);x<W-bw-s*2;x+=gx)motif(st.butta,x,y,s,zf,z.d)}
    // korvai borders
    [0,W-bw].forEach(function(x,side){
      textured(x,0,bw,pal,bord.c,.85);
      var g=zg(ox,x,0,x+bw,0,z),inner=side?x:x+bw,dir=side?-1:1;
      ox.fillStyle=g;
      var lines=[.1,.18,.82,.9];lines.forEach(function(f){ox.fillRect(x+bw*f-1.5,0,3,pal)});
      ox.fillRect(side?x:x+bw-bw*.06,0,bw*.06,pal);
      vteeth(inner,0,pal,bw*.32,dir,g);
      for(var y=bw*.4;y<pal;y+=bw*.55)motif("coin",x+bw*.5,y,bw*.12,g,z.d);
    });
    // pallu
    textured(0,pal,W,H-pal,bord.c,.85);
    var pg=zg(ox,0,pal,W,H,z);
    teeth(0,W,pal,W*.05,-1,pg);
    ox.fillStyle=pg;ox.fillRect(0,pal,W,H*.022);
    var y0=pal+H*.04;ox.fillRect(0,y0,W,3);ox.fillRect(0,y0+10,W,3);
    var ms=W*.034;for(var x=ms*1.6;x<W;x+=ms*3.4)motif(st.butta==="none"?"lotus":st.butta,x,y0+ms*2.2,ms,pg,z.d);
    var y1=y0+ms*4.4;ox.fillRect(0,y1,W,3);
    ox.fillStyle=pg;ox.fillRect(0,y1+12,W,H*.12);
    ox.fillStyle=z.d;for(var x2=0;x2<W;x2+=W*.04){ox.globalAlpha=.35;ox.fillRect(x2,y1+12,1.5,H*.12)}ox.globalAlpha=1;
    teeth(0,W,y1+12+H*.12,W*.035,1,pg);
    // fringe
    ox.strokeStyle=z.b;ox.lineWidth=1.2;ox.beginPath();for(var f=2;f<W;f+=5){ox.moveTo(f,H-H*.035);ox.lineTo(f+Math.sin(f)*2,H)}ox.stroke();
    // light
    var lg=ox.createRadialGradient(W*.35,H*.25,0,W*.5,H*.5,W*.95);lg.addColorStop(0,"rgba(255,240,210,.10)");lg.addColorStop(1,"rgba(0,0,0,.42)");ox.fillStyle=lg;ox.fillRect(0,0,W,H);
    dirty=true;
  }

  /* display: draped with soft folds that breathe */
  var cx=cv.getContext("2d"),dirty=true,t0=performance.now();
  function frame(now){
    var r=cv.getBoundingClientRect();
    if(r.bottom>0&&r.top<innerHeight){
      var dpr=Math.min(devicePixelRatio||1,2),cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);
      if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;dirty=true}
      if(dirty||!S.reduce){
        var t=S.reduce?0:(now-t0)/1000,strips=90,sw2=W/strips,dw=cw/strips;
        cx.fillStyle="#0c0805";cx.fillRect(0,0,cw,ch);
        for(var i=0;i<strips;i++){
          var u=i/strips,wave=Math.sin(u*Math.PI*4.2+t*.9)*.5+Math.sin(u*Math.PI*9-t*.6)*.25;
          var dy=wave*ch*.012,shade=wave;
          cx.drawImage(off,i*sw2,0,sw2+1,H,i*dw,dy+ch*.012,dw+1,ch*.976);
          cx.fillStyle=shade>0?"rgba(255,236,200,"+(shade*.07).toFixed(3)+")":"rgba(0,0,0,"+(-shade*.28).toFixed(3)+")";
          cx.fillRect(i*dw,0,dw+1,ch);
        }
        dirty=false;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* name, estimate */
  function estimate(){
    var p=22000+st.width*1400+(st.butta==="none"?0:st.butta==="peacock"?5200:st.butta==="lotus"?3600:2600)+(st.zari==="silver"?-1500:st.zari==="antique"?800:0);
    if(st.drape===9)p*=1.42;if(st.body!==st.border)p+=2400;
    var d=14+Math.round(st.width*1.4)+(st.butta==="none"?0:4)+(st.drape===9?6:0)+(st.body!==st.border?3:0);
    var g=Math.round((st.drape===9?820:640)+st.width*16+(st.butta==="none"?0:40));
    return {p:Math.round(p/100)*100,d:d,g:g};
  }
  function sync(){
    $$(".studio-ctl [data-k]").forEach(function(b){var on=String(st[b.dataset.k])===b.dataset.v;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});
    var b=col(st.body),o=col(st.border);
    $("#vBody").textContent=b.n;$("#vBorder").textContent=o.n;$("#vZari").textContent=ZARI[st.zari].n;$("#vButta").textContent=BUTTA[st.butta];
    var name=st.body===st.border?b.n+" self-border":b.n+" with "+o.n+" korvai";
    $("#stName").textContent=name;
    $("#stSpec").textContent=DRAPE[st.drape]+" · "+WIDTH[st.width]+" border · "+ZARI[st.zari].n.toLowerCase()+" zari · "+BUTTA[st.butta].split(" (")[0].toLowerCase()+(st.butta==="none"?"":" buttas");
    cv.setAttribute("aria-label","Preview: "+name+", "+$("#stSpec").textContent);
    var e=estimate();$("#stPrice").textContent=S.rupee(e.p);$("#stDays").textContent=e.d+" days";$("#stWeight").textContent=e.g+" g";
    S.save("svara-studio",st);paint();
  }
  $("#stPair").addEventListener("click",function(){var c=PAIRS[(PAIRS.findIndex(function(p){return p[0]===st.body&&p[1]===st.border})+1)%PAIRS.length];st={body:c[0],border:c[1],zari:c[2],butta:c[3],width:c[4],drape:st.drape};sync()});
  var saved=S.load("svara-designs",[]);
  function renderSaved(){$("#stSaved").innerHTML=saved.map(function(d,i){return '<button data-i="'+i+'"><i style="background:'+col(d.body).c+'"></i><i style="background:'+col(d.border).c+'"></i>'+col(d.body).n+' / '+col(d.border).n+'</button>'}).join("")}
  $("#stSaved").addEventListener("click",function(e){var b=e.target.closest("[data-i]");if(b){st=Object.assign({},saved[+b.dataset.i]);sync()}});
  $("#stSave").addEventListener("click",function(){saved=[Object.assign({},st)].concat(saved.filter(function(d){return JSON.stringify(d)!==JSON.stringify(st)})).slice(0,5);S.save("svara-designs",saved);renderSaved();S.toast("Design saved in this browser")});
  $("#stRequest").addEventListener("click",function(){var e=estimate();$("#stNote").textContent="Your "+$("#stName").textContent+" ("+S.rupee(e.p)+", about "+e.d+" days on the loom) is noted. A weaver will call to confirm the colours.";});
  renderSaved();sync();
})();
