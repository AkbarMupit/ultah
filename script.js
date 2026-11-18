const $ = id => document.getElementById(id);
const cv = $('fx'), ctx = cv.getContext('2d');
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
let petals = [], raf = 0, ac, nama = '';
const DPR = Math.min(devicePixelRatio || 1, 2);
function fit(){ cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; }
addEventListener('resize', fit); fit();

/* Kelopak sakura */
function spawn(n, fromTop){
  for (let i = 0; i < n; i++) petals.push({
    x: Math.random() * cv.width, y: fromTop ? -20 : Math.random() * cv.height * .6,
    vx: (Math.random() - .3) * 1.2 * DPR, vy: (Math.random() * 1.4 + .8) * DPR,
    s: (Math.random() * 6 + 7) * DPR, r: Math.random() * 6, vr: (Math.random() - .5) * .06,
    life: 900
  });
  if (!raf) loop();
}
function loop(){
  ctx.clearRect(0, 0, cv.width, cv.height);
  petals = petals.filter(p => p.life-- > 0 && p.y < cv.height + 30);
  for (const p of petals) {
    p.x += p.vx + Math.sin(p.r) * .6 * DPR; p.y += p.vy; p.r += p.vr * 3;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.fillStyle = '#ffb7c5'; ctx.beginPath();
    ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); ctx.fill(); ctx.restore();
  }
  raf = petals.length ? requestAnimationFrame(loop) : 0;
}

/* Suara gitar: Karplus-Strong */
let amp, drive = true;
function getAmp(){
  if (amp) return amp;
  const sh = ac.createWaveShaper(), c = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) c[i] = Math.tanh((i / 512 - 1) * 4);
  sh.curve = c;
  const pre = ac.createGain(), lp = ac.createBiquadFilter(), out = ac.createGain();
  pre.gain.value = 2.6; lp.type = 'lowpass'; lp.frequency.value = 3200; out.gain.value = .4;
  pre.connect(sh); sh.connect(lp); lp.connect(out); out.connect(ac.destination);
  amp = pre; return amp;
}
function pluck(f){
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const sr = ac.sampleRate, n = sr * 2, p = Math.max(2, Math.round(sr / f));
    const buf = ac.createBuffer(1, n, sr), d = buf.getChannelData(0);
    for (let i = 0; i < p; i++) d[i] = Math.random() * 2 - 1;
    for (let i = p; i < n; i++) d[i] = (d[i - p] + d[i - p + 1]) * .4995;
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; g.gain.value = .5; s.connect(g); g.connect(getAmp()); amp.gain.value = drive ? 2.6 : .7; s.start();
  } catch (e) {}
}

/* Enam senar bernada skala Miyako-bushi (A Bb D E F) */
const FREQ = [110, 146.83, 220, 293.66, 329.63, 466.16];
const lines = [];
function build(){
  const g = $('strings'); g.innerHTML = '';
  FREQ.forEach((f, i) => {
    const y = 72 + i * 17;
    const vis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vis.setAttribute('x1', 90); vis.setAttribute('x2', 590);
    vis.setAttribute('y1', y); vis.setAttribute('y2', y);
    vis.setAttribute('class', 'str'); vis.setAttribute('stroke-width', 1 + (5 - i) * .25 + .6);
    const hit = vis.cloneNode();
    hit.setAttribute('class', ''); hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', 17); hit.dataset.i = i;
    g.append(vis, hit); lines[i] = vis;
  });
}
function play(i){
  pluck(FREQ[i]);
  const l = lines[i]; l.classList.remove('vib'); void l.getBBox(); l.classList.add('vib');
  const lamps = document.querySelectorAll('.lamp');
  if (lamps.length) {
    const m = lamps[Math.floor(Math.random() * lamps.length)];
    m.classList.add('on'); setTimeout(() => m.classList.remove('on'), 350);
  }
  if (!calm) spawn(2, true);
}
let last = -1;
const gt = $('gt');
function sweep(e){
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el && el.dataset && el.dataset.i !== undefined) {
    const i = +el.dataset.i;
    if (i !== last) { last = i; play(i); }
  } else last = -1;
}
gt.addEventListener('pointerdown', e => { last = -1; sweep(e); });
gt.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') sweep(e); });
addEventListener('pointerup', () => last = -1);

$('drv').onclick = () => { drive = !drive; $('drv').textContent = 'Distorsi: ' + (drive ? 'nyala' : 'mati'); };
$('strum').onclick = () => FREQ.forEach((_, i) => setTimeout(() => play(i), i * 70));

/* Lagu ulang tahun */
$('lagu').onclick = () => {
  const N = {G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784};
  const m = [['G4',.5],['G4',.5],['A4',1],['G4',1],['C5',1],['B4',2],
    ['G4',.5],['G4',.5],['A4',1],['G4',1],['D5',1],['C5',2],
    ['G4',.5],['G4',.5],['G5',1],['E5',1],['C5',1],['B4',1],['A4',1],
    ['F5',.5],['F5',.5],['E5',1],['C5',1],['D5',1],['C5',2]];
  let t = 0;
  for (const [n, d] of m) { setTimeout(() => pluck(N[n]), t); t += d * 430; }
  spawn(40, true);
};

function balon(){
  const cols = ['#ff7eb6','#7ff2c8','#ffe27a','#b794ff','#d7263d'];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'balon';
    b.style.left = (Math.random() * 92) + 'vw';
    b.style.background = cols[i % cols.length];
    b.style.animationDuration = (5 + Math.random() * 4) + 's';
    b.style.animationDelay = (Math.random() * 1.5) + 's';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 11000);
  }
}
$('tiup').onclick = () => {
  const st = $('stage');
  if (st.classList.toggle('out')) {
    $('sapa').textContent = `Selamat ulang tahun, ${nama}-san! Semoga permohonanmu terkabul.`;
    $('tiup').textContent = 'Nyalakan lagi';
    balon(); spawn(60, true); $('lagu').click();
  } else {
    $('sapa').textContent = `${nama}-san, selamat ulang tahun!`;
    $('tiup').textContent = 'Tiup lilin';
  }
};

$('mulai').onclick = () => {
  nama = $('nama').value.trim() || 'Kamu';
  const umur = Math.max(1, Math.min(120, parseInt($('umur').value) || 1));
  $('sapa').textContent = `${nama}-san, selamat ulang tahun ke-${umur}!`;
  $('stage').classList.remove('out');
  $('lamps').innerHTML = '<div class="lamp"></div>'.repeat(Math.min(umur, 10));
  $('setup').hidden = true; $('stage').hidden = false;
  build(); spawn(calm ? 0 : 26, false);
};
