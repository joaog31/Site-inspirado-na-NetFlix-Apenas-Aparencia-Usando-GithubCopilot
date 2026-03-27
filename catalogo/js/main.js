import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';
import { getYouTubeId } from './utils.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

const PROFILE_NAME_KEY = 'perfilAtivoNome';
const MY_LIST_STORAGE_KEY = 'catalogo-minha-lista';

/* Recupera o perfil ativo salvo no localStorage */
class ActiveProfileStorage {
    constructor(storage, nameKey = PROFILE_NAME_KEY) {
        this.storage = storage;
        this.nameKey = nameKey;
    }

    get() {
        const name = this.storage.getItem(this.nameKey);

        if (!name) {
            return null;
        }

        return { name };
    }
}

/* Recupera os IDs da lista pessoal salvos no navegador */
class MyListStorage {
    constructor(storage, key = MY_LIST_STORAGE_KEY) {
        this.storage = storage;
        this.key = key;
    }

    getAll() {
        const rawValue = this.storage.getItem(this.key);

        if (!rawValue) {
            return [];
        }

        try {
            const parsedValue = JSON.parse(rawValue);
            return Array.isArray(parsedValue) ? parsedValue : [];
        } catch {
            return [];
        }
    }
}

/* Gera o mesmo identificador usado pelos cards para salvar na lista */
function createWorkId(item) {
    const baseTitle = (item.title || '').trim().toLowerCase().replaceAll(' ', '-');
    const videoId = getYouTubeId(item.youtube);
    return `${baseTitle}-${videoId}`;
}

/* Monta a categoria Minha lista a partir das obras marcadas */
function buildMyListCategory(categoriesData, myListIds) {
    const selectedItems = categoriesData
        .flatMap((category) => category.items)
        .filter((item) => myListIds.includes(createWorkId(item)));

    if (selectedItems.length === 0) {
        return null;
    }

    return {
        title: 'Minha lista',
        items: selectedItems
    };
}

/* Atualiza informacoes de acessibilidade do menu de perfil */
class ProfileHeaderView {
    constructor(profileMenuElement) {
        this.profileMenuElement = profileMenuElement;
    }

    render(profile) {
        if (!this.profileMenuElement) {
            return;
        }

        const label = profile ? `Perfil de ${profile.name}` : 'Perfil';
        this.profileMenuElement.setAttribute('aria-label', label);
        this.profileMenuElement.title = label;
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
            const section = this.carouselFactory(category);

            if (category.title === 'Minha lista') {
                section.id = 'minha-lista-section';
            }

            this.container.appendChild(section);
        });
    }
}

/* Controlador principal da pagina de catalogo */
class CatalogApp {
    constructor(profileStorage, myListStorage, headerView, catalogRenderer) {
        this.profileStorage = profileStorage;
        this.myListStorage = myListStorage;
        this.headerView = headerView;
        this.catalogRenderer = catalogRenderer;
    }

    init(categoriesData) {
        const activeProfile = this.profileStorage.get();
        this.headerView.render(activeProfile);

        this.renderCatalog(categoriesData);
        this.bindMyListUpdates(categoriesData);
    }

    renderCatalog(categoriesData) {
        const myListIds = this.myListStorage.getAll();
        const myListCategory = buildMyListCategory(categoriesData, myListIds);
        const categoriesToRender = myListCategory
            ? [myListCategory, ...categoriesData]
            : categoriesData;

        this.catalogRenderer.render(categoriesToRender);
    }

    bindMyListUpdates(categoriesData) {
        document.addEventListener('my-list-updated', () => {
            this.renderCatalog(categoriesData);
        });
    }
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ActiveProfileStorage(localStorage);
    const myListStorage = new MyListStorage(localStorage);
    const headerView = new ProfileHeaderView(document.querySelector('.profile-menu'));
    const catalogRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        createCarousel
    );

    const app = new CatalogApp(profileStorage, myListStorage, headerView, catalogRenderer);
    app.init(categories);
});
