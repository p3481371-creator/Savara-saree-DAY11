(function(){
  "use strict";
  var S=window.SVARA,$=S.$,MS=864e5;
  document.addEventListener("click",function(e){var o=e.target.closest(".look [data-open]");if(o)S.openQuick(o.dataset.open)});
  var mdate=$("#mdate");
  var fmt=function(d){return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})};
  var today=new Date();today.setHours(0,0,0,0);
  var iso=function(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
  mdate.value=iso(new Date(today.getTime()+150*MS));mdate.min=iso(today);
  var steps=[
    {o:120,w:"Consultation and colour selection",y:"Choose the body, border and pallu colours, and the motifs for your border."},
    {o:90,w:"Weaving begins on the loom",y:"Two weavers set the warp. A bridal saree takes about 24 days on the loom."},
    {o:30,w:"Blouse fitting",y:"The blouse piece is cut from the saree's own length and tailored to you."},
    {o:14,w:"Saree delivered, pressed and ready",y:"Delivered in muslin with its Silk Mark tag and weaver's card."}
  ];
  function plan(){
    var v=mdate.value,cd=$("#countdown"),tl=$("#timeline");
    if(!v){cd.innerHTML="";tl.innerHTML="";return}
    var p=v.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]),days=Math.round((d-today)/MS),rush=false;
    cd.innerHTML=days>=0?'<b>'+days+'</b><span>days to your muhurtham on '+fmt(d)+'</span>':'<span>Choose a date from today onwards.</span>';
    tl.innerHTML=steps.map(function(s){var sd=new Date(d.getTime()-s.o*MS),past=sd<today;if(past&&s.o>=90)rush=true;return '<li class="'+(past?"past":"")+'"><span class="what">'+s.w+(past?'<span class="flag">Passed</span>':'')+'</span><span class="date">'+fmt(sd)+'</span><span class="why">'+s.y+'</span></li>'}).join("")+(rush&&days>=0?'<li><span class="what" style="color:var(--gold-soft)">Short on time? Ask about our rush loom.</span><span class="date"></span><span class="why">Two looms work in parallel to finish a bridal saree in about 18 days.</span></li>':'');
  }
  mdate.addEventListener("input",plan);plan();
  $("#consultForm").addEventListener("submit",function(e){
    e.preventDefault();var n=$("#cname").value.trim(),ph=$("#cphone").value.replace(/\D/g,""),note=$("#formNote");
    if(!n){note.textContent="Add the bride's name so we know who to ask for.";$("#cname").focus();return}
    if(ph.length<10){note.textContent="Enter a 10-digit phone number.";$("#cphone").focus();return}
    var p=mdate.value.split("-"),d=mdate.value?fmt(new Date(+p[0],+p[1]-1,+p[2])):"your date";
    note.textContent="Thank you, "+n+". Your consultation request for "+d+" ("+$("#clook").value.toLowerCase()+") is noted.";e.target.reset();
  });
  // the thaali moment: a shower of jasmine and rose, and a bell
  var key=$(".rituals li.key"),day=$("#day");
  if(key&&day&&"IntersectionObserver" in window){var fired=false;new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!fired){fired=true;if(day._petals)day._petals.burst(70);S.chime(.12)}})},{threshold:.9}).observe(key)}
  S.reveal();
})();
