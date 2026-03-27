import { categorias } from './dados.js';
import { criarCarrossel } from './componentes/Carrossel.js';
import { inicializarBusca } from './busca.js';
import { ArmazenamentoPerfilAtivo, normalizarCaminhoImagemPerfil, obterIdPerfilAtivo } from './dominio/perfil.js';
import { obterChaveMinhaLista, criarIdObra, ArmazenamentoMinhaLista } from './dominio/minha-lista.js';

/* ===========================
   CONFIGURACAO E CONSTANTES
   =========================== */

/* Filtra apenas as obras marcadas na lista do perfil */
function getMyListItems(categoriesData, myListIds) {
    return categoriesData
        .flatMap((category) => category.items)
        .filter((item) => myListIds.includes(criarIdObra(item)));
}

/* Atualiza informacoes de acessibilidade e avatar do perfil */
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
        this.profileImageElement.src = profile ? normalizarCaminhoImagemPerfil(profile.image) : '../ativos/perfis/profile1.svg';
        this.profileImageElement.alt = label;
    }
}

/* Renderiza a area principal da pagina Minha lista */
class MyListView {
    constructor(container, clearButton) {
        this.container = container;
        this.clearButton = clearButton;
    }

    render(items) {
        if (!this.container) {
            return;
        }

        this.container.innerHTML = '';

        if (items.length === 0) {
            this.container.innerHTML = `
                <div class="empty-my-list">
                    <h2>Sua lista está vazia</h2>
                    <p>Adicione obras no catálogo para vê-las aqui.</p>
                </div>
            `;
            if (this.clearButton) {
                this.clearButton.disabled = true;
            }
            return;
        }

        if (this.clearButton) {
            this.clearButton.disabled = false;
        }

        this.container.appendChild(criarCarrossel({ title: 'Obras salvas', items }));
    }
}

/* Controlador da pagina Minha lista */
class MyListPageController {
    constructor(profileStorage, myListStorage, headerView, listView) {
        this.profileStorage = profileStorage;
        this.myListStorage = myListStorage;
        this.headerView = headerView;
        this.listView = listView;
        this.currentItems = [];
    }

    init(categoriesData, clearButtonElement) {
        const activeProfile = this.profileStorage.get();
        this.headerView.render(activeProfile);

        this.renderList(categoriesData);

        if (clearButtonElement) {
            clearButtonElement.addEventListener('click', () => {
                this.myListStorage.clear();
                this.renderList(categoriesData);
            });
        }
    }

    renderList(categoriesData) {
        const myListIds = this.myListStorage.getAll();
        const items = getMyListItems(categoriesData, myListIds);
        this.currentItems = items;
        document.body.classList.remove('modo-busca-resultado');
        this.listView.render(items);
    }

    getCurrentItems() {
        return this.currentItems;
    }

    renderOnlyItem(item) {
        if (!item) {
            return;
        }

        this.currentItems = [item];
        document.body.classList.add('modo-busca-resultado');
        this.listView.render(this.currentItems);
    }
}

/* Inicializa a interface de busca com base na lista exibida */
function setupSearch(getSourceItems, onSelectItem) {
    return inicializarBusca({
        triggerButton: document.getElementById('search-trigger'),
        panel: document.getElementById('search-panel'),
        closeButton: document.getElementById('search-close'),
        input: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        getSourceItems,
        onSelectResult: (item) => onSelectItem(item)
    });
}

/* Bootstrap da pagina Minha lista */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const profileId = obterIdPerfilAtivo(localStorage);
    const myListStorage = new ArmazenamentoMinhaLista(localStorage, obterChaveMinhaLista(profileId));

    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );

    const clearButton = document.getElementById('clear-my-list');
    const listView = new MyListView(document.getElementById('my-list-content'), clearButton);

    const controller = new MyListPageController(profileStorage, myListStorage, headerView, listView);
    controller.init(categorias, clearButton);

    const searchControls = setupSearch(
        () => controller.getCurrentItems(),
        (item) => controller.renderOnlyItem(item)
    );

    // Adiciona funcionalidade ao link "Início" para voltar ao catálogo completo
    const homeLink = document.getElementById('nav-home');
    if (homeLink) {
        homeLink.addEventListener('click', (event) => {
            event.preventDefault();
            searchControls.closePanel();
            controller.init(categorias, clearButton);
        });
    }
});
