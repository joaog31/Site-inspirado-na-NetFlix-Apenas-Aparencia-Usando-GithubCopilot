/* ===========================
    MODULO: REGRAS DA MINHA LISTA
    =========================== */

import { obterIdYouTube } from '../utilitarios.js';

/* ===========================
   DOMINIO DE MINHA LISTA
   =========================== */

export const CHAVE_ARMAZENAMENTO_MINHA_LISTA = 'catalogo-minha-lista';

/* Monta a chave final da lista com escopo por perfil */
export function obterChaveMinhaLista(profileId = 'default') {
    const safeProfileId = String(profileId || '').trim() || 'default';
    return `${CHAVE_ARMAZENAMENTO_MINHA_LISTA}-${safeProfileId}`;
}

/* Gera identificador unico para cada obra */
export function criarIdObra(item) {
    const baseTitle = (item.title || '').trim().toLowerCase().replaceAll(' ', '-');
    const videoId = obterIdYouTube(item.youtube);
    return `${baseTitle}-${videoId}`;
}

/* Persiste e consulta a lista pessoal do usuario */
export class ArmazenamentoMinhaLista {
    constructor(storage, key = CHAVE_ARMAZENAMENTO_MINHA_LISTA) {
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

    has(workId) {
        return this.getAll().includes(workId);
    }

    toggle(workId) {
        const entries = this.getAll();
        const nextEntries = entries.includes(workId)
            ? entries.filter((entry) => entry !== workId)
            : [...entries, workId];

        this.storage.setItem(this.key, JSON.stringify(nextEntries));
        return nextEntries.includes(workId);
    }

    clear() {
        this.storage.setItem(this.key, JSON.stringify([]));
    }
}
