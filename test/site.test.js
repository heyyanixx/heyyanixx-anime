const test=require("node:test");const assert=require("node:assert");const fs=require("fs");const path=require("path");const vm=require("vm");
const site=path.join(__dirname,"..","site");
const html=fs.readFileSync(path.join(site,"index.html"),"utf8");
test("title, viewport, local assets, footer note",()=>{
  assert.match(html,/<title>HEYYANIXX Anime/);
  assert.match(html,/name="viewport" content="width=device-width/);
  for(const f of ["styles.css","data.js","script.js"]){assert.ok(html.includes(f));assert.ok(fs.existsSync(path.join(site,f)),f);}
  assert.ok(html.includes("All videos are official free uploads embedded from the rights holders' YouTube channels."));
  assert.doesNotMatch(html+fs.readFileSync(path.join(site,"script.js"),"utf8"),/lorem|TODO|FIXME|placeholder\.com/i);
});
test("data: real-looking YouTube ids from the official channel only",()=>{
  const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(site,"data.js"),"utf8"),ctx);
  const D=ctx.window.HX_DATA;
  assert.deepStrictEqual(Object.keys(D.channels),["muse-in"]);
  assert.strictEqual(D.channels["muse-in"].id,"UCYYhAzgWuxPauRXdPpLAX3Q");
  assert.ok(D.series.length>=30);
  let n=0;for(const s of D.series){assert.ok(["hi","en"].includes(s.lang));assert.ok(s.eps.length>0);for(const [v,t] of s.eps){assert.match(v,/^[A-Za-z0-9_-]{11}$/);assert.ok(t.length>0);n++;}}
  assert.ok(n>1000);assert.ok(D.series.some(s=>s.lang==="hi"));
});
test("embeds only youtube-nocookie, no pirate hosts",()=>{
  const js=fs.readFileSync(path.join(site,"script.js"),"utf8");
  assert.ok(js.includes("https://www.youtube-nocookie.com/embed/"));
  assert.doesNotMatch(js+html,/animesalt|gogoanime|9anime|zoro|hianime/i);
});
