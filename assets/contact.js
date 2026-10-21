(function(){
  "use strict";
  var S=window.SVARA,$=S.$,$$=S.$$,MS=864e5;
  // hours, with today highlighted
  var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],hrs=["10 am – 6 pm","10 am – 8 pm","10 am – 8 pm","10 am – 8 pm","10 am – 8 pm","10 am – 8 pm","9 am – 9 pm"],t=new Date().getDay();
  $("#hours").innerHTML=[1,2,3,4,5,6,0].map(function(d){return '<tr class="'+(d===t?"today":"")+'"><td>'+days[d]+(d===t?" · today":"")+'</td><td>'+hrs[d]+'</td></tr>'}).join("");
  // message form
  $("#msgForm").addEventListener("submit",function(e){e.preventDefault();var n=$("#mName").value.trim(),c=$("#mContact").value.trim(),m=$("#mMsg").value.trim(),note=$("#msgNote");
    if(!n){note.textContent="Add your name.";$("#mName").focus();return}
    if(!/@/.test(c)&&c.replace(/\D/g,"").length<10){note.textContent="Add an email address or a 10-digit phone number so we can reply.";$("#mContact").focus();return}
    if(m.length<5){note.textContent="Write a few words about what you need.";$("#mMsg").focus();return}
    note.textContent="Thank you, "+n+". Your message about “"+$("#mTopic").value.toLowerCase()+"” is noted.";e.target.reset()});
  // appointment
  var types=[["store","In-store visit","45 min"],["bridal","Bridal consultation","2 hours"],["video","Video call","30 min"]],type="store",slot=null;
  $("#types").innerHTML=types.map(function(x){return '<button class="slot" role="radio" data-t="'+x[0]+'">'+x[1]+' · '+x[2]+'</button>'}).join("");
  var times=["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];
  var ad=$("#aDate"),today=new Date();today.setHours(0,0,0,0);
  var iso=function(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
  ad.min=iso(today);ad.value=iso(new Date(today.getTime()+2*MS));
  function seed(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
  function render(){
    $$("#types .slot").forEach(function(b){var on=b.dataset.t===type;b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});
    var d=ad.value?new Date(ad.value+"T00:00"):null,dow=d?d.getDay():1,h=seed(ad.value+type);
    var list=times.filter(function(x){return !(dow===0&&+x.slice(0,2)>=18)&&!(type==="bridal"&&+x.slice(0,2)>16)});
    $("#slots").innerHTML=list.map(function(x,i){var taken=((h>>i)&3)===0;return '<button class="slot" role="radio" data-s="'+x+'"'+(taken?' disabled aria-label="'+x+', booked"':'')+'>'+x+'</button>'}).join("");
    if(slot&&!list.some(function(x){return x===slot}))slot=null;
    $$("#slots .slot").forEach(function(b){var on=b.dataset.s===slot;if(b.disabled&&on)slot=null;b.classList.toggle("on",b.dataset.s===slot);b.setAttribute("aria-checked",b.dataset.s===slot)});
  }
  $("#types").addEventListener("click",function(e){var b=e.target.closest(".slot");if(b){type=b.dataset.t;render()}});
  $("#slots").addEventListener("click",function(e){var b=e.target.closest(".slot");if(b&&!b.disabled){slot=b.dataset.s;render()}});
  ad.addEventListener("input",render);render();
  $("#apptForm").addEventListener("submit",function(e){e.preventDefault();var n=$("#aName").value.trim(),p=$("#aPhone").value.replace(/\D/g,""),note=$("#apptNote");
    if(!ad.value){note.textContent="Choose a date.";return}
    if(!slot){note.textContent="Choose a time.";return}
    if(!n){note.textContent="Add your name.";$("#aName").focus();return}
    if(p.length<10){note.textContent="Enter a 10-digit phone number.";$("#aPhone").focus();return}
    note.textContent="";var d=new Date(ad.value+"T00:00"),tp=types.filter(function(x){return x[0]===type})[0];
    $("#confirm").innerHTML='<div class="confirm"><b>'+tp[1]+' requested</b><span>'+d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})+' at '+slot+' for '+n+'. We’ll confirm by phone.</span></div>';
    e.target.reset();
  });
  S.reveal();
})();
