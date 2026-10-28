// Tous les outils du fichier JSON (remplis par le fetch)
let outils = [];

// Les choix de l'utilisateur
let categorieActive = 'Tous';
let recherche = '';
let gratuitsUniquement = false;
let outilSelectionne = null;

const compteur = document.querySelector('.sidebar__count');
const champRecherche = document.querySelector('.search__input');
const zoneFiltres = document.querySelector('.filters');
const boutonGratuit = document.querySelector('.toggle');
const messageVide = document.querySelector('.tool-list__empty');
const liste = document.querySelector('.tool-list');

const detailTitre = document.querySelector('.detail__title');
const detailLink = document.querySelector('.detail__open');
const detailDescription = document.querySelector('.detail__description');
const badgeCategorie = document.querySelector('.badge--category');
const badgePrix = document.querySelector('.badge--price');
const infoCategorie = document.querySelector('.detail__info-value--category');
const infoPrix = document.querySelector('.detail__info-value--price');
const infoRef = document.querySelector('.detail__info-value--ref');
const zoneSimilaires = document.querySelector('.related__grid');

function afficherFiltres() {
    // On récupère chaque catégorie une seule fois
    const categories = [];
    for (let i = 0; i < outils.length; i++) {
        const categorie = outils[i].categorie;
        if (!categories.includes(categorie)) {
            categories.push(categorie);
        }
    }

    // On crée un bouton par catégorie (le bouton "Tous" est déjà dans le HTML)
    for (let i = 0; i < categories.length; i++) {
        zoneFiltres.innerHTML += `<button class="filters__chip" type="button" aria-pressed="false" data-categorie="${categories[i]}">${categories[i]}</button>`;
    }

    // On ajoute un clic sur chaque bouton
    const boutons = document.querySelectorAll('.filters__chip');
    for (let i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener('click', function () {
            categorieActive = boutons[i].dataset.categorie;

            // On enlève la classe active partout, puis on la met sur le bouton cliqué
            for (let j = 0; j < boutons.length; j++) {
                boutons[j].classList.remove('filters__chip--active');
                boutons[j].setAttribute('aria-pressed', 'false');
            }
            boutons[i].classList.add('filters__chip--active');
            boutons[i].setAttribute('aria-pressed', 'true');

            afficherListe();
        });
    }
}

function filtrerOutils() {
    const resultat = [];
    const texte = recherche.toLowerCase();

    outils.forEach(function (outil) {
        // Recherche dans le nom et la description, filtre sur la catégorie et sur le tarif
        if (
            (outil.nom.toLowerCase().includes(texte) || outil.description.toLowerCase().includes(texte)) &&
            (categorieActive === 'Tous' || outil.categorie === categorieActive) &&
            (!gratuitsUniquement || outil.gratuit)
        ) {
            resultat.push(outil);
        }
    });

    return resultat;
}

function afficherListe() {
    const outilsFiltres = filtrerOutils();

    // Compteur
    if (outilsFiltres.length > 1) {
        compteur.textContent = outilsFiltres.length + ' outils';
    } else {
        compteur.textContent = outilsFiltres.length + ' outil';
    }

    // Message "aucun outil"
    messageVide.hidden = outilsFiltres.length > 0;

    liste.innerHTML = '';

    for (let i = 0; i < outilsFiltres.length; i++) {
        const outil = outilsFiltres[i];

        let classe = 'tool-row';
        if (outilSelectionne && outil.id === outilSelectionne.id) {
            classe = 'tool-row tool-row--selected';
        }

        liste.innerHTML += `
            <li class="tool-list__item">
                <button class="${classe}" type="button" data-id="${outil.id}">
                    <span class="tool-row__body">
                        <span class="tool-row__name">${outil.nom}</span>
                        <span class="tool-row__description">${outil.description}</span>
                    </span>
                    <span class="tool-row__meta">${outil.categorie}</span>
                </button>
            </li>`;
    }

    const lignes = document.querySelectorAll('.tool-row');
    for (let i = 0; i < lignes.length; i++) {
        lignes[i].addEventListener('click', function () {
            selectionnerOutil(Number(lignes[i].dataset.id));
        });
    }
}

function afficherDetail() {
    const outil = outilSelectionne;
    if (!outil) {
        return;
    }

    let prix = outil.gratuit ? 'Gratuit' : 'Payant';

    let ref = '#' + outil.id;
    if (outil.id < 10) {
        ref = '#0' + outil.id;
    }

    detailTitre.textContent = outil.nom;
    detailDescription.textContent = outil.description;
    badgeCategorie.textContent = outil.categorie;
    badgePrix.textContent = prix;
    infoCategorie.textContent = outil.categorie;
    infoPrix.textContent = prix;
    infoRef.textContent = ref;

    afficherSimilaires();
}

// Afficher les outils de la même catégorie
function afficherSimilaires() {
    zoneSimilaires.innerHTML = '';
    let nombre = 0;

    for (let i = 0; i < outils.length; i++) {
        const outil = outils[i];

        if (outil.categorie === outilSelectionne.categorie && outil.id !== outilSelectionne.id && nombre < 3) {
            zoneSimilaires.innerHTML += `
                <button class="related-card" type="button" data-id="${outil.id}">
                    <span class="related-card__name">${outil.nom}</span>
                    <span class="related-card__description">${outil.description}</span>
                </button>`;
            nombre++;
        }
    }

    const cartes = document.querySelectorAll('.related-card');
    for (let i = 0; i < cartes.length; i++) {
        cartes[i].addEventListener('click', function () {
            selectionnerOutil(Number(cartes[i].dataset.id));
        });
    }
}

function selectionnerOutil(id) {
    for (let i = 0; i < outils.length; i++) {
        if (outils[i].id === id) {
            outilSelectionne = outils[i];
        }
    }

    afficherListe();
    afficherDetail();
}

champRecherche.addEventListener('input', function () {
    recherche = champRecherche.value;
    afficherListe();
});

boutonGratuit.addEventListener('click', function () {
    gratuitsUniquement = !gratuitsUniquement;
    boutonGratuit.classList.toggle('toggle--active');
    boutonGratuit.setAttribute('aria-pressed', gratuitsUniquement);
    afficherListe();
});

detailLink.addEventListener('click', function (event) {
    // On empêche le lien de suivre son href="#"
    event.preventDefault();

    // Certains outils n'ont pas de lien (lien: null dans le JSON)
    if (outilSelectionne.lien) {
        window.open(outilSelectionne.lien, '_blank');
    } else {
        alert("Cet outil n'a pas de lien.");
    }
});

fetch('./src/datas/outils.json')
    .then(function (reponse) {
        return reponse.json();
    })
    .then(function (donnees) {
        outils = donnees;
        outilSelectionne = outils[0];

        afficherFiltres();
        afficherListe();
        afficherDetail();
    })
    .catch(function (erreur) {
        console.error('Erreur de chargement des outils :', erreur);
    });
