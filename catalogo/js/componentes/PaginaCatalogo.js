/* ===========================
    MODULO: PAGINA BASE DO CATALOGO
    =========================== */

import { normalizarCaminhoImagemPerfil } from '../dominio/perfil.js';

/* Atualiza informacoes de acessibilidade do menu de perfil */
export class ProfileHeaderView {
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

/* Renderiza secoes de catalogo no container principal */
export class CatalogRenderer {
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

/* Controlador base de pagina de catalogo */
export class CatalogPageApp {
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