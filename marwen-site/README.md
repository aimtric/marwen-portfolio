# Marwen — site portfolio

Site statique. Sept pages, une feuille de style, un petit script. Aucune étape
de build, aucune dépendance, aucun framework — ouvrez `index.html` dans un
navigateur et ça fonctionne.

## Fichiers

```
index.html           Accueil : ouverture, liste des dossiers, à propos, contact
supra-cargo.html     Dossier III-01 (gabarit — à remplir avec votre contenu réel)
prat.html            Dossier III-02 : campagne PRAT / Armée de Terre (ESD)
cahier-de-recherche.html  Pièce I : la série, les codes relevés, vos notes de visionnage
identite.html        Pièce II : logo, couleurs, typographies, pictogrammes
brand-kit.html       Pièce III : règles d'usage, voix, applications, lien vers le portfolio
404.html             Page introuvable
assets/site.css      Toute la mise en forme. Les jetons de design sont en haut.
assets/site.js       Bascule de thème + copie des codes couleur
assets/favicon.svg   Icône d'onglet
robots.txt           Règles pour les moteurs de recherche
sitemap.xml          Liste des pages pour les moteurs de recherche
```

## Avant de publier — les six choses à remplacer

Cherchez ces éléments dans les fichiers et corrigez-les :

1. **`votre@adresse`** — votre courriel. Dans `index.html` (section contact).
   Remplacez le `<span class="val todo">` par :
   `<a class="val" href="mailto:vous@exemple.fr">vous@exemple.fr</a>`
2. **`/in/votre-profil`** — votre LinkedIn, même traitement avec l'URL complète.
3. **`https://example.com`** — votre vrai domaine. Présent dans le
   `<link rel="canonical">` et le `og:url` de chaque page, plus `robots.txt` et
   `sitemap.xml`. Sans ça, les aperçus de partage sont cassés.
4. **`supra-cargo.html`** — toute la page est un gabarit dont les consignes sont
   écrites à l'intérieur. Remplacez le problème, la démarche et surtout les
   chiffres de la section « Ce qui a changé ».
5. **Captures d'écran** — des blocs `<figure class="shot">` dans
   `supra-cargo.html` et `prat.html` contiennent des cadres vides. Dans
   `prat.html`, ajoutez aussi votre rôle exact et la taille de l'équipe.
   Remplacez chaque
   `<div class="frame">…</div>` par
   `<img src="assets/accueil.png" alt="Page d'accueil de Supra Cargo">`.

6. **`cahier-de-recherche.html`** — la section 01 (votre rapport à la série) et la
   section 06 (vos notes de visionnage) portent la mention « À compléter ».
   Ce sont les passages qui rendent le site personnel : écrivez-les vous-même.

## Mise en ligne

Les trois options sont gratuites et prennent environ cinq minutes.

### Netlify (le plus simple)

1. Allez sur app.netlify.com et créez un compte.
2. Glissez-déposez tout le dossier `marwen-site` sur la zone de déploiement.
3. C'est en ligne. Vous obtenez immédiatement une adresse
   `quelque-chose.netlify.app`.
4. Renommez-la dans Site settings → Domain management, ou faites pointer votre
   propre domaine dessus.

Pour mettre à jour plus tard, glissez-déposez le dossier à nouveau.

### Vercel

1. Allez sur vercel.com et créez un compte avec GitHub.
2. Poussez ce dossier dans un dépôt GitHub.
3. Importez le dépôt dans Vercel. Framework preset : **Other**. Aucune commande
   de build, répertoire de sortie `.`.
4. Chaque `git push` redéploie le site.

### GitHub Pages

1. Créez un dépôt nommé `marwen-portfolio` (ou autre).
2. Poussez ces fichiers sur la branche `main`.
3. Dépôt → Settings → Pages → Source : `main`, dossier `/ (root)`.
4. En ligne sur `votrenom.github.io/marwen-portfolio` au bout d'une minute ou
   deux.

À noter : sur GitHub Pages dans un sous-dossier, la page `404.html` utilise des
chemins absolus (`/assets/...`) et sa mise en forme sera cassée. Hébergez à la
racine du domaine, ou passez ces quatre chemins en relatif (`assets/...`) dans
`404.html`.

## Nom de domaine

Un `.fr` ou un `.com` coûte environ 10 à 15 € par an chez OVH, Gandi ou
Namecheap. Après l'achat, suivez la procédure « add custom domain » de votre
hébergeur — ce sont deux enregistrements DNS et il vous donne les valeurs
exactes. Mettez ensuite `example.com` à jour partout (point 3 ci-dessus).

## Ajouter un dossier

Copiez `supra-cargo.html`, renommez-le, changez le `<title>`, la méta
description, l'URL canonique et le contenu. Puis référencez-le à trois
endroits :

- `index.html` — un nouveau bloc `<a class="case">` dans la liste des dossiers
- la navigation du pied de page de chaque page
- `sitemap.xml`

## Notes sur le code

**Thème.** Le sombre est le thème par défaut. La bascule écrit `data-theme` sur
`<html>` et mémorise le choix dans `localStorage`. Un visiteur qui n'y touche
jamais obtient le réglage de son système.

**Couleurs.** Chaque couleur est un jeton dans le bloc `:root` en haut de
`site.css`, défini une fois pour le sombre et une fois pour le clair. Changez
une couleur là et elle change partout. N'écrivez pas de valeur hexadécimale
directement dans le HTML : une couleur qui n'existe que dans un thème produit
du texte illisible dans l'autre.

**Typographie.** Bricolage Grotesque pour les titres, Archivo Narrow pour les tampons,
Spectral pour le texte courant — chargées depuis Google Fonts. Chacune a une
vraie pile de repli, donc la page reste lisible si la requête échoue.

**Accessibilité.** Lien d'évitement, contours de focus visibles, `aria-current`
sur l'élément de navigation actif, SVG étiquetés, et `prefers-reduced-motion`
respecté. Conservez tout ça si vous restructurez quelque chose.
