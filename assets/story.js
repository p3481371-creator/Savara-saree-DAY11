(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,clamp=S.clamp;
  var steps=$$(".stepx"),imgs=$$("#process .fig img"),lbl=$("#figLbl"),cur=0;
  function set(i){if(i===cur)return;cur=i;steps.forEach(function(s,k){s.classList.toggle("on",k===i)});imgs.forEach(function(m,k){m.classList.toggle("on",k===i)});lbl.textContent="Stage "+(i+1)+" of "+steps.length}
  S.onTick(function(vh){
    if(S.mqMobile.matches)return;
    var best=0,bd=1e9;steps.forEach(function(s,k){var r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=k}});set(best);
    var p=$("#pillarImg");if(p&&!S.reduce){var r=p.getBoundingClientRect();if(r.bottom>0&&r.top<vh)p.style.transform="translateY("+clamp((r.top-vh/2)*-0.08-40,-80,0)+"px)"}
  });
  S.reveal();
})();
