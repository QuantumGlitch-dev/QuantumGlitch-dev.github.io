/* QuantumGlitch Studio, home page: the mark, the laser cats, the wheel, the book. No libraries. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || location.hash === '#still';
root.classList.add('js');
if (calm) root.classList.add('calm');
const css = n => getComputedStyle(root).getPropertyValue(n).trim();
const rnd = (a, b) => a + Math.random() * (b - a);

/* theme: follows the system, and the button remembers your choice on this device */
$('#theme').addEventListener('click', () => {
  const now = root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  root.dataset.theme = now === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('qg-theme', root.dataset.theme); } catch (_) {}
});

/* mobile menu */
const nav = $('#nav'), menu = $('#menu');
menu.addEventListener('click', () => menu.setAttribute('aria-expanded', nav.classList.toggle('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });

/* header line and the mark sliding apart while you scroll */
const topbar = $('#topbar'), qmark = $('#qmark');
let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = window.scrollY || 0;
  topbar.classList.toggle('scrolled', y > 8);
  if (!calm) qmark.style.setProperty('--slip', Math.min(70, y / 7).toFixed(1));
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* the mark glitches now and then, and when you touch it */
const zap = () => { if (!root.classList.contains('seen')) return; qmark.classList.remove('zap'); void qmark.getBoundingClientRect(); qmark.classList.add('zap'); };
qmark.addEventListener('animationend', e => { if (e.animationName === 'zapA') qmark.classList.remove('zap'); });
if (!calm) {
  setTimeout(() => root.classList.add('seen'), 1900);
  if (matchMedia('(hover: hover)').matches) {
    const hero = $('#top'); let tilt = 0, queued = false;
    hero.addEventListener('pointermove', e => {
      tilt = e.clientX / innerWidth * 2 - 1;
      if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; qmark.style.setProperty('--tilt', tilt.toFixed(3)); }); }
    });
    hero.addEventListener('pointerleave', () => qmark.style.setProperty('--tilt', 0));
  }
  $('#heroMark').addEventListener('pointerenter', zap);
  (function loop() { setTimeout(() => { if (!document.hidden) zap(); loop(); }, rnd(4200, 8200)); })();
}

/* "We make games / apps / books" */
const words = $$('.sw'); let wi = 0;
if (!calm) setInterval(() => {
  if (document.hidden) return;
  words[wi].classList.remove('on'); wi = (wi + 1) % words.length; words[wi].classList.add('on');
}, 2500);

/* windows open along the slice when they come into view */
const rv = $$('.rv');
if ('IntersectionObserver' in window && !calm) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .06 });
  rv.forEach(el => io.observe(el));
} else rv.forEach(el => el.classList.add('in'));

/* run a loop only while its element is on screen */
function whileVisible(el, start, stop) {
  let on = false;
  const set = v => { if (v !== on) { on = v; v ? start() : stop(); } };
  let seen = false;
  new IntersectionObserver(es => { seen = es[0].isIntersecting; set(seen && !document.hidden); }, { rootMargin: '120px' }).observe(el);
  document.addEventListener('visibilitychange', () => set(seen && !document.hidden));
}

/* ---------- Herding Cats: you are the laser ---------- */
(function cats() {
  const scene = $('#hcScene'), cv = $('#hcCanvas'), ctx = cv.getContext('2d');
  const AW = 3840, AH = 1240;                       // the room art, in its own pixels
  const ROW = { idle: 0, walk: 1, run: 2, pounce: 3, rest: 4 };
  const FPS = { idle: 5, walk: 7, run: 10, pounce: 8, rest: 3 };
  const HOLD = { idle: [10, 1, 1, 1, 2, 1, 1, 1], pounce: [3, 1, 1, 1, 1, 1, 1, 1], rest: [3, 1, 1, 1, 3, 1, 1, 1] };
  const LEN = n => (HOLD[n] ? HOLD[n].reduce((a, b) => a + b, 0) : 8) / FPS[n];
  const cast = [
    { id: 'mochi',  cw: 245, ch: 220, px: 122.5, py: 216,   k: 1,   speed: .62, lazy: .8,  nap: 4,  u: .41, v: .86, ang: 2.6 },
    { id: 'pickle', cw: 256, ch: 226, px: 128,   py: 222,   k: .98, speed: .8,  lazy: .5,  nap: 7,  u: .63, v: .58, ang: -.5 },
    { id: 'bean',   cw: 256, ch: 224, px: 128,   py: 220.2, k: .92, speed: 1.05, lazy: .12, nap: 11, u: .5,  v: .68, ang: 1.1 },
    { id: 'kitten', cw: 243, ch: 220, px: 121.5, py: 216,   k: .62, speed: 1.3, lazy: .04, nap: 15, u: .57, v: .9,  ang: 4.2 }
  ].map(c => Object.assign(c, { x: c.u * AW, y: c.v * AH, state: 'idle', t: rnd(0, 2), face: 1, wait: rnd(.2, 1.2), cool: 0, wake: 0, near: false, plx: 0, ply: 0, img: null }));
  const laserCol = css('--hc-laser'), glowCol = css('--hc-glow'), shade = css('--hc-shade');
  let W = 0, H = 0, S = 1, OX = 0, OY = 0, DPR = 1, U0 = 0, U1 = 1;
  let ready = false, raf = 0, last = 0, pounces = 0;
  const laser = { x: AW * .56, y: AH * .78, px: AW * .56, py: AH * .78, idle: 0, hand: 0, tx: AW * .56, ty: AH * .78, hold: 1 };

  // the walkable floor: a trapezoid between the kitchen and the bed, down across the rug
  const floor = (x, y) => {
    const v = Math.min(.955, Math.max(.44, y / AH)), t = (v - .44) / .515;
    const a = Math.max(U0 + .03, .425 - .085 * t), b = Math.min(U1 - .03, .64 + .085 * t);
    return [Math.min(b, Math.max(a, x / AW)) * AW, v * AH];
  };
  function fit() {
    const r = scene.getBoundingClientRect();
    W = r.width; H = r.height; DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    S = Math.max(W / AW, H / AH);
    const posx = (parseFloat(getComputedStyle(scene).getPropertyValue('--posx')) || 50) / 100;
    OX = (W - AW * S) * posx; OY = (H - AH * S) * .5;
    U0 = -OX / (AW * S); U1 = (W - OX) / (AW * S);
    if (ready) draw();
  }
  const frame = (name, t, loop) => {
    const h = HOLD[name], fps = FPS[name];
    if (!h) { const f = Math.floor(t * fps); return loop ? f % 8 : Math.min(7, f); }
    const len = LEN(name); let tt = loop ? t % len : Math.min(t, len - .001), acc = 0;
    for (let i = 0; i < 8; i++) { acc += h[i] / fps; if (tt < acc) return i; }
    return 7;
  };
  const go = (c, s) => { c.state = s; c.t = 0; };

  const leap = (c, lx, ly) => {
    go(c, 'pounce'); c.sx = c.x; c.sy = c.y;
    const [tx, ty] = floor(lx + Math.cos(c.ang) * 181, ly + Math.sin(c.ang) * 82);
    c.jx = tx - c.x; c.jy = ty - c.y; c.face = lx >= c.x ? 1 : -1; c.plx = lx; c.ply = ly;
  };
  function step(c, dt) {
    c.t += dt; c.cool -= dt;
    const [lx, ly] = floor(laser.x, laser.y);
    if (c.near && Math.hypot(lx - c.plx, ly - c.ply) > 240) c.near = false;   // the dot got away
    const f = c.near ? .55 : 1;
    const [gx, gy] = floor(lx + Math.cos(c.ang) * 330 * f, ly + Math.sin(c.ang) * 150 * f);
    const dx = gx - c.x, dy = gy - c.y, d = Math.hypot(dx, dy) || 1;
    const dot = Math.hypot(lx - c.x, ly - c.y), dozy = laser.idle > c.nap;
    const canLeap = !c.near && c.cool <= 0 && dot > 150 && dot < 580;
    if (c.state === 'rest') {
      if (!dozy && (c.wake -= dt) <= 0) { go(c, 'idle'); c.wait = .2 + c.lazy; }
    } else if (c.state === 'idle') {
      c.face = lx >= c.x ? 1 : -1;
      if (dozy && c.t > 1) { go(c, 'rest'); c.wake = .3 + c.lazy * 1.8; }
      else if ((c.wait -= dt) <= 0) {
        if (canLeap && laser.idle > .3) leap(c, lx, ly);
        else if (d > 150) go(c, d > 430 || c.lazy < .3 ? 'run' : 'walk');
      }
    } else if (c.state === 'pounce') {
      const p = Math.min(1, Math.max(0, (c.t - .62) / .34));           // the leap is frames 4 to 6
      const e = p * p * (3 - 2 * p);
      c.x = c.sx + c.jx * e; c.y = c.sy + c.jy * e;
      if (c.t >= LEN('pounce')) {
        go(c, 'idle'); c.near = true; c.wait = rnd(.5, 1.3) + c.lazy; c.cool = rnd(1.6, 3);
        pounces++; $('#hcCount').textContent = pounces; pop(c);
      }
    } else {
      const run = c.state === 'run', sp = (run ? 660 : 215) * c.speed, m = Math.min(d, sp * dt);
      if (Math.abs(dx) > 6) c.face = dx > 0 ? 1 : -1;
      c.x += dx / d * m; c.y += dy / d * m * .8;
      if (d < 14) { go(c, 'idle'); c.wait = rnd(.35, 1) + c.lazy * .6; }
      else if (run && canLeap && laser.idle > .1) leap(c, lx, ly);
      else if (!run && d > 540) go(c, 'run');
    }
  }
  function pop(c) {
    const el = document.createElement('span');
    el.className = 'pop'; el.textContent = '+1'; el.setAttribute('aria-hidden', 'true');
    el.style.left = (c.x * S + OX) + 'px'; el.style.top = (c.y * S + OY - c.ch * 1.5 * S * c.k * .8) + 'px';
    el.addEventListener('animationend', () => el.remove());
    scene.appendChild(el);
  }
  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const c of [...cast].sort((a, b) => a.y - b.y)) {
      if (!c.img) continue;
      const depth = .8 + .34 * ((c.y / AH - .44) / .515);
      const sc = 1.5 * S * c.k * depth, dw = c.cw * sc, dh = c.ch * sc;
      const sx = c.x * S + OX, sy = c.y * S + OY;
      ctx.fillStyle = shade;
      ctx.beginPath(); ctx.ellipse(sx, sy - 3 * sc, dw * .3, dh * .075, 0, 0, 6.3); ctx.fill();
      const f = c.fix != null ? c.fix : frame(c.state, c.t, c.state !== 'pounce');
      ctx.save(); ctx.translate(sx, sy); ctx.scale(c.face, 1);
      ctx.drawImage(c.img, f * c.cw, ROW[c.state] * c.ch, c.cw, c.ch, -c.px * sc, -c.py * sc, dw, dh);
      ctx.restore();
    }
    const lx = laser.x * S + OX, ly = laser.y * S + OY, r = Math.max(15, 23 * Math.min(1.4, S / .3));
    const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
    g.addColorStop(0, glowCol); g.addColorStop(.3, laserCol); g.addColorStop(.36, 'rgba(250,83,78,.42)'); g.addColorStop(1, 'rgba(250,83,78,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, r, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx, ly, r * .09, 0, 6.3); ctx.fill();
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    laser.hand -= dt;
    if (laser.hand <= 0) {                                  // nobody is holding the laser: it darts and rests by itself
      if ((laser.hold -= dt) <= 0) {
        [laser.tx, laser.ty] = floor(rnd(U0, U1) * AW, rnd(.46, .95) * AH);
        laser.hold = Math.random() < .2 ? rnd(8, 12) : rnd(1.6, 3.4);
      }
      const k = 1 - Math.pow(.0009, dt);
      laser.x += (laser.tx - laser.x) * k; laser.y += (laser.ty - laser.y) * k;
    }
    const moved = Math.hypot(laser.x - laser.px, laser.y - laser.py);
    laser.idle = moved > 2.5 ? 0 : laser.idle + dt; laser.px = laser.x; laser.py = laser.y;
    cast.forEach(c => step(c, dt));
    for (let i = 0; i < cast.length; i++) for (let j = i + 1; j < cast.length; j++) {   // keep them from standing on each other
      const a = cast[i], b = cast[j], dx = b.x - a.x, dy = (b.y - a.y) * 1.8, d = Math.hypot(dx, dy);
      if (d < 200 && a.state !== 'pounce' && b.state !== 'pounce') { const p = (200 - d) * 1.6 * dt, s = dx >= 0 ? 1 : -1; a.x -= s * p; b.x += s * p; }
    }
    draw();
  }
  const aim = e => {
    const r = scene.getBoundingClientRect();
    laser.x = (e.clientX - r.left - OX) / S; laser.y = (e.clientY - r.top - OY) / S; laser.hand = 2.2;
  };
  if (matchMedia('(hover: none)').matches) $('#hcHint').textContent = "Tap the floor. They can't help it.";
  scene.addEventListener('pointermove', aim);
  scene.addEventListener('pointerdown', aim);
  scene.addEventListener('pointerleave', () => { laser.hand = Math.min(laser.hand, .6); });
  addEventListener('resize', fit);

  let asked = false;
  function load() {
    if (asked) return; asked = true;
    let n = 0;
    cast.forEach(c => { const im = new Image(); im.onload = () => { c.img = im; if (++n === cast.length) begin(); }; im.src = 'assets/home/img/cat-' + c.id + '.webp'; });
  }
  function begin() {
    ready = true; fit();
    if (calm) {                                             // one frozen moment instead of a chase
      const pose = { mochi: ['rest', 2, 1], pickle: ['idle', 0, -1], bean: ['pounce', 5, 1], kitten: ['run', 2, 1] };
      const at = { mochi: [.415, .87], pickle: [.635, .6], bean: [.5, .73], kitten: [.455, .93] };
      cast.forEach(c => { [c.state, c.fix, c.face] = pose[c.id]; c.x = at[c.id][0] * AW; c.y = at[c.id][1] * AH; });
      laser.x = .565 * AW; laser.y = .78 * AH;
      draw(); return;
    }
    whileVisible(scene, () => { last = performance.now(); raf = requestAnimationFrame(tick); }, () => cancelAnimationFrame(raf));
  }
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); load(); } }, { rootMargin: '700px' }).observe(scene);
  else load();
})();

/* ---------- RandomizeIt: a fair wheel ---------- */
(function wheel() {
  const NS = 'http://www.w3.org/2000/svg';
  const opts = ['Herd cats', 'Read a page', 'Flip a coin', 'Roll a d20', 'Take a nap', 'Draw a card'];
  const n = opts.length, seg = 360 / n, R = 100, rad = a => a * Math.PI / 180;
  const g = $('#wheelRot'), box = $('#wheelBox'), k = $('#wheelK'), v = $('#wheelV');
  const mk = (tag, at) => { const el = document.createElementNS(NS, tag); for (const a in at) el.setAttribute(a, at[a]); return g.appendChild(el); };
  opts.forEach((label, i) => {
    const a0 = rad(i * seg - seg / 2), a1 = rad(i * seg + seg / 2);
    mk('path', { class: 'ws' + (i % 3), d: `M0 0L${R * Math.cos(a0)} ${R * Math.sin(a0)}A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)}Z` });
    mk('text', { class: 'wt', x: 65, y: 0, transform: `rotate(${i * seg})` }).textContent = label;
  });
  mk('circle', { class: 'w-rim', r: R });
  opts.forEach((_, i) => { const a = rad(i * seg - seg / 2); mk('circle', { class: 'w-pin', r: 2.4, cx: R * Math.cos(a), cy: R * Math.sin(a) }); });
  // drawn first, shown second: an unbiased pick, then the wheel only shows it
  const fair = m => { const lim = Math.floor(4294967296 / m) * m, b = new Uint32Array(1); do crypto.getRandomValues(b); while (b[0] >= lim); return b[0] % m; };
  let turns = 0, busy = false, pick = 0;
  const done = () => { if (!busy) return; busy = false; box.classList.remove('spinning'); k.textContent = 'The wheel chose'; v.textContent = opts[pick]; };
  $('#wheelBtn').addEventListener('click', () => {
    if (busy) return;
    busy = true; pick = fair(n); turns += 5;
    k.textContent = 'Spinning'; v.textContent = '…';
    box.classList.add('spinning');
    g.style.transform = `rotate(${turns * 360 + (360 - pick * seg) % 360}deg)`;
    setTimeout(done, calm ? 60 : 4600);
  });
  g.addEventListener('transitionend', done);
})();

/* ---------- Grains of Salt: the book, the salt, the languages ---------- */
(function book() {
  const bk = $('#book');
  if (!calm) {
    bk.addEventListener('pointermove', e => {
      const r = bk.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      bk.style.setProperty('--ry', (24 - x * 34).toFixed(1) + 'deg'); bk.style.setProperty('--rx', (3 - y * 12).toFixed(1) + 'deg');
    });
    bk.addEventListener('pointerleave', () => { bk.style.removeProperty('--ry'); bk.style.removeProperty('--rx'); });
    const lw = $$('.lw'); let li = 0;
    setInterval(() => { if (document.hidden) return; lw[li].classList.remove('on'); li = (li + 1) % lw.length; lw[li].classList.add('on'); }, 2300);
  }
  const card = $('#bk'), cv = $('#salt'), ctx = cv.getContext('2d'), snow = css('--bk-snow');
  let W = 0, H = 0, P = [], raf = 0, last = 0;
  const grain = top => ({ x: rnd(0, W), y: top ? -6 : rnd(0, H), r: rnd(.5, 2.1), vy: rnd(9, 34), ph: rnd(0, 6.3), a: rnd(.22, .85) });
  function fit() {
    const r = card.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
    P = Array.from({ length: Math.round(Math.min(130, W * H / 7000)) }, () => grain(false));
    paint(0);
  }
  function paint(dt) {
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = snow;
    for (const p of P) {
      p.y += p.vy * dt * (.5 + p.r * .45); p.ph += dt * .8; p.x += Math.sin(p.ph) * 7 * dt;
      if (p.y > H + 6) Object.assign(p, grain(true));
      ctx.globalAlpha = p.a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const tick = now => { raf = requestAnimationFrame(tick); const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; paint(dt); };
  fit(); addEventListener('resize', fit);
  if (!calm && 'IntersectionObserver' in window) whileVisible(card, () => { last = performance.now(); raf = requestAnimationFrame(tick); }, () => cancelAnimationFrame(raf));
})();

/* copy the address */
$('#copyMail').addEventListener('click', async e => {
  const b = e.currentTarget, mail = $('#mail');
  try { await navigator.clipboard.writeText(mail.textContent); b.textContent = 'Copied'; }
  catch (_) { const s = getSelection(), r = document.createRange(); r.selectNodeContents(mail); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected'; }
  setTimeout(() => { b.textContent = 'Copy'; }, 1800);
});
})();
