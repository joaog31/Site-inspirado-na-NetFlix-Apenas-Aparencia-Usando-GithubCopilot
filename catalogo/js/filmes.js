/* ===========================
    MODULO: PAGINA DE FILMES
    =========================== */

import { categorias } from './dados.js';
import { criarCarrossel } from './componentes/Carrossel.js';
import { inicializarBusca } from './busca.js';
import { ArmazenamentoPerfilAtivo, normalizarCaminhoImagemPerfil } from './dominio/perfil.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

/* Atualiza informacoes de acessibilidade do menu de perfil */
class ProfileHeaderView {
    constructor(profileMenuElement, profileImageElement) {
        this.profileMenuElement = profileMenuElement;
        this.profileImageElement = profileImageElement;
    }

    render(profile) {
        if (!this.profileMenuElement || !this.profileImageElement) {
            return;
        }

        const label = profile ? `Perfil de ${profile.name}` : 'Perfil';
        this.profileMenuElement.setAttribute('aria-label', label);
        this.profileMenuElement.title = label;

        const imageSrc = profile ? normalizarCaminhoImagemPerfil(profile.image) : '../ativos/perfis/profile1.svg';
        this.profileImageElement.src = imageSrc;
        this.profileImageElement.alt = label;
    }
}

/* Renderiza as secoes de filmes no container principal */
class FilmesRenderer {
    constructor(container, carouselFactory) {
        this.container = container;
        this.carouselFactory = carouselFactory;
    }

    render(categoriesData) {
        if (!this.container) {
            return;
        }

        this.container.innerHTML = '';

        categoriesData.forEach((category) => {
            this.container.appendChild(this.carouselFactory(category));
        });
    }
}

/* Controlador principal da pagina de filmes */
class FilmesApp {
    constructor(profileStorage, headerView, filmesRenderer) {
        this.profileStorage = profileStorage;
        this.headerView = headerView;
        this.filmesRenderer = filmesRenderer;
    }

    init(filmesData) {
        const activeProfile = this.profileStorage.get();
        this.headerView.render(activeProfile);
        document.body.classList.remove('modo-busca-resultado');
        this.filmesRenderer.render(filmesData);
    }

    renderOnlyItem(item) {
        if (!item) {
            return;
        }

        document.body.classList.add('modo-busca-resultado');
        this.filmesRenderer.render([{ title: 'Resultado da busca', items: [item] }]);
    }
}

/* Filtra apenas os filmes do catalogo */
function extrairFilmes(categoriesData) {
    const filmesCategory = categoriesData.find(category => category.title === 'Para maratonar');
    return filmesCategory ? [filmesCategory] : [];
}

/* Inicializa a interface de busca com tolerancia a erros */
function setupSearch(filmesApp) {
    const filmesData = extrairFilmes(categorias);
    const allFilmesItems = filmesData.flatMap((category) => category.items);

    return inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems: () => allFilmesItems,
        onSelectResult: (item) => filmesApp.renderOnlyItem(item)
    });
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );
    const filmesRenderer = new FilmesRenderer(
        document.getElementById('main-content'),
        criarCarrossel
    );

    const filmesApp = new FilmesApp(profileStorage, headerView, filmesRenderer);

    /* Filtra apenas a categoria de filmes */
    const filmesData = extrairFilmes(categorias);
    filmesApp.init(filmesData);

    /* Configura o sistema de busca */
    setupSearch(filmesApp);
});
