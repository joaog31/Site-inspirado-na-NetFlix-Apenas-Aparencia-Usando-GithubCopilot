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

/* Renderiza as secoes do catalogo no container principal */
class CatalogRenderer {
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

/* Controlador principal da pagina de catalogo */
class CatalogApp {
    constructor(profileStorage, headerView, catalogRenderer) {
        this.profileStorage = profileStorage;
        this.headerView = headerView;
        this.catalogRenderer = catalogRenderer;
    }

    init(categoriesData) {
        const activeProfile = this.profileStorage.get();
        this.headerView.render(activeProfile);
        document.body.classList.remove('modo-busca-resultado');
        this.catalogRenderer.render(categoriesData);
    }

    renderOnlyItem(item) {
        if (!item) {
            return;
        }

        document.body.classList.add('modo-busca-resultado');
        this.catalogRenderer.render([{ title: 'Resultado da busca', items: [item] }]);
    }
}

/* Inicializa a interface de busca com tolerancia a erros */
function setupSearch(catalogApp) {
    inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems: () => categorias.flatMap((category) => category.items),
        onSelectResult: (item) => catalogApp.renderOnlyItem(item)
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

    const app = new CatalogApp(profileStorage, headerView, catalogRenderer);
    app.init(categorias);

    setupSearch(app);
});
