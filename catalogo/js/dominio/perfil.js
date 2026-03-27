/* ===========================
   DOMINIO DE PERFIL
   =========================== */

export const CHAVE_NOME_PERFIL_ATIVO = 'perfilAtivoNome';
export const CHAVE_IMAGEM_PERFIL_ATIVO = 'perfilAtivoImagem';
export const CHAVE_ID_PERFIL_ATIVO = 'perfilAtivoId';

/* Gera identificador estavel para separar dados por perfil */
export function criarIdPerfil(name) {
    return String(name || '')
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-');
}

/* Recupera o id do perfil ativo com fallback seguro */
export function obterIdPerfilAtivo(storage, fallback = 'default') {
    const rawValue = storage.getItem(CHAVE_ID_PERFIL_ATIVO);
    const normalized = String(rawValue || '').trim();
    return normalized || fallback;
}

/* Ajusta caminho da imagem salva na home para funcionar dentro de /catalogo */
export function normalizarCaminhoImagemPerfil(imagePath, fallback = '../ativos/perfis/profile1.svg') {
    if (!imagePath) {
        return fallback;
    }

    const isAbsoluteUrl = /^https?:\/\//i.test(imagePath);
    if (isAbsoluteUrl || imagePath.startsWith('../')) {
        return imagePath;
    }

    return `../${String(imagePath).replace(/^\.\//, '')}`;
}

/* Le e escreve dados do perfil ativo no storage */
export class ArmazenamentoPerfilAtivo {
    constructor(storage, nameKey = CHAVE_NOME_PERFIL_ATIVO, imageKey = CHAVE_IMAGEM_PERFIL_ATIVO, idKey = CHAVE_ID_PERFIL_ATIVO) {
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

    set(profile) {
        if (!profile) {
            return;
        }

        this.storage.setItem(this.nameKey, profile.name || '');
        this.storage.setItem(this.imageKey, profile.image || '');
        this.storage.setItem(this.idKey, profile.id || criarIdPerfil(profile.name));
    }
}
