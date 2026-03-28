/* ===========================
    MODULO: PAGINA DE SERIES
    =========================== */

import { categorias } from './dados.js';
import { criarCarrossel } from './componentes/Carrossel.js';
import { ProfileHeaderView, CatalogRenderer, CatalogPageApp } from './componentes/PaginaCatalogo.js';
import { inicializarBusca } from './busca.js';
import { ArmazenamentoPerfilAtivo } from './dominio/perfil.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

/* Filtra apenas as series do catalogo */
function extrairSeries(categoriesData) {
    const seriesCategory = categoriesData.find(category => category.title === 'Séries');
    return seriesCategory ? [seriesCategory] : [];
}

/* Inicializa a interface de busca com tolerancia a erros */
function setupSearch(seriesPageApp) {
    const seriesData = extrairSeries(categorias);
    const allSeriesItems = seriesData.flatMap((category) => category.items);

    return inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems: () => allSeriesItems,
        onSelectResult: (item) => seriesPageApp.renderOnlyItem(item)
    });
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );
    const seriesRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        criarCarrossel
    );

    const seriesApp = new CatalogPageApp(profileStorage, headerView, seriesRenderer);

    /* Filtra apenas a categoria de series */
    const seriesData = extrairSeries(categorias);
    seriesApp.init(seriesData);

    /* Configura o sistema de busca */
    setupSearch(seriesApp);
});
