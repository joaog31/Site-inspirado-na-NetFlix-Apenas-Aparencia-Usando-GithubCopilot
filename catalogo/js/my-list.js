import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';
import { getYouTubeId } from './utils.js';

/* ===========================
   CONFIGURACAO E CONSTANTES
   =========================== */

const PROFILE_NAME_KEY = 'perfilAtivoNome';
const PROFILE_IMAGE_KEY = 'perfilAtivoImagem';
const PROFILE_ID_KEY = 'perfilAtivoId';
const MY_LIST_STORAGE_KEY = 'catalogo-minha-lista';

/* Monta a chave final da lista com escopo por perfil */
function getMyListStorageKey(profileId = 'default') {
    return `${MY_LIST_STORAGE_KEY}-${profileId}`;
}

/* Recupera o perfil ativo salvo no localStorage */
class ActiveProfileStorage {
    constructor(storage, nameKey = PROFILE_NAME_KEY, imageKey = PROFILE_IMAGE_KEY, idKey = PROFILE_ID_KEY) {
        this.storage = storage;
        this.nameKey = nameKey;
        this.imageKey = imageKey;
        this.idKey = idKey;
    }

    get() {
        const name = this.storage.getItem(this.nameKey);
        const image = this.storage.getItem(this.imageKey);
        const id = this.storage.getItem(this.idKey);

        if (!name) {
            return null;
        }

        return { name, image, id };
    }
}

/* Ajusta caminho da imagem salva na home para funcionar dentro de /catalogo */
function normalizeProfileImagePath(imagePath) {
    if (!imagePath) {
        return '../Assets/profile1.svg';
    }

    const isAbsoluteUrl = /^https?:\/\//i.test(imagePath);
    if (isAbsoluteUrl || imagePath.startsWith('../')) {
        return imagePath;
    }

    return `../${imagePath.replace(/^\.\//, '')}`;
}

/* Recupera e gerencia os IDs da lista pessoal */
class MyListStorage {
    constructor(storage, key) {
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

    clear() {
        this.storage.setItem(this.key, JSON.stringify([]));
    }
}

/* Gera o mesmo identificador usado nos cards */
function createWorkId(item) {
    const baseTitle = (item.title || '').trim().toLowerCase().replaceAll(' ', '-');
    const videoId = getYouTubeId(item.youtube);
    return `${baseTitle}-${videoId}`;
}

/* Filtra apenas as obras marcadas na lista do perfil */
function getMyListItems(categoriesData, myListIds) {
    return categoriesData
        .flatMap((category) => category.items)
        .filter((item) => myListIds.includes(createWorkId(item)));
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
        this.profileImageElement.src = profile ? normalizeProfileImagePath(profile.image) : '../Assets/profile1.svg';
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

        this.container.appendChild(createCarousel({ title: 'Obras salvas', items }));
    }
}

/* Controlador da pagina Minha lista */
class MyListPageController {
    constructor(profileStorage, myListStorage, headerView, listView) {
        this.profileStorage = profileStorage;
        this.myListStorage = myListStorage;
        this.headerView = headerView;
        this.listView = listView;
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
        this.listView.render(items);
    }
}

/* Bootstrap da pagina Minha lista */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ActiveProfileStorage(localStorage);
    const activeProfile = profileStorage.get();
    const myListStorage = new MyListStorage(localStorage, getMyListStorageKey(activeProfile?.id));

    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );

    const clearButton = document.getElementById('clear-my-list');
    const listView = new MyListView(document.getElementById('my-list-content'), clearButton);

    const controller = new MyListPageController(profileStorage, myListStorage, headerView, listView);
    controller.init(categories, clearButton);
});
