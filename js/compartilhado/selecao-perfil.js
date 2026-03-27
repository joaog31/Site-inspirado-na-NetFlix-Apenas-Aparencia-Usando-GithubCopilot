import { ArmazenamentoPerfilAtivo, criarIdPerfil } from '../../catalogo/js/dominio/perfil.js';
import { ArmazenamentoPerfis, MAX_PERFIS } from '../../catalogo/js/dominio/perfis.js';

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

/* ===========================
   GERENCIADOR DE PERFIS
   =========================== */

const AVATARES_DISPONIVEIS = [
    'ativos/perfis/profile1.svg',
    'ativos/perfis/profile2.svg',
    'ativos/perfis/profile3.svg',
    'ativos/perfis/profile4.svg',
    'ativos/perfis/profile5.svg',
    'ativos/perfis/profile6.svg'
];

class GerenciadorPerfisUI {
    constructor(storage, onProfilesChanged) {
        this.storage = storage;
        this.onProfilesChanged = onProfilesChanged;
        this.modal = document.getElementById('manage-modal');
        this.profilesList = document.getElementById('profiles-list');
        this.profileNameInput = document.getElementById('profile-name');
        this.createButton = document.getElementById('create-profile-btn');
        this.modalClose = document.getElementById('modal-close');
        this.profileCount = document.getElementById('profile-count');
        this.avatarOptions = document.getElementById('avatar-options');
        this.newProfileSection = document.getElementById('new-profile-section');
        
        this.selectedAvatar = AVATARES_DISPONIVEIS[0];
        this.setupEventListeners();
        this.renderAvatarOptions();
    }

    setupEventListeners() {
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        this.createButton.addEventListener('click', () => this.handleCreateProfile());
        this.profileNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCreateProfile();
        });
    }

    renderAvatarOptions() {
        this.avatarOptions.innerHTML = '';
        AVATARES_DISPONIVEIS.forEach((avatar) => {
            const button = document.createElement('button');
            button.className = 'avatar-option';
            if (avatar === this.selectedAvatar) button.classList.add('selected');
            button.type = 'button';
            
            const img = document.createElement('img');
            img.src = avatar;
            img.alt = 'Avatar';
            button.appendChild(img);
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedAvatar = avatar;
            });
            
            this.avatarOptions.appendChild(button);
        });
    }

    handleCreateProfile() {
        const nome = this.profileNameInput.value.trim();
        
        if (!nome) {
            this.showError('Digite um nome para o perfil');
            return;
        }

        if (nome.length > 20) {
            this.showError('Nome muito longo (máximo 20 caracteres)');
            return;
        }

        if (!this.storage.podeAdicionar()) {
            this.showError(`Limite de ${MAX_PERFIS} perfis atingido`);
            return;
        }

        if (this.storage.adicionar(nome, this.selectedAvatar)) {
            this.profileNameInput.value = '';
            this.selectedAvatar = AVATARES_DISPONIVEIS[0];
            this.renderAvatarOptions();
            this.renderProfiles();
            this.updateCount();
            this.onProfilesChanged();
        } else {
            this.showError('Um perfil com este nome já existe');
        }
    }

    renderProfiles() {
        this.profilesList.innerHTML = '';
        const perfis = this.storage.obterTodos();

        perfis.forEach((perfil) => {
            const card = document.createElement('div');
            card.className = 'profile-card';

            const img = document.createElement('img');
            img.src = perfil.image;
            img.alt = perfil.name;

            const name = document.createElement('div');
            name.className = 'profile-card-name';
            name.textContent = perfil.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.type = 'button';
            deleteBtn.textContent = 'Apagar';
            deleteBtn.disabled = perfis.length <= 1;

            deleteBtn.addEventListener('click', () => {
                if (confirm(`Tem certeza que quer apagar o perfil "${perfil.name}"?`)) {
                    this.storage.deletar(perfil.id);
                    this.renderProfiles();
                    this.updateCount();
                    this.onProfilesChanged();
                }
            });

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(deleteBtn);
            this.profilesList.appendChild(card);
        });
    }

    updateCount() {
        const total = this.storage.obterTotal();
        this.profileCount.textContent = `${total} / ${MAX_PERFIS} perfis`;
    }

    showError(message) {
        alert(message);
    }

    openModal() {
        this.modal.hidden = false;
        this.renderProfiles();
        this.updateCount();
        this.profileNameInput.focus();
    }

    closeModal() {
        this.modal.hidden = true;
        this.profileNameInput.value = '';
    }
}

/* Bootstrap da pagina inicial */
document.addEventListener('DOMContentLoaded', () => {
    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const perfisStorage = new ArmazenamentoPerfis(localStorage);

    const controller = new ControladorSelecaoPerfil(
        profileStorage,
        new ExtratorPerfil(),
        new Navegador(globalThis.location)
    );

    const gerenciador = new GerenciadorPerfisUI(perfisStorage, () => {
        renderizarPerfis(perfisStorage, controller);
    });

    const manageBtn = document.getElementById('manage-profiles-btn');
    manageBtn.addEventListener('click', () => gerenciador.openModal());

    renderizarPerfis(perfisStorage, controller);
});

function renderizarPerfis(perfisStorage, controller) {
    const container = document.querySelector('.container');
    const perfis = perfisStorage.obterTodos();

    container.innerHTML = '';
    perfis.forEach((perfil) => {
        const li = document.createElement('li');
        li.className = 'profile-item';

        const button = document.createElement('button');
        button.className = 'profile';
        button.type = 'button';
        button.setAttribute('aria-label', `Entrar com o perfil ${perfil.name}`);

        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.src = perfil.image;
        img.alt = `Perfil de ${perfil.name}`;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = perfil.name;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        button.appendChild(figure);

        button.addEventListener('click', () => {
            const profileElement = button.querySelector('figure');
            if (profileElement) {
                controller.activate(button);
            }
        });

        li.appendChild(button);
        container.appendChild(li);
    });
}
