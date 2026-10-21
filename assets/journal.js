(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,posts=window.SVARA_DATA.posts,cat="All";
  var cats=["All"].concat(posts.map(function(p){return p.cat}).filter(function(c,i,a){return a.indexOf(c)===i}));
  $("#cats").innerHTML=cats.map(function(c){return '<button class="chip" role="tab" data-c="'+c+'">'+c+'</button>'}).join("");
  function card(p){return '<button class="post" data-id="'+p.id+'" data-cursor="Read"><div class="ph"><img src="'+p.img+'" alt="" loading="lazy"></div><span class="meta">'+p.cat+' · '+p.read+' min read</span><h3>'+p.title+'</h3><p>'+p.ex+'</p></button>'}
  function render(){
    $$(".chip",$("#cats")).forEach(function(c){var on=c.dataset.c===cat;c.classList.toggle("on",on);c.setAttribute("aria-selected",on)});
    var list=posts.filter(function(p){return cat==="All"||p.cat===cat}),f=list[0],rest=list.slice(1);
    var fe=$("#featured");fe.dataset.id=f.id;
    fe.innerHTML='<div class="ph"><img src="'+f.img+'" alt="" loading="lazy"></div><div class="body"><span class="meta" style="font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)">Featured · '+f.cat+' · '+f.read+' min read</span><h2>'+f.title+'</h2><p>'+f.ex+'</p><span class="link-arrow" style="justify-self:start">Read the story <svg><use href="#arrow"/></svg></span></div>';
    $("#posts").innerHTML=rest.map(card).join("");
  }
  $("#cats").addEventListener("click",function(e){var b=e.target.closest(".chip");if(b){cat=b.dataset.c;render()}});
  var reader=$("#reader"),curId=null,lastFocus;
  function openPost(id,push){
    var i=posts.findIndex(function(p){return p.id===id});if(i<0)return;var p=posts[i],n=posts[(i+1)%posts.length];curId=id;
    if(!reader.classList.contains("open"))lastFocus=document.activeElement;
    $("#rImg").src=p.img;$("#rMeta").textContent=p.cat+" · "+p.read+" min read · "+p.date;$("#rTitle").textContent=p.title;
    $("#rBody").innerHTML=p.body.map(function(t){return "<p>"+t+"</p>"}).join("");
    $("#rNextT").textContent=n.title;$("#rNext").dataset.id=n.id;
    reader.classList.add("open");reader.scrollTop=0;document.body.classList.add("locked");$("#rClose").focus();
    if(push!==false)try{history.replaceState(null,"","#"+id)}catch(e){}
  }
  function closePost(){if(!reader.classList.contains("open"))return;reader.classList.remove("open");document.body.classList.remove("locked");try{history.replaceState(null,"",location.pathname)}catch(e){}if(lastFocus)lastFocus.focus()}
  document.addEventListener("click",function(e){var b=e.target.closest(".post,.featured");if(b&&b.dataset.id)openPost(b.dataset.id)});
  $("#rNext").addEventListener("click",function(){openPost(this.dataset.id)});
  $("#rClose").addEventListener("click",closePost);
  S.onEscape=closePost;
  render();
  function fromHash(){var h=(location.hash||"").slice(1);if(h&&posts.some(function(p){return p.id===h}))openPost(h,false)}
  fromHash();addEventListener("hashchange",fromHash);
  S.reveal();
})();
