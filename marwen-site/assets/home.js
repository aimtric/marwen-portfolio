/* Marwen — comportements de la page d'accueil.
   1. Générique : parallaxe des plans et voiture qui avance avec le défilement.
   2. Compteur : la petite voiture de la barre du bas suit la lecture.
   3. Dossiers : la voiture se glisse le long de la route pour changer de dossier.
   4. Pluie : canvas léger, désactivable, et son de pluie synthétisé à la demande.
   5. Copie des coordonnées, coupes de montage à l'apparition.
   Tout s'arrête sans bruit si un élément manque. */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function borne(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lire(cle) { try { return localStorage.getItem(cle); } catch (e) { return null; } }
  function ecrire(cle, v) { try { localStorage.setItem(cle, v); } catch (e) {} }

  /* ------------------------------------------------ 1. générique */
  var hero = document.getElementById('route');
  var scene = document.getElementById('h-scene');
  var voiture = document.getElementById('hero-car');
  var rayonsAv = document.getElementById('spk-f');
  var rayonsAr = document.getElementById('spk-r');
  var plans = [
    ['l-far', 150], ['l-mid', 80], ['l-poles', 30], ['l-lamp', 30], ['l-nearL', 10], ['l-nearR', 10]
  ].map(function (p) { return [document.getElementById(p[0]), p[1]]; });

  // largeur visible de la scène (le viewBox est rogné en « slice »)
  function bornesVisibles() {
    if (!scene) return [0, 1600];
    var w = scene.clientWidth, h = scene.clientHeight;
    var echelle = Math.max(w / 1600, h / 900);
    var visible = w / echelle;
    var x0 = 800 - visible / 2;
    return [x0, x0 + visible];
  }

  function majHero() {
    if (!hero || !voiture) return;
    var r = hero.getBoundingClientRect();
    var p = borne(-r.top / (r.height * 0.85), 0, 1);
    if (!reduit) {
      plans.forEach(function (pl) {
        if (pl[0]) pl[0].style.transform = 'translate(0px,' + (p * pl[1]).toFixed(1) + 'px)';
      });
    }
    var b = bornesVisibles();
    var depart = b[0] + 30, arrivee = b[1] - 260;
    if (arrivee < depart) arrivee = depart;
    var x = depart + p * (arrivee - depart);
    voiture.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 776) scale(0.62)');
    var angle = (x * 2.2) % 360;
    if (rayonsAv) rayonsAv.setAttribute('transform', 'rotate(' + angle.toFixed(1) + ' 87 80)');
    if (rayonsAr) rayonsAr.setAttribute('transform', 'rotate(' + angle.toFixed(1) + ' 315 80)');
  }

  /* ------------------------------------------------ 2. compteur */
  var odoRoute = document.getElementById('odo-road');
  var odoCar = document.getElementById('odo-car');
  var odoEp = document.getElementById('odo-ep');
  var reperes = [];

  function poserReperes() {
    if (!odoRoute) return;
    reperes.forEach(function (r) { r.el.remove(); });
    reperes = [];
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    document.querySelectorAll('[data-ep]').forEach(function (sec) {
      var haut = sec.getBoundingClientRect().top + window.scrollY;
      var f = borne(haut / total, 0, 1);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'odo-mk';
      b.textContent = sec.getAttribute('data-ep');
      b.setAttribute('aria-label', 'Aller à : ' + sec.getAttribute('data-ep'));
      var cw = odoCar ? odoCar.clientWidth : 0;
      b.style.left = (f * (odoRoute.clientWidth - cw) + cw / 2).toFixed(1) + 'px';
      b.addEventListener('click', function () {
        sec.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
      });
      odoRoute.appendChild(b);
      reperes.push({ el: b, f: f });
    });
  }

  function majOdo() {
    if (!odoRoute || !odoCar) return;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var p = total > 0 ? borne(window.scrollY / total, 0, 1) : 0;
    var largeur = odoRoute.clientWidth - odoCar.clientWidth;
    odoCar.style.transform = 'translateX(' + (p * largeur).toFixed(1) + 'px)';
    if (odoEp) odoEp.textContent = 'Ép. ' + String(Math.max(1, Math.round(p * 327))).padStart(3, '0') + '/327';
    var actif = null;
    reperes.forEach(function (r) { if (p + 0.002 >= r.f) actif = r; });
    reperes.forEach(function (r) { r.el.classList.toggle('on', r === actif); });
  }

  /* boucle de défilement */
  var enAttente = false;
  function auDefilement() {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(function () { enAttente = false; majHero(); majOdo(); });
  }
  window.addEventListener('scroll', auDefilement, { passive: true });
  window.addEventListener('resize', function () { poserReperes(); auDefilement(); placerReel(reelPos, false); });
  window.addEventListener('load', function () { poserReperes(); auDefilement(); });

  /* ------------------------------------------------ 3. dossiers */
  var track = document.getElementById('reel-track');
  var routeReel = document.getElementById('reel-road');
  var carReel = document.getElementById('reel-car');
  var compte = document.getElementById('reel-count');
  var fiches = track ? Array.prototype.slice.call(track.querySelectorAll('.file')) : [];
  var noms = ['III-01, Supra Cargo', 'III-02, PRAT — Armée de Terre', 'III-03, non attribué'];
  var n = fiches.length;
  var reelPos = 0; // de 0 à n-1, continu pendant le glissé

  function placerReel(pos, anime) {
    if (!track || !routeReel || !carReel || n === 0) return;
    reelPos = borne(pos, 0, n - 1);
    var pas = fiches.length > 1 ? fiches[1].offsetLeft - fiches[0].offsetLeft : 0;
    var dt = anime && !reduit ? '420ms cubic-bezier(.2,.7,.2,1)' : '0ms';
    track.style.transition = 'transform ' + dt;
    carReel.style.transition = 'transform ' + dt;
    track.style.transform = 'translateX(' + (-reelPos * pas).toFixed(1) + 'px)';
    var f = n > 1 ? reelPos / (n - 1) : 0;
    carReel.style.transform = 'translateX(' + (f * routeReel.clientWidth).toFixed(1) + 'px)';
    var i = Math.round(reelPos);
    fiches.forEach(function (el, k) {
      el.classList.toggle('is-on', k === i);
      el.toggleAttribute('inert', k !== i);
    });
    routeReel.setAttribute('aria-valuenow', String(i + 1));
    routeReel.setAttribute('aria-valuetext', noms[i] || String(i + 1));
    if (compte) compte.textContent = (i + 1) + ' / ' + n;
  }

  if (track && routeReel) {
    var glisse = false;
    function posDepuis(ev) {
      var r = routeReel.getBoundingClientRect();
      return borne((ev.clientX - r.left) / r.width, 0, 1) * (n - 1);
    }
    routeReel.addEventListener('pointerdown', function (ev) {
      glisse = true;
      routeReel.setPointerCapture(ev.pointerId);
      placerReel(posDepuis(ev), false);
    });
    routeReel.addEventListener('pointermove', function (ev) {
      if (glisse) placerReel(posDepuis(ev), false);
    });
    function lacher() {
      if (!glisse) return;
      glisse = false;
      placerReel(Math.round(reelPos), true);
    }
    routeReel.addEventListener('pointerup', lacher);
    routeReel.addEventListener('pointercancel', lacher);
    routeReel.addEventListener('keydown', function (ev) {
      var i = Math.round(reelPos);
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { placerReel(i + 1, true); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { placerReel(i - 1, true); ev.preventDefault(); }
      else if (ev.key === 'Home') { placerReel(0, true); ev.preventDefault(); }
      else if (ev.key === 'End') { placerReel(n - 1, true); ev.preventDefault(); }
    });
    var prec = document.getElementById('reel-prev');
    var suiv = document.getElementById('reel-next');
    if (prec) prec.addEventListener('click', function () { placerReel(Math.round(reelPos) - 1, true); });
    if (suiv) suiv.addEventListener('click', function () { placerReel(Math.round(reelPos) + 1, true); });
    placerReel(0, false);
  }

  /* ------------------------------------------------ 4. pluie */
  var toile = document.getElementById('rain');
  var btnPluie = document.getElementById('rain-btn');
  var gouttes = [], ctx2d = null, couleur = 'rgba(200,210,205,0.2)', tourne = false, image = 0;

  function lireCouleur() {
    var c = getComputedStyle(root).getPropertyValue('--rain').trim();
    if (c) couleur = c;
  }
  function dimensionner() {
    if (!toile) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    toile.width = window.innerWidth * dpr;
    toile.height = window.innerHeight * dpr;
    ctx2d = toile.getContext('2d');
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    var nb = Math.round(window.innerWidth / 9);
    gouttes = [];
    for (var i = 0; i < nb; i++) {
      gouttes.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, l: 10 + Math.random() * 16, v: 9 + Math.random() * 9 });
    }
  }
  function dessiner() {
    if (!tourne || !ctx2d) return;
    if (image++ % 90 === 0) lireCouleur();
    ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    for (var i = 0; i < gouttes.length; i++) {
      var g = gouttes[i];
      ctx2d.moveTo(g.x, g.y);
      ctx2d.lineTo(g.x - g.l * 0.18, g.y + g.l);
      g.y += g.v; g.x -= g.v * 0.18;
      if (g.y > window.innerHeight) { g.y = -20; g.x = Math.random() * (window.innerWidth + 60); }
    }
    ctx2d.stroke();
    requestAnimationFrame(dessiner);
  }
  function pluie(active) {
    if (!toile) return;
    toile.hidden = !active;
    if (btnPluie) {
      btnPluie.setAttribute('aria-pressed', active ? 'true' : 'false');
      btnPluie.textContent = active ? 'Pluie : visible' : 'Pluie : masquée';
    }
    ecrire('mw-pluie', active ? '1' : '0');
    if (active && !tourne) { tourne = true; dimensionner(); lireCouleur(); requestAnimationFrame(dessiner); }
    if (!active) tourne = false;
  }
  if (toile) {
    var pref = lire('mw-pluie');
    var depart = pref === null ? !reduit : pref === '1';
    pluie(depart);
    window.addEventListener('resize', function () { if (tourne) dimensionner(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) tourne = false;
      else if (!toile.hidden && !tourne) { tourne = true; requestAnimationFrame(dessiner); }
    });
    if (btnPluie) btnPluie.addEventListener('click', function () { pluie(toile.hidden); });
  }

  /* son de pluie : bruit filtré, rien ne joue avant le clic */
  var btnSon = document.getElementById('sound-btn');
  var audio = null, actifSon = false;
  function creerSon() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ac = new AC();
    var duree = 3, buf = ac.createBuffer(1, ac.sampleRate * duree, ac.sampleRate);
    var d = buf.getChannelData(0), brun = 0;
    for (var i = 0; i < d.length; i++) {
      var blanc = Math.random() * 2 - 1;
      brun = (brun + 0.02 * blanc) / 1.02;
      d[i] = blanc * 0.55 + brun * 2.4;
    }
    var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    var passeHaut = ac.createBiquadFilter(); passeHaut.type = 'highpass'; passeHaut.frequency.value = 300;
    var passeBas = ac.createBiquadFilter(); passeBas.type = 'lowpass'; passeBas.frequency.value = 5200;
    var gain = ac.createGain(); gain.gain.value = 0.0;
    src.connect(passeHaut); passeHaut.connect(passeBas); passeBas.connect(gain); gain.connect(ac.destination);
    src.start();
    return { ac: ac, gain: gain };
  }
  if (btnSon) {
    btnSon.addEventListener('click', function () {
      if (!audio) audio = creerSon();
      if (!audio) { btnSon.textContent = 'Son indisponible'; return; }
      actifSon = !actifSon;
      var t = audio.ac.currentTime;
      if (actifSon) {
        audio.ac.resume();
        audio.gain.gain.cancelScheduledValues(t);
        audio.gain.gain.setTargetAtTime(0.16, t, 0.6);
      } else {
        audio.gain.gain.cancelScheduledValues(t);
        audio.gain.gain.setTargetAtTime(0, t, 0.3);
      }
      btnSon.setAttribute('aria-pressed', actifSon ? 'true' : 'false');
      btnSon.textContent = actifSon ? 'Son de pluie : actif' : 'Son de pluie : coupé';
    });
  }

  /* ------------------------------------------------ 5. copie et coupes */
  var msg = document.getElementById('copy-msg');
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cible = document.getElementById(b.getAttribute('data-copy'));
      if (!cible) return;
      var texte = cible.textContent.trim();
      function choisir() {
        var r = document.createRange(); r.selectNodeContents(cible);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        if (msg) msg.textContent = 'Texte sélectionné — copiez-le avec votre clavier';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(function () {
          if (msg) msg.textContent = texte + ' copié';
        }, choisir);
      } else { choisir(); }
    });
  });

  if ('IntersectionObserver' in window && !reduit) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
      el.style.animationDelay = (i % 4) * 90 + 'ms';
      obs.observe(el);
    });
  }

  poserReperes();
  majHero();
  majOdo();
})();
