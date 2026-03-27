const PROFILE_NAME_KEY = 'perfilAtivoNome';
const PROFILE_IMAGE_KEY = 'perfilAtivoImagem';
const CATALOG_PATH = 'catalogo/catalogo.html';

class ActiveProfileStorage {
    constructor(storage, nameKey = PROFILE_NAME_KEY, imageKey = PROFILE_IMAGE_KEY) {
        this.storage = storage;
        this.nameKey = nameKey;
        this.imageKey = imageKey;
    }

    set(profile) {
        if (!profile) {
            return;
        }

        this.storage.setItem(this.nameKey, profile.name);
        this.storage.setItem(this.imageKey, profile.image);
    }
}

class ProfileExtractor {
    extract(profileElement) {
        const imageElement = profileElement.querySelector('img');
        const captionElement = profileElement.querySelector('figcaption');

        if (!imageElement || !captionElement) {
            return null;
        }

        return {
            name: captionElement.textContent.trim(),
            image: imageElement.getAttribute('src')
        };
    }
}

class Navigator {
    constructor(locationObject) {
        this.locationObject = locationObject;
    }

    goTo(path) {
        this.locationObject.href = path;
    }
}

class ProfileSelectionController {
    constructor(storage, extractor, navigator) {
        this.storage = storage;
        this.extractor = extractor;
        this.navigator = navigator;
    }

    activate(profileElement) {
        const profile = this.extractor.extract(profileElement);
        if (!profile) {
            return;
        }

        this.storage.set(profile);
        this.navigator.goTo(CATALOG_PATH);
    }
}

function bindProfileSelection(profileElements, controller) {
    profileElements.forEach((profileElement) => {
        profileElement.addEventListener('click', () => {
            controller.activate(profileElement);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const controller = new ProfileSelectionController(
        new ActiveProfileStorage(localStorage),
        new ProfileExtractor(),
        new Navigator(globalThis.location)
    );

    bindProfileSelection(document.querySelectorAll('.profile'), controller);
});
