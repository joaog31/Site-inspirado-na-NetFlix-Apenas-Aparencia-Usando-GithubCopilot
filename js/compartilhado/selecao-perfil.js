import { ArmazenamentoPerfilAtivo, criarIdPerfil } from '../../catalogo/js/dominio/perfil.js';

/* ===========================
    CONFIGURACAO E CONSTANTES
    =========================== */

const CAMINHO_CATALOGO = 'catalogo/catalogo.html';

/* Extrai nome e imagem diretamente do card de perfil clicado */
class ExtratorPerfil {
    extract(profileElement) {
        const imageElement = profileElement.querySelector('img');
        const captionElement = profileElement.querySelector('figcaption');

        if (!imageElement || !captionElement) {
            return null;
        }

        return {
            name: captionElement.textContent.trim(),
            image: imageElement.getAttribute('src'),
            id: criarIdPerfil(captionElement.textContent)
        };
    }
}

/* Camada simples de navegacao para desacoplar redirecionamento */
class Navegador {
    constructor(locationObject) {
        this.locationObject = locationObject;
    }

    goTo(path) {
        this.locationObject.href = path;
    }
}

/* Orquestra extracao, persistencia e redirecionamento */
class ControladorSelecaoPerfil {
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
        this.navigator.goTo(CAMINHO_CATALOGO);
    }
}

/* Conecta os cards de perfil ao fluxo de selecao */
function vincularSelecaoPerfil(profileElements, controller) {
    profileElements.forEach((profileElement) => {
        profileElement.addEventListener('click', () => {
            controller.activate(profileElement);
        });
    });
}

/* Bootstrap da pagina inicial */
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ControladorSelecaoPerfil(
        new ArmazenamentoPerfilAtivo(localStorage),
        new ExtratorPerfil(),
        new Navegador(globalThis.location)
    );

    vincularSelecaoPerfil(document.querySelectorAll('.profile'), controller);
});
