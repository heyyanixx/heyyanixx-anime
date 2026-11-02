(function(){
"use strict";
var D=window.HX_DATA, S=D.series, main=document.getElementById("main");
var byId={}; S.forEach(function(s){byId[s.id]=s;});
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
        set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function thumb(v,q){return "https://i.ytimg.com/vi/"+v+"/"+(q||"mqdefault")+".jpg";}
function langTag(l){return l==="hi"?'<span class="tag">Hindi dub</span>':'<span class="tag en">English sub</span>';}
function wl(){return LS.get("hx_watchlist",[]);}
function inWl(id){return wl().indexOf(id)>-1;}
function toggleWl(id){var w=wl(),i=w.indexOf(id);if(i>-1)w.splice(i,1);else w.unshift(id);LS.set("hx_watchlist",w);return i===-1;}
function epNo(t,i){var m=/(?:Episode|EP)\s*0*(\d+)/i.exec(t);return m?m[1]:String(i+1);}
function card(s){var first=s.eps[0][0];
  return '<a class="card" href="#/watch/'+encodeURIComponent(s.id)+'/1"><img loading="lazy" alt="" src="'+thumb(first)+'" width="320" height="180">'+
  '<div class="b"><div class="n">'+esc(s.name)+'</div><div class="m">'+langTag(s.lang)+'<span>'+s.eps.length+' eps</span></div></div></a>';}

/* ---- v3: shows (franchise + seasons), audio, subtitles, global search ---- */
var SH=window.HX_SHOWS||[], vidLoc={};
SH.forEach(function(sh,k){Object.keys(sh.a).forEach(function(l){sh.a[l].forEach(function(g,gi){g.e.forEach(function(r,p){var v=S[r[0]].eps[r[1]][0];if(!vidLoc[v])vidLoc[v]={k:k,l:l,g:gi,p:p};});});});});
var ALIAS={"attack-on-titan":"aot titan shingeki","one-punch-man":"opm saitama","hunterxhunter":"hxh hunter x hunter gon killua","spyxfamily":"spy x family anya","that-time-i-got-reincarnated-as-a-slime":"tensura slime rimuru","rezero":"re zero subaru","mushoku":"jobless rudeus","dan-da-dan":"dandadan","jojo":"jojo jotaro","welcome-to-demon-school-iruma-kun":"iruma","classroom-of-the-elite":"cote","zom-100-bucket-list-of-the-dead":"zom100 zombie"};
function norm(t){return String(t).toLowerCase().replace(/×/g,"x").replace(/[^a-z0-9\u0900-\u097f]+/g,"");}
function showHay(sh){return norm(sh.name+" "+(ALIAS[sh.k]||""));}
function epRef(r){return {s:S[r[0]],i:r[1],v:S[r[0]].eps[r[1]][0],t:S[r[0]].eps[r[1]][1]};}
function epHref(r){return "#/watch/"+encodeURIComponent(S[r[0]].id)+"/"+(r[1]+1);}
function audioName(l){return l==="hi"?"Hindi":"English";}
function nSeasons(sh,l){return sh.a[l].filter(function(g){return !/^OVA/.test(g.l);}).length;}
function seasonWord(sh,l){var n=nSeasons(sh,l),g=sh.a[l][0].l;return /^All/.test(g)?"":/^Part/.test(g)?n+" parts":n+(n===1?" season":" seasons");}
function showLang(sh,pref){return sh.a[pref]?pref:(sh.a.hi?"hi":"en");}
function showCard(sh,pref){var l=showLang(sh,pref),r=sh.a[l][0].e[0],n=sh.a[l].reduce(function(x,g){return x+g.e.length;},0),sw=seasonWord(sh,l);
  return '<a class="card" href="'+epHref(r)+'"><img loading="lazy" alt="" src="'+thumb(epRef(r).v)+'" width="320" height="180">'+
  '<div class="b"><div class="n">'+esc(sh.name)+'</div><div class="m">'+(sh.a.hi?langTag("hi"):"")+(sh.a.en?langTag("en"):"")+'</div>'+
  '<div class="m">'+(sw?'<span>'+sw+'</span>·':'')+'<span>'+n+' eps</span></div></div></a>';}
var SUBQ="&cc_load_policy=1&cc_lang_pref=hi&hl=hi";
function subOn(){return LS.get("hx_sub",false)===true;}
function embedSrc(v){return "https://www.youtube-nocookie.com/embed/"+v+"?rel=0&playsinline=1"+(subOn()?SUBQ:"");}

function gsearch(q){var t=norm(q); if(!t)return [];
  var out=[];
  SH.forEach(function(sh){if(showHay(sh).indexOf(t)>-1){var l=showLang(sh,"hi"),r=sh.a[l][0].e[0];
    out.push({g:"Muse India shows",h:epHref(r),img:thumb(epRef(r).v),t:sh.name,s:[sh.a.hi?"Hindi dub":"",sh.a.en?"English sub":"",seasonWord(sh,l)].filter(Boolean).join(" · ")});}});
  (CR.series||[]).forEach(function(s){var c=CR.channels[s.ch]||{};if(norm(s.name+" "+(c.name||"")+" "+(s.tag||"")).indexOf(t)>-1)
    out.push({g:"Creator Anime 🔥",h:"#/creator/"+encodeURIComponent(s.id)+"/1",img:thumb(s.eps[0][0]),t:s.name,s:"by "+(c.name||"")+" · "+s.eps.length+" videos"});});
  return out;}
function initSearch(){var q=document.getElementById("gq"),box=document.getElementById("gres"),sel=-1,res=[];
  if(!q)return;
  function close(){box.hidden=true;q.setAttribute("aria-expanded","false");sel=-1;}
  function draw(){res=gsearch(q.value);sel=-1;
    if(!q.value.trim()){close();return;}
    var html="",lastG="";
    res.slice(0,12).forEach(function(r,i){if(r.g!==lastG){html+='<div class="h">'+esc(r.g)+'</div>';lastG=r.g;}
      html+='<a role="option" data-i="'+i+'" href="'+r.h+'"><img alt="" loading="lazy" src="'+r.img+'" width="72" height="40"><span><span class="t">'+esc(r.t)+'</span><br><span class="s">'+esc(r.s)+'</span></span></a>';});
    if(!res.length)html='<div class="none">Kuch nahi mila. <a href="#/kahan-dekhe/'+encodeURIComponent(q.value.trim())+'">Kahan dekhe</a> try karo.</div>';
    box.innerHTML=html;box.hidden=false;q.setAttribute("aria-expanded","true");}
  function mark(){[].forEach.call(box.querySelectorAll("a[data-i]"),function(a){a.classList.toggle("sel",+a.getAttribute("data-i")===sel);});}
  q.addEventListener("input",draw); q.addEventListener("focus",function(){if(q.value.trim())draw();});
  q.addEventListener("keydown",function(e){var n=Math.min(res.length,12);
    if(e.key==="ArrowDown"&&n){sel=(sel+1)%n;mark();e.preventDefault();}
    else if(e.key==="ArrowUp"&&n){sel=(sel-1+n)%n;mark();e.preventDefault();}
    else if(e.key==="Enter"){e.preventDefault();if(n){location.hash=res[sel<0?0:sel].h;close();q.blur();}}
    else if(e.key==="Escape"){close();}});
  document.addEventListener("click",function(e){if(!e.target.closest("#gs"))close();});
  box.addEventListener("click",function(e){if(e.target.closest("a")){close();q.blur();}});
  window.addEventListener("hashchange",close);
}

function setNav(k){[].forEach.call(document.querySelectorAll("[data-nav]"),function(a){a.classList.toggle("on",a.getAttribute("data-nav")===k);if(a.getAttribute("data-nav")===k)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});}
function totalEps(){return S.reduce(function(n,s){return n+s.eps.length;},0);}
function watchLinks(name){var q=encodeURIComponent(name);
  return '<div class="links">'+
  '<a class="btn ghost" target="_blank" rel="noopener" href="https://www.crunchyroll.com/search?q='+q+'">Crunchyroll pe search</a>'+
  '<a class="btn ghost" target="_blank" rel="noopener" href="https://www.netflix.com/search?q='+q+'">Netflix pe search</a>'+
  '<a class="btn ghost" target="_blank" rel="noopener" href="https://www.primevideo.com/search?phrase='+q+'">Prime Video pe search</a>'+
  '</div><p class="note">Ye sirf search links hain. Availability region aur plan pe depend karti hai, hum guarantee nahi karte.</p>';}

function home(){
  setNav("home");
  var feat=S.filter(function(s){return /DAN DA DAN/.test(s.name)&&s.lang==="hi";})[0]||S[0];
  var hi=S.filter(function(s){return s.lang==="hi";}), en=S.filter(function(s){return s.lang==="en";});
  var last=LS.get("hx_last",null), cont="";
  if(last&&byId[last.id]){var ls=byId[last.id];cont='<h2>Continue watching</h2><div class="row">'+
    '<a class="card" href="#/watch/'+encodeURIComponent(ls.id)+'/'+last.ep+'"><img alt="" src="'+thumb(ls.eps[last.ep-1][0])+'" width="320" height="180"><div class="b"><div class="n">'+esc(ls.name)+'</div><div class="m">'+langTag(ls.lang)+'<span>Ep '+esc(epNo(ls.eps[last.ep-1][1],last.ep-1))+'</span></div></div></a></div>';}
  main.innerHTML='<section class="hero" aria-label="Featured"><img src="'+thumb(feat.eps[0][0],"hqdefault")+'" alt="" width="480" height="360">'+
   '<div class="in"><span class="badge">✓ Free &amp; legal</span><h1>'+esc(feat.name)+'</h1><p class="muted" style="margin:0">'+langTag(feat.lang)+' · '+feat.eps.length+' episodes · official upload</p>'+
   '<div class="btns"><a class="btn" href="#/watch/'+encodeURIComponent(feat.id)+'/1">▶ Ep 1 dekho</a><button class="btn ghost" type="button" data-wl="'+esc(feat.id)+'">'+(inWl(feat.id)?"✓ Watchlist me":"+ Watchlist")+'</button></div></div></section>'+
   '<p style="margin-top:14px">Anime free me, bina piracy. '+SH.length+' shows ('+S.length+' playlists), '+totalEps()+' episodes, sab official YouTube uploads. Hindi dub bhi 🔥 Har show me Season tabs + Audio select.</p>'+
   cont+
   '<h2>Hindi dub</h2><div class="row">'+SH.filter(function(x){return x.a.hi;}).slice(0,12).map(function(x){return showCard(x,"hi");}).join("")+'</div>'+
   '<h2>English sub</h2><div class="row">'+SH.filter(function(x){return x.a.en;}).slice(0,12).map(function(x){return showCard(x,"en");}).join("")+'</div>'+
   '<div class="btns"><a class="btn ghost" href="#/browse">Saari series dekho →</a><a class="btn ghost" href="#/creator">Creator Anime 🔥</a></div>'+
   '<h2>Coming soon</h2><ul class="muted soon"><li>Release schedule (naye episodes kab aayenge)</li><li>Ratings &amp; reviews</li></ul>';
}

function browse(q){
  setNav("browse");
  var st=LS.get("hx_browse",{q:"",lang:"all"}); if(q!=null)st.q=q;
  main.innerHTML='<h1>Browse</h1><p class="muted">'+SH.length+' shows · '+S.length+' playlists · '+totalEps()+' episodes · sab free &amp; legal. Ek show = ek card, andar Season tabs.</p>'+
   '<div class="tools"><label class="sr" for="q" style="position:absolute;left:-999px">Search anime</label><input id="q" class="search" type="search" placeholder="Search karo… (Spy, Slime, Titan)" value="'+esc(st.q)+'" autocomplete="off">'+
   '<div class="chips" role="group" aria-label="Language filter">'+
   [["all","All"],["hi","Hindi dub"],["en","English sub"]].map(function(c){return '<button type="button" class="chip" data-lang="'+c[0]+'" aria-pressed="'+(st.lang===c[0])+'">'+c[1]+'</button>';}).join("")+
   '</div></div><div id="res" aria-live="polite"></div>';
  var input=document.getElementById("q");
  function draw(){var t=st.q.trim().toLowerCase();
    var nt=norm(t),list=SH.filter(function(s){return (st.lang==="all"||s.a[st.lang])&&(!nt||showHay(s).indexOf(nt)>-1);});
    document.getElementById("res").innerHTML=list.length?'<p class="muted" id="count">'+list.length+' shows</p><div class="grid">'+list.map(function(x){return showCard(x,st.lang==="all"?"hi":st.lang);}).join("")+'</div>':
      '<div class="empty" id="count">Kuch nahi mila "'+esc(st.q)+'" ke liye. Ye title shayad yaha free nahi hai, <a href="#/kahan-dekhe/'+encodeURIComponent(st.q)+'">kahan dekhe</a> check karo.</div>';
    LS.set("hx_browse",st);}
  input.addEventListener("input",function(){st.q=input.value;draw();});
  [].forEach.call(main.querySelectorAll("[data-lang]"),function(b){b.addEventListener("click",function(){st.lang=b.getAttribute("data-lang");
    [].forEach.call(main.querySelectorAll("[data-lang]"),function(x){x.setAttribute("aria-pressed",String(x===b));});draw();});});
  draw();
}

function watch(id,ep){
  setNav("");
  var s=byId[id]; if(!s){main.innerHTML='<div class="empty">Series nahi mili. <a href="#/browse">Browse</a></div>';return;}
  ep=Math.min(Math.max(parseInt(ep,10)||1,1),s.eps.length);
  var e=s.eps[ep-1]; LS.set("hx_last",{id:id,ep:ep});
  var L=vidLoc[e[0]]||null, sh=L?SH[L.k]:null, lang=L?L.l:s.lang, segs=L?sh.a[lang]:null, seg=L?segs[L.g]:null;
  var showName=sh?sh.name:s.name;
  document.title=showName+(seg?" "+seg.l:"")+" Ep "+epNo(e[1],ep-1)+" · HEYYANIXX Anime";
  // prev/next follow show order (season by season)
  var flat=[]; if(segs)segs.forEach(function(g){g.e.forEach(function(r){flat.push(r);});});
  var fi=-1; if(L){var cnt=0;for(var gi=0;gi<L.g;gi++)cnt+=segs[gi].e.length;fi=cnt+L.p;}
  var prevH=L?(fi>0?epHref(flat[fi-1]):""):(ep>1?"#/watch/"+encodeURIComponent(id)+"/"+(ep-1):"");
  var nextH=L?(fi<flat.length-1?epHref(flat[fi+1]):""):(ep<s.eps.length?"#/watch/"+encodeURIComponent(id)+"/"+(ep+1):"");
  // audio selector
  var audio="";
  if(sh){audio='<div><div class="lbl">Audio</div><div class="seg" role="group" aria-label="Audio">'+
    [["hi","🇮🇳 Hindi"],["en","🇯🇵 English (Japanese + sub)"]].map(function(o){
      if(o[0]===lang)return '<button type="button" class="chip" aria-pressed="true">'+o[1]+'</button>';
      var og=sh.a[o[0]]?sh.a[o[0]].filter(function(g){return g.l===seg.l;})[0]:null;
      if(!og)return '<button type="button" class="chip" disabled aria-disabled="true" title="Not available">'+o[1]+' · not available</button>';
      return '<a class="chip" data-audio="'+o[0]+'" href="'+epHref(og.e[Math.min(L.p,og.e.length-1)])+'">'+o[1]+'</a>';}).join("")+'</div>'+
    (function(){var o=lang==="hi"?"en":"hi";var has=sh.a[o]&&sh.a[o].some(function(g){return g.l===seg.l;});
      return has?'':'<p class="note" style="margin:4px 0 0">'+audioName(o)+' '+esc(seg.l)+' ka official free upload Muse India pe nahi hai, isliye available nahi.</p>';})()+'</div>';}
  var subs='<div><div class="lbl">Subtitles</div><label class="sub"><input type="checkbox" id="subtg"'+(subOn()?' checked':'')+'> <span><strong>Hindi subtitles</strong><br><span class="note">YouTube auto subtitles (quality YouTube ki). Na dikhe toh player ⚙ → Subtitles/CC → Auto-translate → Hindi.</span></span></label></div>';
  var tabs=segs?'<div><div class="lbl">'+(/^Part/.test(segs[0].l)?"Parts":"Seasons")+'</div><div class="stabs" role="tablist" aria-label="Seasons">'+segs.map(function(g,gi){
      return '<button type="button" class="chip" role="tab" data-seg="'+gi+'" aria-selected="'+(gi===L.g)+'" aria-pressed="'+(gi===L.g)+'">'+esc(g.l)+' <span class="muted">('+g.e.length+')</span></button>';}).join("")+'</div></div>':'';
  main.innerHTML='<div class="player"><iframe id="yt" src="'+embedSrc(e[0])+'" title="'+esc(e[1])+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+
   '<div class="watchhead"><div><h1 style="font-size:22px">'+esc(showName)+'</h1><p class="muted" style="margin:0">'+langTag(lang)+(seg?' · '+esc(seg.l):'')+' · Ep '+esc(epNo(e[1],ep-1))+'</p>'+
   '<p class="note" style="margin:6px 0 0">'+esc(e[1])+'</p></div>'+
   '<button class="btn ghost" type="button" data-wl="'+esc(id)+'">'+(inWl(id)?"✓ Watchlist me":"+ Watchlist")+'</button></div>'+
   '<div class="pager">'+(prevH?'<a class="btn ghost" href="'+prevH+'">← Pichla</a>':'<span></span>')+(nextH?'<a class="btn" href="'+nextH+'">Agla ep →</a>':'<span></span>')+'</div>'+
   '<div class="box ctl">'+audio+subs+'</div>'+
   '<p class="note">Official upload by <a target="_blank" rel="noopener" href="'+D.channels[s.ch].url+'">'+esc(D.channels[s.ch].name)+'</a> · <a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+e[0]+'&list='+encodeURIComponent(id)+'">YouTube pe kholo</a></p>'+
   tabs+'<h2 id="ephead"></h2><ul class="eplist" id="eplist"></ul>'+
   '<div class="box"><h2 style="margin-top:0">Kahan dekhe: baaki seasons</h2>'+watchLinks(showName.replace(/\(S\d\).*|Season \d+|S\d+$/i,"").trim())+'</div>';
  function drawList(gi){var ul=document.getElementById("eplist"),list,head;
    if(segs){list=segs[gi].e.map(epRef);head=segs[gi].l+" · "+list.length+" episodes";}
    else{list=s.eps.map(function(x,i){return {s:s,i:i,v:x[0],t:x[1]};});head="Episodes ("+list.length+")";}
    document.getElementById("ephead").textContent=head;
    ul.innerHTML=list.map(function(x){var cur=x.v===e[0];return '<li><a href="#/watch/'+encodeURIComponent(x.s.id)+'/'+(x.i+1)+'"'+(cur?' aria-current="true"':'')+'><span class="no">'+esc(epNo(x.t,x.i))+'</span><span class="tt">'+esc(x.t)+'</span></a></li>';}).join("");
    var c=ul.querySelector('[aria-current="true"]'); ul.scrollTop=0; if(c)ul.scrollTop=Math.max(0,c.parentNode.getBoundingClientRect().top-ul.getBoundingClientRect().top-60);}
  drawList(L?L.g:0);
  [].forEach.call(main.querySelectorAll("[data-seg]"),function(bt){bt.addEventListener("click",function(){var gi=+bt.getAttribute("data-seg");
    [].forEach.call(main.querySelectorAll("[data-seg]"),function(x){var on=x===bt;x.setAttribute("aria-selected",String(on));x.setAttribute("aria-pressed",String(on));});drawList(gi);});});
  var tg=document.getElementById("subtg"); tg.addEventListener("change",function(){LS.set("hx_sub",tg.checked);document.getElementById("yt").src=embedSrc(e[0]);});
}

function watchlist(){
  setNav("watchlist");
  var list=wl().map(function(id){return byId[id];}).filter(Boolean);
  main.innerHTML='<h1>Watchlist</h1><p class="muted">Ye list sirf is phone/browser me save hoti hai (no login).</p>'+
   (list.length?'<div class="grid" id="wlgrid">'+list.map(function(s){return '<div>'+card(s)+'<button class="chip" style="margin-top:6px;width:100%" type="button" data-wl="'+esc(s.id)+'">Hatao</button></div>';}).join("")+'</div>':
   '<div class="empty" id="wlempty">Abhi khaali hai. Kisi series pe "+ Watchlist" dabao. <a href="#/browse">Browse</a></div>');
}

function kahan(q){
  setNav("kahan"); q=q||"";
  main.innerHTML='<h1>Kahan dekhe?</h1><p>Jo anime yaha free nahi hai, uske liye official platforms pe search karo. Piracy sites se door raho: malware, ads aur creators ko paisa nahi milta.</p>'+
   '<div class="tools"><label for="kq" style="position:absolute;left:-999px">Anime name</label><input id="kq" class="search" type="search" placeholder="Anime ka naam likho…" value="'+esc(q)+'"></div><div id="kl"></div>'+
   '<div class="box"><h2 style="margin-top:0">Free official YouTube channels</h2><p><a target="_blank" rel="noopener" href="https://www.youtube.com/@museindiachannel">Muse India</a>: Hindi dub + English sub, full series free (is site ke saare episodes yahi se).</p></div>';
  var i=document.getElementById("kq");
  function d(){var v=i.value.trim();document.getElementById("kl").innerHTML=v?watchLinks(v):'<p class="note">Naam likho, links ban jayenge.</p>';}
  i.addEventListener("input",d); d();
}

/* ---- Creator Anime ---- */
var CR=window.HX_CREATOR||{series:[],channels:{}}, crById={}; CR.series.forEach(function(s){crById[s.id]=s;});
function fmtSubs(n){return n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,"")+"M":n>=1e3?(n/1e3).toFixed(n>=1e5?0:1).replace(/\.0$/,"")+"K":String(n);}
function crGroup(s){return s.tag==="AI anime"?"ai":/Indian/.test(s.tag)?"in":"tr";}
var CR_NOTE='<p class="note crnote">Original creator content, embedded from their own YouTube channels. All rights with the creators.</p>';
function crCredit(s){var c=CR.channels[s.ch];
  return '<a class="credit" target="_blank" rel="noopener" href="'+esc(c.url)+'">▶ Watch on creator\'s channel</a>';}
function crCard(s){var c=CR.channels[s.ch];
  return '<div class="card crcard"><a class="crthumb" href="#/creator/'+encodeURIComponent(s.id)+'/1"><img loading="lazy" alt="" src="'+thumb(s.eps[0][0])+'" width="320" height="180"></a>'+
  '<div class="b"><a class="n" href="#/creator/'+encodeURIComponent(s.id)+'/1">'+esc(s.name)+'</a>'+
  '<div class="m"><span class="tag'+(crGroup(s)==="ai"?" ai":"")+'">'+esc(s.tag)+'</span><span>'+s.eps.length+(s.eps.length===1?' video':' videos')+'</span><span>'+esc(s.lang)+'</span></div>'+
  '<div class="by">by <strong>'+esc(c.name)+'</strong> · '+fmtSubs(c.subs)+' subs</div>'+crCredit(s)+'</div></div>';}
function creator(){
  setNav("creator");
  var st=LS.get("hx_cr","all");
  main.innerHTML='<h1>Creator Anime 🔥</h1><p class="muted" style="margin:0">YouTubers ke khud ke banaye anime + AI anime. '+CR.series.length+' series, '+CR.series.reduce(function(n,s){return n+s.eps.length;},0)+' videos.</p>'+CR_NOTE+
   '<div class="chips" role="group" aria-label="Creator filter" style="margin:12px 0">'+
   [["all","Sab"],["in","Indian 🇮🇳"],["ai","AI anime"],["tr","Trending"]].map(function(c){return '<button type="button" class="chip" data-cr="'+c[0]+'" aria-pressed="'+(st===c[0])+'">'+c[1]+'</button>';}).join("")+
   '</div><div class="grid crgrid" id="crgrid"></div>';
  function draw(){document.getElementById("crgrid").innerHTML=CR.series.filter(function(s){return st==="all"||crGroup(s)===st;}).map(crCard).join("");LS.set("hx_cr",st);}
  [].forEach.call(main.querySelectorAll("[data-cr]"),function(b){b.addEventListener("click",function(){st=b.getAttribute("data-cr");
    [].forEach.call(main.querySelectorAll("[data-cr]"),function(x){x.setAttribute("aria-pressed",String(x===b));});draw();});});
  draw();
}
function crWatch(id,ep){
  setNav("creator");
  var s=crById[id]; if(!s){main.innerHTML='<div class="empty">Series nahi mili. <a href="#/creator">Creator Anime</a></div>';return;}
  var c=CR.channels[s.ch];
  ep=Math.min(Math.max(parseInt(ep,10)||1,1),s.eps.length); var e=s.eps[ep-1];
  document.title=s.name+" · "+e[1]+" · HEYYANIXX Anime";
  main.innerHTML='<p style="margin:0 0 10px"><a href="#/creator">← Creator Anime</a></p>'+
   '<div class="player"><iframe id="yt" src="https://www.youtube-nocookie.com/embed/'+e[0]+'?rel=0&playsinline=1" title="'+esc(e[1])+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+
   '<h1 style="font-size:22px;margin-top:12px">'+esc(s.name)+'</h1><p class="muted" style="margin:0">'+esc(e[1])+' · '+esc(e[2])+'</p>'+
   '<div class="box crbox"><div>Made by <strong>'+esc(c.name)+'</strong> ('+esc(c.handle)+') · '+fmtSubs(c.subs)+' subscribers</div><p class="note" style="margin:4px 0 8px">'+esc(s.blurb)+'</p>'+
   '<div class="links">'+crCredit(s)+'<a class="btn ghost" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+e[0]+'">YouTube pe kholo</a></div></div>'+
   '<div class="pager">'+(ep>1?'<a class="btn ghost" href="#/creator/'+encodeURIComponent(id)+'/'+(ep-1)+'">← Pichla</a>':'<span></span>')+
   (ep<s.eps.length?'<a class="btn" href="#/creator/'+encodeURIComponent(id)+'/'+(ep+1)+'">Agla →</a>':'<span></span>')+'</div>'+
   '<h2>Videos ('+s.eps.length+')</h2><ul class="eplist">'+s.eps.map(function(x,i){return '<li><a href="#/creator/'+encodeURIComponent(id)+'/'+(i+1)+'"'+(i+1===ep?' aria-current="true"':'')+'><span class="no">'+(i+1)+'</span><span class="tt">'+esc(x[1])+' <span class="muted">· '+esc(x[2])+'</span></span></a></li>';}).join("")+'</ul>'+
   (s.eps.length<3?'<p class="note">Baaki episodes creator ke channel pe dekho (kuch videos creator ne embed ke liye band rakhe hain).</p>':'')+CR_NOTE;
}

function route(){
  var h=decodeURIComponent(location.hash.replace(/^#\/?/,"")), p=h.split("/");
  if(p[0]==="browse")browse(); else if(p[0]==="watch")watch(p[1],p[2]); else if(p[0]==="watchlist")watchlist();
  else if(p[0]==="creator"){if(p[1])crWatch(p[1],p[2]);else creator();}
  else if(p[0]==="kahan-dekhe")kahan(p.slice(1).join("/")); else home();
  if(p[0]!=="watch"&&!(p[0]==="creator"&&p[1]))document.title="HEYYANIXX Anime: free & legal anime, Hindi dub";
  window.scrollTo(0,0);
}
document.addEventListener("click",function(ev){var b=ev.target.closest("[data-wl]");if(!b)return;
  var id=b.getAttribute("data-wl"),added=toggleWl(id);
  if(location.hash.indexOf("#/watchlist")===0){watchlist();return;}
  b.textContent=added?"✓ Watchlist me":"+ Watchlist";});
window.addEventListener("hashchange",route); initSearch(); route();
})();
