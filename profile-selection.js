/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

const PROFILE_NAME_KEY = 'perfilAtivoNome';
const PROFILE_IMAGE_KEY = 'perfilAtivoImagem';
const CATALOG_PATH = 'catalogo/catalogo.html';

/* Responsavel por persistir o perfil selecionado no navegador */
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

/* Extrai nome e imagem diretamente do card de perfil clicado */
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

/* Camada simples de navegacao para desacoplar redirecionamento */
class Navigator {
    constructor(locationObject) {
        this.locationObject = locationObject;
    }

    goTo(path) {
        this.locationObject.href = path;
    }
}

/* Orquestra extracao, persistencia e redirecionamento */
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

/* Conecta os cards de perfil ao fluxo de selecao */
function bindProfileSelection(profileElements, controller) {
    profileElements.forEach((profileElement) => {
        profileElement.addEventListener('click', () => {
            controller.activate(profileElement);
        });
    });
}

/* Bootstrap da pagina inicial */
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ProfileSelectionController(
        new ActiveProfileStorage(localStorage),
        new ProfileExtractor(),
        new Navigator(globalThis.location)
    );

    bindProfileSelection(document.querySelectorAll('.profile'), controller);
});
