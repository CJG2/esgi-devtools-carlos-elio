// Tous les outils du fichier JSON (remplis par le fetch)
let outils = [];

// Les choix de l'utilisateur
let categorieActive = 'Tous';
let recherche = '';
let gratuitsUniquement = false;
let outilSelectionne = null;

// Les id des outils enregistrés
let outilsEnregistres = [];

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
const boutonEnregistrer = document.querySelector('.detail__save');
const iconeEnregistrer = document.querySelector('.detail__save-icon');
const texteEnregistrer = document.querySelector('.detail__save-text');

// Modal du détail (mobile / tablette)
const detail = document.querySelector('.detail');
const boutonFermer = document.querySelector('.detail__close');

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
                zoneFiltres.innerHTML += `<button class="filters__chip h-9 px-3.5 rounded-full border border-fonce/20 text-[13px] font-medium cursor-pointer transition-colors hover:border-fonce aria-pressed:bg-fonce aria-pressed:border-fonce aria-pressed:text-clair aria-pressed:font-semibold" type="button" aria-pressed="false" data-categorie="${categories[i]}">${categories[i]}</button>`;
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

        let classe = 'tool-row group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-fonce/15 text-left cursor-pointer text-fonce hover:bg-fonce/10 transition-all';
        if (outilSelectionne && outil.id === outilSelectionne.id) {
            classe = 'tool-row tool-row--selected group w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left cursor-pointer bg-fonce text-white';
        }

        liste.innerHTML += `
            <li class="tool-list__item">
                <button class="${classe}" type="button" data-id="${outil.id}">
                    <span class="tool-row__body flex-1 min-w-0 flex flex-col gap-0.5">
                        <span class="tool-row__name font-semibold">${outil.nom}</span>
                        <span class="tool-row__description truncate text-xs">${outil.description}</span>
                    </span>
                    <span class="tool-row__meta text-xs text-accent font-semibold">${outil.categorie}</span>
                </button>
            </li>`;
    }

    const lignes = document.querySelectorAll('.tool-row');
    for (let i = 0; i < lignes.length; i++) {
        lignes[i].addEventListener('click', function () {
            selectionnerOutil(Number(lignes[i].dataset.id));
            ouvrirModal();
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
    badgePrix.classList.toggle('is-free', outil.gratuit);
    badgePrix.classList.toggle('is-paid', !outil.gratuit);
    infoCategorie.textContent = outil.categorie;
    infoPrix.textContent = prix;
    infoRef.textContent = ref;

    afficherBoutonEnregistrer();
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
                <button class="related-card group flex flex-col gap-2 p-4.5 rounded-2xl border border-fonce/20 bg-white text-left cursor-pointer transition hover:border-fonce hover:-translate-y-1" type="button" data-id="${outil.id}">
                    <span class="related-card__name font-semibold">${outil.nom}</span>
                    <span class="related-card__description text-sm text-fonce/70">${outil.description}</span>
                    <span class="related-card__link self-start mt-auto px-3.5 py-1.5 rounded-full bg-accent text-xs font-semibold">Voir l'outil</span>
                </button>`;
            nombre++;
        }
    }

    const cartes = document.querySelectorAll('.related-card');
    for (let i = 0; i < cartes.length; i++) {
        cartes[i].addEventListener('click', function () {
            selectionnerOutil(Number(cartes[i].dataset.id));
            // On remonte en haut du détail pour voir le nouvel outil
            detail.scrollTop = 0;
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

// ===== Modal (en dessous de 800px) =====
// Sur PC, la classe max-desktop:hidden n'a aucun effet : le détail reste toujours affiché.

function ouvrirModal() {
    detail.classList.remove('max-desktop:hidden');
    // On bloque le scroll de la page derrière le modal
    document.body.classList.add('overflow-hidden');
    detail.scrollTop = 0;
}

function fermerModal() {
    detail.classList.add('max-desktop:hidden');
    document.body.classList.remove('overflow-hidden');
}

// Fermer avec le bouton
boutonFermer.addEventListener('click', fermerModal);

// Fermer en cliquant sur le fond sombre (autour du panneau)
detail.addEventListener('click', function (event) {
    if (event.target === detail) {
        fermerModal();
    }
});

// Fermer avec la touche Échap
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        fermerModal();
    }
});

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

// ===== Bouton "Enregistrer" =====

// Met à jour l'icône et le texte selon si l'outil affiché est enregistré ou non
function afficherBoutonEnregistrer() {
    const estEnregistre = outilsEnregistres.includes(outilSelectionne.id);

    if (estEnregistre) {
        iconeEnregistrer.classList.replace('bi-bookmark', 'bi-bookmark-fill');
        texteEnregistrer.textContent = 'Enregistré';
    } else {
        iconeEnregistrer.classList.replace('bi-bookmark-fill', 'bi-bookmark');
        texteEnregistrer.textContent = 'Enregistrer';
    }

    boutonEnregistrer.setAttribute('aria-pressed', estEnregistre);
}

boutonEnregistrer.addEventListener('click', function () {
    const id = outilSelectionne.id;

    if (outilsEnregistres.includes(id)) {
        // Déjà enregistré -> on le retire de la liste
        outilsEnregistres = outilsEnregistres.filter(function (idEnregistre) {
            return idEnregistre !== id;
        });
    } else {
        // Pas encore enregistré -> on l'ajoute
        outilsEnregistres.push(id);
    }

    afficherBoutonEnregistrer();
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
