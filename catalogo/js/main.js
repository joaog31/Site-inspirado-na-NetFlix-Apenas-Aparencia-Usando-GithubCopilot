import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';

const PROFILE_NAME_KEY = 'perfilAtivoNome';

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

class CatalogRenderer {
    constructor(container, carouselFactory) {
        this.container = container;
        this.carouselFactory = carouselFactory;
    }

    render(categoriesData) {
        if (!this.container) {
            return;
        }

        categoriesData.forEach((category) => {
            this.container.appendChild(this.carouselFactory(category));
        });
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ActiveProfileStorage(localStorage);
    const headerView = new ProfileHeaderView(document.querySelector('.profile-menu'));
    const catalogRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        createCarousel
    );

    const app = new CatalogApp(profileStorage, headerView, catalogRenderer);
    app.init(categories);
});
