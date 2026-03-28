/* ===========================
    MODULO: MENU DE PERFIL
    =========================== */

import { criarIdPerfil, normalizarCaminhoImagemPerfil, ArmazenamentoPerfilAtivo } from './dominio/perfil-ativo.js';

const AVATAR_OPTIONS = [
    'ativos/perfis/profile1.svg',
    'ativos/perfis/profile2.svg',
    'ativos/perfis/profile3.svg',
    'ativos/perfis/profile4.svg',
];

/* Controla visibilidade e interacoes do menu de perfil dropdown */
class ProfileDropdownController {
    constructor(profileMenuBtn, dropdownMenu) {
        this.profileMenuBtn = profileMenuBtn;
        this.dropdownMenu = dropdownMenu;
        this.isOpen = false;
    }

    init() {
        this.profileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.profileMenuBtn.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.close();
            }
        });

        this.dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.dropdownMenu.classList.add('active');
        this.profileMenuBtn.classList.add('is-open');
        this.isOpen = true;
    }

    close() {
        this.dropdownMenu.classList.remove('active');
        this.profileMenuBtn.classList.remove('is-open');
        this.isOpen = false;
    }
}

/* Gerencia a tela de edicao de perfil */
class ProfileEditModal {
    constructor(modal, profileStorage) {
        this.modal = modal;
        this.profileStorage = profileStorage;
        this.currentProfile = null;
    }

    init() {
        if (!this.modal) {
            return;
        }

        const closeBtn = this.modal.querySelector('.profile-edit-close');
        const saveBtn = this.modal.querySelector('.profile-edit-save-btn');
        const cancelBtn = this.modal.querySelector('.profile-edit-cancel-btn');

        if (!closeBtn || !saveBtn || !cancelBtn) {
            return;
        }

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        saveBtn.addEventListener('click', () => this.save());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.hidden) {
                this.close();
            }
        });
    }

    open(profile) {
        if (!this.modal || !profile) {
            return;
        }

        this.currentProfile = { ...profile };

        const nameInput = this.modal.querySelector('#profile-edit-name');
        const avatarContainer = this.modal.querySelector('.profile-edit-avatar-options');
        const currentImg = this.modal.querySelector('.profile-edit-current-img');

        if (!nameInput || !avatarContainer || !currentImg) {
            return;
        }

        nameInput.value = profile.name || '';
        currentImg.src = normalizarCaminhoImagemPerfil(profile.image);

        this.renderAvatarOptions(avatarContainer, profile.image);

        this.modal.hidden = false;
        nameInput.focus();
    }

    renderAvatarOptions(container, currentImage) {
        if (!container) {
            return;
        }

        container.innerHTML = '';

        AVATAR_OPTIONS.forEach((avatarPath) => {
            const normalizedCurrent = currentImage.replace(/^\.\.\//, '');
            const isCurrent = avatarPath === normalizedCurrent || avatarPath === currentImage;

            const label = document.createElement('label');
            label.className = 'avatar-option-wrapper';
            if (isCurrent) label.classList.add('selected');

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'avatar';
            radio.value = avatarPath;
            radio.checked = isCurrent;
            radio.addEventListener('change', () => {
                container.querySelectorAll('.avatar-option-wrapper').forEach((l) => l.classList.remove('selected'));
                label.classList.add('selected');

                const currentImg = this.modal.querySelector('.profile-edit-current-img');
                currentImg.src = normalizarCaminhoImagemPerfil(avatarPath);
                this.currentProfile.image = avatarPath;
            });

            const img = document.createElement('img');
            img.src = normalizarCaminhoImagemPerfil(avatarPath);
            img.alt = `Avatar ${AVATAR_OPTIONS.indexOf(avatarPath) + 1}`;

            label.appendChild(radio);
            label.appendChild(img);
            container.appendChild(label);
        });
    }

    save() {
        const nameInput = this.modal.querySelector('#profile-edit-name');
        if (!nameInput || !this.currentProfile) {
            return;
        }

        const newName = nameInput.value.trim();

        if (!newName) {
            alert('Nome do perfil não pode estar vazio');
            return;
        }

        this.currentProfile.name = newName;
        if (!this.currentProfile.id) {
            this.currentProfile.id = criarIdPerfil(newName);
        }

        this.profileStorage.set(this.currentProfile);

        globalThis.dispatchEvent(new CustomEvent('profileUpdated', { detail: this.currentProfile }));

        this.close();
    }

    close() {
        if (!this.modal) {
            return;
        }

        this.modal.hidden = true;
        this.currentProfile = null;
    }
}

/* Inicializa o sistema de menu de perfil */
function initProfileMenu() {
    const profileMenuBtn = document.querySelector('.profile-menu');
    const dropdownMenu = document.querySelector('.profile-dropdown-menu');
    const editProfileBtn = document.querySelector('#edit-profile-btn');
    const switchProfileBtn = document.querySelector('#switch-profile-btn');
    const profileEditModal = document.querySelector('#profile-edit-modal');

    if (!profileMenuBtn || !dropdownMenu || !editProfileBtn || !switchProfileBtn || !profileEditModal) {
        console.warn('Elementos do menu de perfil não encontrados');
        return;
    }

    const profileStorage = new ArmazenamentoPerfilAtivo(localStorage);
    const dropdownController = new ProfileDropdownController(profileMenuBtn, dropdownMenu);
    const editModal = new ProfileEditModal(profileEditModal, profileStorage);

    dropdownController.init();
    editModal.init();

    editProfileBtn.addEventListener('click', () => {
        const activeProfile = profileStorage.get();
        if (activeProfile) {
            dropdownController.close();
            editModal.open(activeProfile);
        }
    });

    switchProfileBtn.addEventListener('click', () => {
        globalThis.location.href = '../index.html';
    });

    globalThis.addEventListener('profileUpdated', (e) => {
        const img = document.querySelector('.profile-icon');
        const profile = e.detail;
        if (!img || !profile) {
            return;
        }

        img.src = normalizarCaminhoImagemPerfil(profile.image);
    });
}

document.addEventListener('DOMContentLoaded', initProfileMenu);
