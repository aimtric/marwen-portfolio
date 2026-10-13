/* Marwen — comportements du site.
   Deux rôles : la lampe (bascule de thème, mémorisée) et les échantillons de
   peinture (copie du code hexadécimal). Aucune dépendance. Le script tourne sur
   toutes les pages ; chaque bloc s'arrête sans bruit si ses éléments sont
   absents de la page courante. */

(function () {
  'use strict';

  var root = document.documentElement;
  var CLE = 'mw-theme';

  /* ---------- la lampe ---------- */

  function themeActuel() {
    var explicite = root.getAttribute('data-theme');
    if (explicite === 'light' || explicite === 'dark') return explicite;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function etiqueterLampe() {
    var bouton = document.getElementById('lamp-btn');
    if (!bouton) return;
    var sombre = themeActuel() === 'dark';
    bouton.textContent = sombre ? 'Aube' : 'Crépuscule';
    bouton.setAttribute('aria-label', sombre ? 'Passer au thème clair' : 'Passer au thème sombre');
  }

  try {
    var memorise = localStorage.getItem(CLE);
    if (memorise === 'light' || memorise === 'dark') root.setAttribute('data-theme', memorise);
  } catch (e) { /* navigation privée, stockage bloqué — la page s'affiche quand même */ }

  var lampe = document.getElementById('lamp-btn');
  if (lampe) {
    lampe.addEventListener('click', function () {
      var suivant = themeActuel() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', suivant);
      try { localStorage.setItem(CLE, suivant); } catch (e) {}
      etiqueterLampe();
    });
  }
  etiqueterLampe();

  /* ---------- échantillons de peinture ---------- */

  var echantillons = document.getElementById('chips');
  if (echantillons) {
    var note = document.getElementById('copy-note');
    var repos = note ? note.textContent : '';
    var minuteur;

    function annoncer(message) {
      if (!note) return;
      note.textContent = message;
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { note.textContent = repos; }, 2200);
    }

    echantillons.addEventListener('click', function (evenement) {
      var bouton = evenement.target.closest('.chip');
      if (!bouton) return;
      var hexa = bouton.getAttribute('data-hex');
      if (!hexa) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hexa).then(
          function () { annoncer(hexa + ' copié'); },
          function () { annoncer(hexa + ' — sélectionnez pour copier'); }
        );
      } else {
        annoncer(hexa + ' — sélectionnez pour copier');
      }
    });
  }
})();
