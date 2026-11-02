
import json,sys
from playwright.sync_api import sync_playwright
U="https://heyyanixx-anime.sites.tab.bot/"
OUT="/home/user/tab/files/heyyanixx-anime"
import os; os.makedirs(OUT,exist_ok=True)
rep={"console_errors":[],"page_errors":[]}
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    c=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,is_mobile=True,has_touch=True)
    pg=c.new_page()
    pg.on("console",lambda m: rep["console_errors"].append(m.text) if m.type=="error" else None)
    pg.on("pageerror",lambda e: rep["page_errors"].append(str(e)))
    pg.goto(U,wait_until="networkidle")
    rep["home_title"]=pg.title()
    rep["overflow_home"]=pg.evaluate("document.documentElement.scrollWidth>window.innerWidth")
    pg.wait_for_timeout(800)
    pg.screenshot(path=OUT+"/home-390.png")
    # watchlist add from hero
    pg.click("[data-wl]"); rep["wl_after_add"]=pg.evaluate("localStorage.getItem('hx_watchlist')")
    # browse search
    pg.goto(U+"#/browse"); pg.wait_for_selector("#q")
    pg.click('[data-lang="hi"]'); rep["hi_count"]=pg.inner_text("#count")
    pg.click('[data-lang="all"]')
    pg.fill("#q","spy"); rep["search_spy"]=pg.inner_text("#count")
    pg.fill("#q","naruto"); rep["search_naruto"]=pg.inner_text("#count")[:80]
    pg.fill("#q","")
    rep["overflow_browse"]=pg.evaluate("document.documentElement.scrollWidth>window.innerWidth")
    # watch
    pg.click(".grid .card >> nth=0"); pg.wait_for_selector("#yt")
    fr=pg.frame_locator("#yt")
    try:
        fr.locator("body").wait_for(timeout=15000)
        pg.wait_for_timeout(4000)
        f=[x for x in pg.frames if "youtube" in x.url][0]
        rep["embed_url"]=f.url
        rep["embed_text"]=f.evaluate("document.body.innerText.slice(0,200)")
        rep["embed_has_player"]=f.evaluate("!!document.querySelector('#movie_player, .html5-video-player')")
    except Exception as e: rep["embed_err"]=str(e)[:300]
    rep["watch_overflow"]=pg.evaluate("document.documentElement.scrollWidth>window.innerWidth")
    rep["ep_items"]=pg.locator("#eplist li").count()
    pg.click("text=Agla ep"); pg.wait_for_timeout(1500); rep["after_next"]=pg.evaluate("location.hash")
    rep["ep_scroll_after_next"]=pg.evaluate("document.getElementById('eplist').scrollTop")
    pg.goto(U+"#/watchlist"); pg.wait_for_timeout(500); rep["wl_cards"]=pg.locator("#wlgrid .card").count()
    pg.goto(U+"#/kahan-dekhe"); pg.fill("#kq","Naruto"); rep["kahan_links"]=pg.locator("#kl a").count()
    
    b.close()
print(json.dumps(rep,indent=1))
