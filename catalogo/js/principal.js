/* ===========================
    MODULO: PAGINA DE CATALOGO
    =========================== */

import { categorias } from './dados.js';
import { criarCarrossel } from './componentes/Carrossel.js';
import { ProfileHeaderView, CatalogRenderer, CatalogPageApp } from './componentes/PaginaCatalogo.js';
import { inicializarBusca } from './busca.js';
import { ArmazenamentoPerfilAtivo } from './dominio/perfil-ativo.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

/* Inicializa a interface de busca com tolerancia a erros */
function setupSearch(catalogPageApp) {
    return inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems: () => categorias.flatMap((category) => category.items),
        onSelectResult: (item) => catalogPageApp.renderOnlyItem(item)
    });
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );
    const catalogRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        criarCarrossel
    );

    const app = new CatalogPageApp(profileStorage, headerView, catalogRenderer);
    app.init(categorias);

    const searchControls = setupSearch(app);

    // Adiciona funcionalidade ao link "Início" para voltar ao catálogo completo
    const homeLink = document.getElementById('nav-home');
    if (homeLink) {
        homeLink.addEventListener('click', (event) => {
            event.preventDefault();
            searchControls.closePanel();
            app.init(categorias);
        });
    }
});
