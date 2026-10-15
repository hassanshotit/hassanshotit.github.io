/* Form endpoint: leave empty to use the email fallback (no signup).
   Set e.g. "https://formspree.io/f/XXXX" or "https://formsubmit.co/ajax/hassanshotit@gmail.com" to post directly.
   On Netlify: add data-netlify="true" + name="inquiry" to the form, and set FORM_ENDPOINT = "/". */
const FORM_ENDPOINT = "";
const TO_EMAIL = "hassanshotit@gmail.com";
/* Pricing flag: set true to show the athlete "Starting at" line (edit its text in index.html first). */
const SHOW_ATHLETE_STARTING_AT = false;

const root = document.documentElement;
var curOn = false;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const desktop = () => innerWidth > 860;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const animate = hasGSAP && !reduce;
if (animate) { root.classList.add("anim"); gsap.registerPlugin(ScrollTrigger); }
if (SHOW_ATHLETE_STARTING_AT) document.getElementById("athleteStart").hidden = false;
document.getElementById("yr").textContent = new Date().getFullYear();

/* If a hi-res file is missing (lite build), fall back to the thumbnail. */
document.addEventListener("error", e => { const t = e.target; if (t.tagName === "IMG" && !t.dataset.fb && /assets\/grid\//.test(t.currentSrc || t.src)) { t.dataset.fb = 1; t.removeAttribute("srcset"); t.src = (t.currentSrc || t.src).replace("/grid/", "/thumbs/"); } }, true);

/* ---------- data: Hassan's own photos ---------- */
const pad = n => String(n).padStart(2, "0");
const sets = {football:37, basketball:8, soccer:13, other:4};
const label = {football:"Football", basketball:"Basketball", soccer:"Soccer", other:"Track and field", featured:"Featured", media:"Media day"};
/* Hassan's shared album (assets/grid|full|thumbs/album-NN.jpg). Sport grouped only where visually obvious; otherwise "featured". */
const ALBUM = {football:[1,2,3,4,6,20,21,22,23,24,25,37,38,39,40,41,42,43,44,45], basketball:[7,8,9,10,11,12,14,15,16,26,27,28,29,30,31,32,33,34,35,36], featured:[5,13,17,18,19]};
const sportOf = {};
for (const [k,arr] of Object.entries(ALBUM)) arr.forEach(n => sportOf[`album-${pad(n)}`] = k);
const best = [37,3,30,21,14,25,39,8,1,22,32,20,5,41,12,13].map(n => `album-${pad(n)}`);
const featured = [...best];
const all = [...best];
Object.keys(sportOf).sort().forEach(id => { if (!all.includes(id)) all.push(id); });
["football-31","basketball-02","soccer-08","football-29","football-07","basketball-06","football-22","soccer-12","other-03","football-32"].forEach(id => all.push(id));
for (const [k,n] of Object.entries(sets)) for (let i=1;i<=n;i++){ const id=`${k}-${pad(i)}`; if(!all.includes(id)) all.push(id); }
const kind = id => sportOf[id] || id.split("-")[0];
const alt = id => `${label[kind(id)]} photo by Hassan Naji`;

/* ---------- intro (once per session, <1.5s, skippable) ---------- */
const intro = document.getElementById("intro");
let introDone = root.classList.contains("seen") || reduce;
function endIntro(){
  if (introDone && !intro.isConnected) return;
  introDone = true;
  try { sessionStorage.setItem("intro","1"); } catch(e){}
  intro.classList.add("out");
  setTimeout(() => intro.remove(), reduce ? 0 : 650);
  heroIn();
}
if (introDone) { intro.remove(); } else {
  intro.querySelector(".intro-skip").onclick = endIntro;
  addEventListener("keydown", endIntro, {once:true});
  intro.addEventListener("click", endIntro);
  setTimeout(endIntro, 1250);
}

/* ---------- smooth scroll ---------- */
let lenis = null;
/* Native scrolling (Lenis removed for responsiveness). */
const scrollToEl = el => lenis ? lenis.scrollTo(el, {offset:-10, duration:1.2}) : el.scrollIntoView({behavior: reduce ? "auto" : "smooth"});
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  const id = a.getAttribute("href"); if (id.startsWith("#work/")) { closeMenu(); return; }
  const el = id === "#top" ? document.body : document.querySelector(id);
  if (!el) return; e.preventDefault(); closeMenu(); scrollToEl(el); history.replaceState(null, "", id);
}));

/* ---------- nav, progress ---------- */
const fb = document.getElementById("fbook");
const nav = document.querySelector(".nav"), bar = document.getElementById("progress");
let lastY = 0;
function onScroll(){
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle("solid", y > 40);
  fb.classList.toggle("show", y > innerHeight * .8);
  nav.classList.toggle("hide", y > 600 && y > lastY && !menu.classList.contains("open"));
  lastY = y;
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
}
addEventListener("scroll", onScroll, {passive:true});

/* ---------- menu ---------- */
const menu = document.getElementById("menu"), menuBtn = document.getElementById("menuBtn");
function openMenu(){
  menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open"));
  menuBtn.setAttribute("aria-expanded","true"); lenis && lenis.stop();
  menu.querySelectorAll("nav a").forEach((a,i) => a.style.transitionDelay = reduce ? "0s" : `${.15 + i*.06}s`);
  setTimeout(() => menu.querySelector("a").focus(), reduce ? 0 : 300);
}
function closeMenu(){
  if (menu.hidden) return;
  menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded","false"); lenis && lenis.start();
  menu.querySelectorAll("nav a").forEach(a => a.style.transitionDelay = "0s");
  setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 600);
}
menuBtn.onclick = () => menu.classList.contains("open") ? (closeMenu(), menuBtn.focus()) : openMenu();
addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); menuBtn.focus(); } });

/* ---------- hero video ---------- */
const hv = document.getElementById("heroVid"), mt = document.getElementById("motionToggle");
const setPlay = p => { if (p) { if (hv.preload === "none") { hv.preload = "auto"; hv.load(); } hv.play().catch(()=>{}); } else hv.pause();
  mt.textContent = p ? "Pause video" : "Play video"; mt.setAttribute("aria-pressed", String(!p)); };
const saveData = navigator.connection && navigator.connection.saveData;
if (reduce || saveData) setPlay(false); else addEventListener("load", () => setPlay(true));
mt.onclick = () => setPlay(hv.paused);
hv.addEventListener("loadedmetadata", () => { if (hv.duration > 25) hv.currentTime = 18; }, {once:true});

const dlg = document.getElementById("reelDlg"), dv = dlg.querySelector("video");
const openReel = () => { dlg.showModal(); dv.play().catch(()=>{}); };
document.getElementById("reelBtn").onclick = openReel; document.getElementById("reelBtn2").onclick = openReel;
dlg.querySelector(".close").onclick = () => dlg.close();
dlg.addEventListener("close", () => dv.pause());
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

/* ---------- REC timecode ---------- */
const tc = document.getElementById("tc");
if (tc && !reduce) { const t0 = performance.now(); setInterval(() => { const f = Math.floor((performance.now()-t0)/1000*24);
  const fr = f%24, s = Math.floor(f/24)%60, m = Math.floor(f/1440)%60, h = Math.floor(f/86400);
  tc.textContent = [h,m,s,fr].map(x => String(x).padStart(2,"0")).join(":"); }, 42); }

/* ---------- chapters: camera readout from real EXIF (data/exif.json, built from the original files) ---------- */
let EXIF = {};
const roHTML = e => [["s","Shutter","",""],["a","Aperture","F",""],["i","ISO","",""],["f","Focal","","mm"]]
  .filter(([k]) => e && e[k]).map(([k,n,pre,suf]) => `<span><small>${n}</small><b>${pre}${e[k]}${suf}</b></span>`).join("");
function fillReadouts(){
  document.querySelectorAll(".ro[data-id]").forEach(p => { const h = roHTML(EXIF[p.dataset.id]); if (h) { p.innerHTML = h; p.hidden = false; } });
}
fetch("data/exif.json").then(r => r.json()).then(d => { EXIF = d || {}; fillReadouts(); }).catch(() => {});

/* chapter link can open the gallery already filtered (football, basketball, soccer) */
let pendingF = null;
document.querySelectorAll("[data-filter]").forEach(a => a.addEventListener("click", () => { pendingF = a.dataset.filter; }));

/* ---------- lightbox with keyboard nav ---------- */
const lb = document.getElementById("lb"), lbImg = lb.querySelector("img"), lbCount = lb.querySelector(".lb-count");
let lbList = [], lbI = 0, lastFocus, lbTitle = ""; const lbCap = lb.querySelector(".lb-cap");
function showLb(){ const id = lbList[lbI]; lbImg.style.opacity = 0;
  const n = new Image(); n.onload = () => { lbImg.src = n.src; lbImg.alt = alt(id); lbImg.style.opacity = 1; }; const chain = [`assets/grid/${id}.jpg`, `assets/thumbs/${id}.jpg`]; n.onerror = () => { const nx = chain.shift(); if (nx) n.src = nx; }; n.src = id.startsWith("media-") ? chain.shift() : `assets/full/${id}.jpg`; lbCap.textContent = lbTitle || label[kind(id)];
  lbCount.textContent = `${lbI+1} / ${lbList.length}`;
  const lro = lb.querySelector(".lb-ro"), h = roHTML(EXIF[id]); lro.innerHTML = h; lro.hidden = !h; }
function openLb(list, i, title=""){ lbTitle = title; lastFocus = document.activeElement; lbList = list; lbI = i; lb.hidden = false; lenis && lenis.stop(); showLb(); lb.querySelector(".lb-close").focus(); }
function closeLb(){ lb.hidden = true; lenis && lenis.start(); lastFocus && lastFocus.focus(); }
const step = d => { lbI = (lbI + d + lbList.length) % lbList.length; showLb(); };
lb.querySelector(".lb-close").onclick = closeLb;
lb.querySelector(".lb-prev").onclick = () => step(-1);
lb.querySelector(".lb-next").onclick = () => step(1);
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") { closeLb(); e.stopImmediatePropagation(); } else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "Tab") { const f = [...lb.querySelectorAll("button")]; const i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
});
let tx = null;
lb.addEventListener("touchstart", e => tx = e.touches[0].clientX, {passive:true});
lb.addEventListener("touchend", e => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) step(d < 0 ? 1 : -1); tx = null; });

/* ---------- category tiles + full-screen panel (#work/<cat>) ---------- */
let MIX = [], MEDIA = [];
function setCount(k, t){ const el = document.querySelector(`[data-count=${k}]`); if (el) el.textContent = t; }
setCount("sports", `${all.length} photos`);
fetch("data/media-days.json").then(r => r.json()).then(d => { MEDIA = d.photos || []; MEDIA.forEach(id => sportOf[id] = "media"); setCount("media-days", `${MEDIA.length} photos`); route(); }).catch(() => {});
fetch("data/mixtapes.json").then(r => r.json()).then(d => { MIX = d.mixtapes || []; setCount("mixtapes", `${MIX.length} films`); route(); }).catch(() => {});
function hoverPreview(el){
  const v = el.querySelector("video"); if (!v || reduce || !finePointer) return;
  el.addEventListener("mouseenter", () => { if (!v.src) v.src = v.dataset.src || v.getAttribute("data-src"); v.play().then(() => el.classList.add("playing")).catch(()=>{}); });
  el.addEventListener("mouseleave", () => { v.pause(); el.classList.remove("playing"); });
}
document.querySelectorAll(".frame").forEach(hoverPreview);
if (animate) gsap.from(".frame", {clipPath:"inset(100% 0 0 0)", duration:1.1, ease:"power3.inOut", stagger:.12, scrollTrigger:{trigger:".strip-film", start:"top 80%", once:true}});

const panel = document.getElementById("panel"), pBody = document.getElementById("panelBody"),
  pTitle = document.getElementById("panelTitle"), pKick = document.getElementById("panelKicker"), pFilters = panel.querySelector(".panel-filters");
let panelReturn = null, openedByNav = false;
const CATS = {
  sports: {title:"Sports", kicker:"Photography", filters:[["all","All"],["football","Football"],["basketball","Basketball"],["soccer","Soccer"],["other","Track & more"],["featured","Featured"]]},
  mixtapes: {title:"Mixtapes", kicker:"Video", filters:[["all","All"],["football","Football"],["basketball","Basketball"]]},
  "media-days": {title:"Media Days", kicker:"Photography", filters:[]}
};
function buildFilters(cat, active){
  pFilters.innerHTML = CATS[cat].filters.map(([v,l]) => `<button type="button" data-f="${v}" class="${v===active?"on":""}" aria-pressed="${v===active}">${l}</button>`).join("");
  pFilters.hidden = !CATS[cat].filters.length;
  pFilters.querySelectorAll("button").forEach(b => b.onclick = () => renderPanel(cat, b.dataset.f));
}
function stag(i){ return reduce ? "" : `style="animation-delay:${Math.min(i,14)*45}ms"`; }
function renderPanel(cat, f="all"){
  buildFilters(cat, f);
  if (cat === "sports") {
    const list = all.filter(id => f === "all" || kind(id) === f);
    pBody.innerHTML = `<div class="pgrid">${list.map((id,i) => `<button type="button" class="tile pin-item" ${stag(i)} data-i="${i}" data-cursor="View" aria-label="Open ${alt(id)}"><img src="assets/thumbs/${id}.jpg" srcset="assets/thumbs/${id}.jpg 560w, assets/grid/${id}.jpg 1100w" sizes="(max-width:860px) 50vw, 33vw" alt="${alt(id)}" loading="lazy" decoding="async"></button>`).join("")}</div>`;
    pBody.querySelectorAll(".tile").forEach(b => b.onclick = () => openLb(list, +b.dataset.i));
  } else if (cat === "mixtapes") {
    const list = MIX.filter(m => f === "all" || m.sport === f);
    pBody.innerHTML = `<div class="mgrid">${list.map((m,i) => `<button type="button" class="mx pin-item ${m.ratio > 1.2 ? "wide" : ""}" ${stag(i)} data-id="${m.id}" data-cursor="Play" aria-label="Play ${m.title}, ${m.kind}, ${m.duration}">
      <div class="mx-media" style="aspect-ratio:${m.ratio}"><img src="assets/mixtapes/${m.id}-poster.jpg" alt="" loading="lazy"><video muted loop playsinline preload="none" data-src="assets/mixtapes/${m.id}-preview.mp4"></video><span class="mx-play">Play · ${m.duration}</span></div>
      <div class="mx-meta"><b>${m.title}</b><span class="mk">${m.kind}</span></div></button>`).join("") || '<p class="ev-count">Nothing here yet.</p>'}</div>`;
    pBody.querySelectorAll(".mx").forEach(b => { hoverPreview(b); b.onclick = () => playVideo(MIX.find(m => m.id === b.dataset.id)); });
  } else if (cat === "media-days") {
    pBody.innerHTML = MEDIA.length ? `<div class="pgrid">${MEDIA.map((id,i) => `<button type="button" class="tile pin-item" ${stag(i)} data-i="${i}" data-cursor="View" aria-label="Open media day photo ${i+1} of ${MEDIA.length}"><img src="assets/thumbs/${id}.jpg" srcset="assets/thumbs/${id}.jpg 380w, assets/grid/${id}.jpg 960w" sizes="(max-width:860px) 50vw, 33vw" alt="Media day photo ${i+1}" loading="lazy" decoding="async"></button>`).join("")}</div>` : '<p class="ev-count">Loading…</p>';
    pBody.querySelectorAll(".tile").forEach(b => b.onclick = () => openLb(MEDIA, +b.dataset.i, "Media day"));
  }
  bindCursor(pBody);
}
function openPanel(cat){
  panel.dataset.cat = cat; pTitle.textContent = CATS[cat].title; pKick.textContent = CATS[cat].kicker;
  panel.querySelectorAll(".panel-tabs a").forEach(a => a.getAttribute("href") === `#work/${cat}` ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  const pf = pendingF; pendingF = null; renderPanel(cat, pf && CATS[cat].filters.some(x => x[0] === pf) ? pf : "all"); panel.scrollTop = 0;
  if (panel.hidden) { panelReturn = document.activeElement; panel.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("open")));
    lenis && lenis.stop(); document.body.style.overflow = "hidden"; setTimeout(() => panel.querySelector(".panel-close").focus({preventScroll:true}), reduce ? 0 : 400); }
}
function closePanel(){
  if (panel.hidden) return;
  panel.classList.remove("open"); lenis && lenis.start(); document.body.style.overflow = "";
  setTimeout(() => { panel.hidden = true; pBody.innerHTML = ""; }, reduce ? 0 : 700);
  panelReturn && panelReturn.focus && panelReturn.focus({preventScroll:true});
}
function route(){
  const m = location.hash.match(/^#work\/(sports|mixtapes|media-days)$/);
  if (m) openPanel(m[1]); else closePanel();
}
addEventListener("hashchange", () => { openedByNav = true; route(); });
panel.querySelector(".panel-close").onclick = () => {
  if (openedByNav && history.length > 1) history.back(); else { history.replaceState(null, "", location.pathname + location.search); closePanel(); }
};
addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden && lb.hidden && !vidDlg.open) panel.querySelector(".panel-close").click(); });
document.getElementById("panelBook").addEventListener("click", e => {
  e.preventDefault(); history.replaceState(null, "", "#book"); closePanel();
  setTimeout(() => { const el = document.getElementById("book"); lenis ? lenis.scrollTo(el, {offset:-10}) : el.scrollIntoView({behavior: reduce ? "auto" : "smooth"}); }, reduce ? 0 : 450);
});
route();

/* video player */
const vidDlg = document.getElementById("vidDlg"), vv = vidDlg.querySelector("video");
function playVideo(m){ if (!m) return; vv.poster = `assets/mixtapes/${m.id}-poster.jpg`; vv.src = `assets/mixtapes/${m.id}.mp4`;
  vidDlg.querySelector(".vid-cap").textContent = `${m.title} · ${m.kind}`; vidDlg.showModal(); vv.muted = false; vv.play().catch(()=>{}); }
vidDlg.querySelector(".close").onclick = () => vidDlg.close();
vidDlg.addEventListener("close", () => { vv.pause(); vv.removeAttribute("src"); vv.load(); });
vidDlg.addEventListener("click", e => { if (e.target === vidDlg) vidDlg.close(); });

/* ---------- custom cursor (desktop fine pointers only) ---------- */
const cur = document.getElementById("cursor"), curTxt = cur.querySelector("span");
let cx = 0, cy = 0, mx = 0, my = 0;
function bindCursor(scope){
  if (!curOn) return;
  scope.querySelectorAll("[data-cursor]").forEach(el => {
    el.addEventListener("mouseenter", () => { cur.classList.add("big"); curTxt.textContent = el.dataset.cursor; });
    el.addEventListener("mouseleave", () => { cur.classList.remove("big"); curTxt.textContent = ""; });
  });
  scope.querySelectorAll("a,button:not([data-cursor]),select,input,textarea").forEach(el => {
    el.addEventListener("mouseenter", () => cur.classList.add("link"));
    el.addEventListener("mouseleave", () => cur.classList.remove("link"));
  });
}
if (finePointer && !reduce) {
  curOn = true; root.classList.add("cursor-on");
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; }, {passive:true});
  (function loop(){ cx += (mx - cx) * .2; cy += (my - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener("mouseleave", () => cur.style.opacity = 0);
  document.addEventListener("mouseenter", () => cur.style.opacity = 1);
  bindCursor(document);
}

/* ---------- magnetic buttons ---------- */
if (finePointer && !reduce) document.querySelectorAll(".magnetic").forEach(btn => {
  const inner = btn.querySelector("span");
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect(), x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
    btn.style.transform = `translate(${x*.25}px,${y*.35}px)`; if (inner) inner.style.transform = `translate(${x*.12}px,${y*.15}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transition = "transform .5s cubic-bezier(.22,.61,.36,1),background .4s,color .4s,border-color .4s";
    btn.style.transform = ""; if (inner) { inner.style.transition = "transform .5s"; inner.style.transform = ""; }
    setTimeout(() => btn.style.transition = "", 500); });
});

/* ---------- scroll animations ---------- */
function heroIn(){
  if (!animate) return;
  gsap.to(".hero .ln>span", {y:0, duration:1.1, ease:"power4.out", stagger:.1});
  gsap.to(".hero .split-up", {opacity:1, y:0, duration:.8, ease:"power3.out", stagger:.08, delay:.35});
  gsap.fromTo(".hero-media", {scale:1.08}, {scale:1, duration:1.8, ease:"power2.out"});
}
if (animate) {
  if (introDone) heroIn();
  document.querySelectorAll("main .split:not(h1)").forEach(h => gsap.to(h.querySelectorAll(".ln>span"),
    {y:0, duration:1, ease:"power4.out", stagger:.08, scrollTrigger:{trigger:h, start:"top 85%", once:true}}));
  gsap.utils.toArray(".fade").forEach(el => gsap.to(el, {opacity:1, y:0, duration:.8, ease:"power3.out",
    scrollTrigger:{trigger:el, start:"top 90%", once:true}}));
  gsap.utils.toArray(".wipe").forEach(el => {
    gsap.to(el, {clipPath:"inset(0% 0 0 0)", duration:1.1, ease:"power3.inOut", scrollTrigger:{trigger:el, start:"top 85%", once:true}});
    const img = el.querySelector("img"); if (img) gsap.fromTo(img, {scale:1.15}, {scale:1, duration:1.4, ease:"power3.out", scrollTrigger:{trigger:el, start:"top 85%", once:true}});
  });
  // HERO: reel inside the logo letters (stays in the letters)
  const hero = document.querySelector(".hero"), vis = hero.querySelector(".hero-vis");
  hero.classList.add("masked");
  gsap.timeline({scrollTrigger:{trigger:hero, start:"top top", end:"bottom top", scrub:true}})
     .to(".hero-tag, .hero-cta, .scroll-cue", {opacity:0, duration:.3}, 0)
     .fromTo(".hero-media", {scale:1.15}, {scale:1.3, ease:"none", duration:1}, 0);

  // CHAPTERS: photo drifts a little inside its frame, number moves slower than the page. Native scroll, nothing pinned.
  gsap.utils.toArray(".chap").forEach(c => {
    const num = c.querySelector(".chap-num");
    gsap.fromTo(c.querySelectorAll(".chap-img img"), {yPercent:-4, scale:1.08}, {yPercent:4, scale:1.08, ease:"none", scrollTrigger:{trigger:c, start:"top bottom", end:"bottom top", scrub:true}});
    gsap.fromTo(num, {yPercent:14}, {yPercent:-14, ease:"none", scrollTrigger:{trigger:c, start:"top bottom", end:"bottom top", scrub:true}});
    gsap.from(c.querySelector(".chap-photo"), {clipPath:"inset(0 0 100% 0)", duration:1.1, ease:"power3.out", scrollTrigger:{trigger:c, start:"top 70%", once:true}});
    gsap.from(c.querySelectorAll(".chap-link, .chap-sub, .ro"), {opacity:0, y:16, duration:.8, stagger:.08, ease:"power3.out", delay:.35, scrollTrigger:{trigger:c, start:"top 60%", once:true}});
  });

  // SECTION TRANSITIONS: clip-path opening as each section arrives
  gsap.utils.toArray(".section").forEach(s => gsap.fromTo(s, {clipPath:"inset(7% 4% 0% 4%)"},
    {clipPath:"inset(0% 0% 0% 0%)", ease:"none", scrollTrigger:{trigger:s, start:"top bottom", end:"top 30%", scrub:true}}));

  // COUNTERS on section labels
  document.querySelectorAll(".label").forEach(l => {
    const m = l.textContent.match(/^(\d{2})(.*)$/s); if (!m) return;
    const n = +m[1], rest = m[2], o = {v:0};
    l.textContent = "00" + rest;
    gsap.to(o, {v:n, duration:.9, ease:"power2.out", scrollTrigger:{trigger:l, start:"top 90%", once:true},
      onUpdate:() => l.textContent = String(Math.round(o.v)).padStart(2,"0") + rest});
  });
  addEventListener("load", () => ScrollTrigger.refresh());
} else {
  document.querySelectorAll(".tile.rv").forEach(t => t.classList.remove("rv"));
}

/* ---------- booking form ---------- */
const form = document.getElementById("inquiry"), status = document.getElementById("status");
const msgs = {name:"Add your name.", team:"Add your team, school, or organization.", sport:"Pick a sport.", need:"Pick what you need.",
  email:"Enter a valid email.", phone:"Enter a valid phone number.", source:"Let us know where you found us."};
const fields = [...form.querySelectorAll("input:not(.hp),select,textarea")];
const valid = el => el.tagName === "SELECT" ? (!el.required || el.value.trim() !== "") : el.checkValidity();
function check(el){
  const lab = el.closest("label"); let e = lab.querySelector(".err");
  const ok = valid(el); el.classList.toggle("invalid", !ok); el.setAttribute("aria-invalid", String(!ok));
  const id = `${el.name}-err`;
  if (!ok) { if (!e) { e = document.createElement("span"); e.className = "err"; e.id = id; lab.appendChild(e); el.setAttribute("aria-describedby", id); }
    e.textContent = msgs[el.name] || "Check this field."; }
  else if (e) { e.remove(); el.removeAttribute("aria-describedby"); }
  return ok;
}
fields.forEach(el => {
  el.addEventListener("blur", () => { if (el.value || el.classList.contains("invalid")) check(el); });
  el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => { if (el.classList.contains("invalid")) check(el); });
});
form.addEventListener("submit", async ev => {
  ev.preventDefault();
  const bad = fields.filter(el => !check(el));
  if (bad.length) { status.textContent = "Please fix the highlighted fields."; bad[0].focus(); return; }
  if (form._gotcha.value) return;
  const data = {};
  fields.forEach(el => { if (el.name && el.value) data[el.name] = el.value; });
  if (FORM_ENDPOINT) {
    status.textContent = "Sending…";
    try {
      const r = await fetch(FORM_ENDPOINT, {method:"POST", headers:{Accept:"application/json","Content-Type":"application/json"}, body:JSON.stringify(data)});
      if (!r.ok) throw 0;
      form.reset(); status.textContent = "Got it. You'll hear back fast.";
    } catch { status.textContent = `Couldn't send. Text (832) 469-0937 or email ${TO_EMAIL}.`; }
  } else {
    const body = Object.entries(data).map(([k,v]) => `${k.replace("_"," ")}: ${v}`).join("\n");
    const who = data.team || data.name;
    window.__lastMailto = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(`Booking request — ${who}`)}&body=${encodeURIComponent(body)}`;
    window.__lastData = data;
    status.textContent = "Opening your email app with the details filled in.";
    if (!window.__testMode) location.href = window.__lastMailto;
  }
});
onScroll();
