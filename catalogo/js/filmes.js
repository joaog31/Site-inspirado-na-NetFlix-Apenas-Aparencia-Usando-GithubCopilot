/* ===========================
    MODULO: PAGINA DE FILMES
    =========================== */

import { categorias } from './dados.js';
import { criarCarrossel } from './componentes/Carrossel.js';
import { ProfileHeaderView, CatalogRenderer, CatalogPageApp } from './componentes/PaginaCatalogo.js';
import { inicializarBusca } from './busca.js';
import { ArmazenamentoPerfilAtivo } from './dominio/perfil.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

/* Filtra apenas os filmes do catalogo */
function extrairFilmes(categoriesData) {
    const filmesCategory = categoriesData.find(category => category.title === 'Para maratonar');
    return filmesCategory ? [filmesCategory] : [];
}

/* Inicializa a interface de busca com tolerancia a erros */
function setupSearch(filmesPageApp) {
    const filmesData = extrairFilmes(categorias);
    const allFilmesItems = filmesData.flatMap((category) => category.items);

    return inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems: () => allFilmesItems,
        onSelectResult: (item) => filmesPageApp.renderOnlyItem(item)
    });
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );
    const filmesRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        criarCarrossel
    );

    const filmesApp = new CatalogPageApp(profileStorage, headerView, filmesRenderer);

    /* Filtra apenas a categoria de filmes */
    const filmesData = extrairFilmes(categorias);
    filmesApp.init(filmesData);

    /* Configura o sistema de busca */
    setupSearch(filmesApp);
});
