import { categories } from './data.js';
import { createCarousel } from './components/Carousel.js';

const PROFILE_NAME_KEY = 'perfilAtivoNome';
const PROFILE_IMAGE_KEY = 'perfilAtivoImagem';

class ActiveProfileStorage {
    constructor(storage, nameKey = PROFILE_NAME_KEY, imageKey = PROFILE_IMAGE_KEY) {
        this.storage = storage;
        this.nameKey = nameKey;
        this.imageKey = imageKey;
    }

    get() {
        const name = this.storage.getItem(this.nameKey);
        const image = this.storage.getItem(this.imageKey);

        if (!name || !image) {
            return null;
        }

        return { name, image };
    }
}

class ProfileHeaderView {
    constructor(nameElement, imageElement) {
        this.nameElement = nameElement;
        this.imageElement = imageElement;
    }

    render(profile) {
        if (!profile || !this.nameElement || !this.imageElement) {
            return;
        }

        this.nameElement.textContent = profile.name;
        this.imageElement.src = profile.image;
        this.imageElement.alt = `Perfil de ${profile.name}`;
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
    const headerView = new ProfileHeaderView(
        document.querySelector('.kids-link'),
        document.querySelector('.profile-icon')
    );
    const catalogRenderer = new CatalogRenderer(
        document.getElementById('main-content'),
        createCarousel
    );

    const app = new CatalogApp(profileStorage, headerView, catalogRenderer);
    app.init(categories);
});
