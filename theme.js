/* ===========================
   CONFIGURACOES E CONSTANTES
   =========================== */

/* Define os temas suportados e impede alteracoes acidentais */
const THEMES = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
});

/* Chave usada para salvar o tema no localStorage */
const STORAGE_KEY = 'netflix-theme';

/* ===========================
   CAMADA DE PERSISTENCIA
   =========================== */

/* Responsavel por ler e escrever o tema salvo no navegador */
class ThemeStorage {
    constructor(storage, key) {
        this.storage = storage; /* Objeto de armazenamento (localStorage) */
        this.key = key;         /* Chave de armazenamento */
    }

    /* Retorna o tema salvo se for valido; caso contrario, retorna null */
    getTheme() {
        const value = this.storage.getItem(this.key);
        if (value === THEMES.LIGHT || value === THEMES.DARK) {
            return value;
        }
        return null;
    }

    /* Salva o tema escolhido no armazenamento */
    setTheme(theme) {
        this.storage.setItem(this.key, theme);
    }
}

/* ===========================
   CAMADA DE APRESENTACAO (UI)
   =========================== */

/* Responsavel por atualizar o DOM conforme o tema ativo */
class ThemeView {
    constructor(bodyElement, toggleElement) {
        this.bodyElement = bodyElement;     /* Referencia ao body */
        this.toggleElement = toggleElement; /* Referencia ao botao */
    }

    /* Aplica visualmente o tema e atualiza o texto do botao */
    render(theme) {
        const isLight = theme === THEMES.LIGHT;
        const buttonLabel = isLight ? 'Modo Escuro' : 'Modo Claro';

        this.bodyElement.classList.toggle('theme-light', isLight);
        this.toggleElement.textContent = buttonLabel;
        this.toggleElement.setAttribute('aria-label', buttonLabel);
    }

    /* Descobre o tema atual com base na classe aplicada no body */
    getCurrentTheme() {
        return this.bodyElement.classList.contains('theme-light') ? THEMES.LIGHT : THEMES.DARK;
    }

    /* Registra a acao de clique no botao de alternancia */
    onToggle(callback) {
        this.toggleElement.addEventListener('click', callback);
    }
}

/* ===========================
   CAMADA DE CONTROLE
   =========================== */

/* Coordena regra de negocio entre armazenamento e interface */
class ThemeController {
    constructor(view, storage, defaultTheme = THEMES.DARK) {
        this.view = view;                 /* Camada de interface */
        this.storage = storage;           /* Camada de persistencia */
        this.defaultTheme = defaultTheme; /* Tema padrao */
    }

    /* Inicializa tema com prioridade para o valor salvo no navegador */
    init() {
        const initialTheme = this.storage.getTheme() || this.defaultTheme;
        this.view.render(initialTheme);
        this.view.onToggle(() => this.toggleTheme());
    }

    /* Alterna entre claro e escuro, atualiza UI e persiste valor */
    toggleTheme() {
        const currentTheme = this.view.getCurrentTheme();
        const nextTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;

        this.view.render(nextTheme);
        this.storage.setTheme(nextTheme);
    }
}

/* ===========================
   BOOTSTRAP DA APLICACAO
   =========================== */

/* Busca elementos necessarios na pagina */
const body = document.body;
const toggleButton = document.getElementById('theme-toggle');

/* So inicializa a funcionalidade se os elementos existirem */
if (body && toggleButton) {
    const storage = new ThemeStorage(localStorage, STORAGE_KEY);
    const view = new ThemeView(body, toggleButton);
    const controller = new ThemeController(view, storage);
    controller.init();
}
