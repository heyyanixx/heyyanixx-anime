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
   '<p style="margin-top:14px">Anime free me, bina piracy. '+S.length+' series, '+totalEps()+' episodes, sab official YouTube uploads. Hindi dub bhi 🔥</p>'+
   cont+
   '<h2>Hindi dub</h2><div class="row">'+hi.slice(0,12).map(card).join("")+'</div>'+
   '<h2>English sub</h2><div class="row">'+en.slice(0,12).map(card).join("")+'</div>'+
   '<div class="btns"><a class="btn ghost" href="#/browse">Saari series dekho →</a><a class="btn ghost" href="#/creator">Creator Anime 🔥</a></div>'+
   '<h2>Coming soon</h2><ul class="muted soon"><li>Release schedule (naye episodes kab aayenge)</li><li>Ratings &amp; reviews</li></ul>';
}

function browse(q){
  setNav("browse");
  var st=LS.get("hx_browse",{q:"",lang:"all"}); if(q!=null)st.q=q;
  main.innerHTML='<h1>Browse</h1><p class="muted">'+S.length+' series · sab free &amp; legal</p>'+
   '<div class="tools"><label class="sr" for="q" style="position:absolute;left:-999px">Search anime</label><input id="q" class="search" type="search" placeholder="Search karo… (Spy, Slime, Titan)" value="'+esc(st.q)+'" autocomplete="off">'+
   '<div class="chips" role="group" aria-label="Language filter">'+
   [["all","All"],["hi","Hindi dub"],["en","English sub"]].map(function(c){return '<button type="button" class="chip" data-lang="'+c[0]+'" aria-pressed="'+(st.lang===c[0])+'">'+c[1]+'</button>';}).join("")+
   '</div></div><div id="res" aria-live="polite"></div>';
  var input=document.getElementById("q");
  function draw(){var t=st.q.trim().toLowerCase();
    var list=S.filter(function(s){return (st.lang==="all"||s.lang===st.lang)&&(!t||s.name.toLowerCase().indexOf(t)>-1);});
    document.getElementById("res").innerHTML=list.length?'<p class="muted" id="count">'+list.length+' results</p><div class="grid">'+list.map(card).join("")+'</div>':
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
  document.title=s.name+" Ep "+epNo(e[1],ep-1)+" · HEYYANIXX Anime";
  main.innerHTML='<div class="player"><iframe id="yt" src="https://www.youtube-nocookie.com/embed/'+e[0]+'?rel=0&playsinline=1" title="'+esc(e[1])+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+
   '<div class="watchhead"><div><h1 style="font-size:22px">'+esc(s.name)+'</h1><p class="muted" style="margin:0">'+langTag(s.lang)+' · Ep '+esc(epNo(e[1],ep-1))+' of '+s.eps.length+'</p>'+
   '<p class="note" style="margin:6px 0 0">'+esc(e[1])+'</p></div>'+
   '<button class="btn ghost" type="button" data-wl="'+esc(id)+'">'+(inWl(id)?"✓ Watchlist me":"+ Watchlist")+'</button></div>'+
   '<div class="pager">'+(ep>1?'<a class="btn ghost" href="#/watch/'+encodeURIComponent(id)+'/'+(ep-1)+'">← Pichla</a>':'<span></span>')+
   (ep<s.eps.length?'<a class="btn" href="#/watch/'+encodeURIComponent(id)+'/'+(ep+1)+'">Agla ep →</a>':'<span></span>')+'</div>'+
   '<p class="note">Official upload by <a target="_blank" rel="noopener" href="'+D.channels[s.ch].url+'">'+esc(D.channels[s.ch].name)+'</a> · <a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+e[0]+'&list='+encodeURIComponent(id)+'">YouTube pe kholo</a></p>'+
   '<h2>Episodes ('+s.eps.length+')</h2><ul class="eplist" id="eplist">'+s.eps.map(function(x,i){return '<li><a href="#/watch/'+encodeURIComponent(id)+'/'+(i+1)+'"'+(i+1===ep?' aria-current="true"':'')+'><span class="no">'+esc(epNo(x[1],i))+'</span><span class="tt">'+esc(x[1])+'</span></a></li>';}).join("")+'</ul>'+
   '<div class="box"><h2 style="margin-top:0">Kahan dekhe: baaki seasons</h2>'+watchLinks(s.name.replace(/\(S\d\).*|Season \d+|S\d+$/i,"").trim())+'</div>';
  var ul=document.getElementById("eplist"),cur=ul.querySelector('[aria-current="true"]'); if(cur&&ep>3) ul.scrollTop=cur.parentNode.getBoundingClientRect().top-ul.getBoundingClientRect().top-60;
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
window.addEventListener("hashchange",route); route();
})();
