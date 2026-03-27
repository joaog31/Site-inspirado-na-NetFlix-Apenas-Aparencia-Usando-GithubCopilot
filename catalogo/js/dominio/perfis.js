/* ===========================
   DOMINIO DE GERENCIAMENTO DE PERFIS
   =========================== */

export const CHAVE_PERFIS = 'netflix-perfis';
export const MAX_PERFIS = 6;

const PERFIS_PADRAO = [
    { name: 'João Gabriel', image: 'ativos/perfis/profile1.svg' },
    { name: 'Yara Maria', image: 'ativos/perfis/profile2.svg' },
    { name: 'Lucas Silva', image: 'ativos/perfis/profile3.svg' },
    { name: 'Ana Clara', image: 'ativos/perfis/profile4.svg' }
];

import { criarIdPerfil } from './perfil.js';

/* Gerencia a lista de perfis no localStorage */
export class ArmazenamentoPerfis {
    constructor(storage, chave = CHAVE_PERFIS) {
        this.storage = storage;
        this.chave = chave;
        this.inicializarSeNecessario();
    }

    inicializarSeNecessario() {
        if (!this.storage.getItem(this.chave)) {
            const perfisComId = PERFIS_PADRAO.map(p => ({
                ...p,
                id: criarIdPerfil(p.name)
            }));
            this.storage.setItem(this.chave, JSON.stringify(perfisComId));
        }
    }

    obterTodos() {
        try {
            const dados = this.storage.getItem(this.chave);
            return dados ? JSON.parse(dados) : [];
        } catch {
            return [];
        }
    }

    adicionar(nome, imagem) {
        const perfis = this.obterTodos();

        if (perfis.length >= MAX_PERFIS) {
            return false;
        }

        if (perfis.some(p => p.name.toLowerCase() === nome.toLowerCase())) {
            return false;
        }

        const novoPerfil = {
            name: nome.trim(),
            image: imagem,
            id: criarIdPerfil(nome)
        };

        perfis.push(novoPerfil);
        this.storage.setItem(this.chave, JSON.stringify(perfis));
        return true;
    }

    deletar(id) {
        const perfis = this.obterTodos();
        const filtrados = perfis.filter(p => p.id !== id);

        if (filtrados.length === perfis.length) {
            return false;
        }

        this.storage.setItem(this.chave, JSON.stringify(filtrados));
        return true;
    }

    podeAdicionar() {
        return this.obterTodos().length < MAX_PERFIS;
    }

    obterTotal() {
        return this.obterTodos().length;
    }
}
