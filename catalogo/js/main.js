import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

const PROFILE_NAME_KEY = 'perfilAtivoNome';
const PROFILE_IMAGE_KEY = 'perfilAtivoImagem';
const PROFILE_ID_KEY = 'perfilAtivoId';

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

        const imageSrc = profile ? normalizeProfileImagePath(profile.image) : '../Assets/profile1.svg';
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
        this.catalogRenderer.render(categoriesData);
    }
}

/* Bootstrap da aplicacao */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ActiveProfileStorage(localStorage);
    const headerView = new ProfileHeaderView(
        document.querySelector('.profile-menu'),
        document.querySelector('.profile-icon')
    );
    const catalogRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        createCarousel
    );

    const app = new CatalogApp(profileStorage, headerView, catalogRenderer);
    app.init(categories);
});
