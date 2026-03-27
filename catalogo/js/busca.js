import { criarIdObra } from './dominio/minha-lista.js';

/* ===========================
   NORMALIZACAO E SIMILARIDADE
   =========================== */

/* Remove acentos e padroniza caixa para comparar textos */
function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/* Distancia de edicao (Levenshtein) para tolerancia a erros de digitacao */
function levenshteinDistance(a, b) {
    const left = normalizeText(a);
    const right = normalizeText(b);

    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const rows = left.length + 1;
    const cols = right.length + 1;
    const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
    for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

    for (let i = 1; i < rows; i += 1) {
        for (let j = 1; j < cols; j += 1) {
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[left.length][right.length];
}

/* Gera score de relevancia, incluindo tolerancia a erro */
function getSearchScore(query, item) {
    const normalizedQuery = normalizeText(query);
    const normalizedTitle = normalizeText(item.title);

    if (!normalizedQuery) {
        return -1;
    }

    if (normalizedTitle.includes(normalizedQuery)) {
        return 100;
    }

    const words = normalizedTitle.split(/\s+/).filter(Boolean);
    const startsWithMatch = words.some((word) => word.startsWith(normalizedQuery));
    if (startsWithMatch) {
        return 88;
    }

    const distances = words.map((word) => levenshteinDistance(normalizedQuery, word));
    distances.push(levenshteinDistance(normalizedQuery, normalizedTitle));

    const bestDistance = Math.min(...distances);
    const maxAllowedDistance = Math.max(1, Math.floor(normalizedQuery.length * 0.34));

    if (bestDistance <= maxAllowedDistance) {
        return 80 - bestDistance * 10;
    }

    return -1;
}

/* ===========================
   RENDERIZACAO DA BUSCA
   =========================== */

function renderPrompt(resultsContainer) {
    resultsContainer.innerHTML = '<div class="search-empty">Digite para buscar títulos mesmo com pequenos erros de digitação.</div>';
}

function renderNoResults(resultsContainer, query) {
    resultsContainer.innerHTML = `<div class="search-empty">Nenhuma obra encontrada para "${query}".</div>`;
}

function renderResults(resultsContainer, results, onSelectResult) {
    resultsContainer.innerHTML = '';

    results.forEach((result) => {
        const button = document.createElement('button');
        button.className = 'search-result-item';
        button.type = 'button';
        button.innerHTML = `
            <span class="search-result-title">${result.item.title}</span>
            <span class="search-result-score">Similaridade ${Math.round(result.score)}%</span>
        `;

        button.addEventListener('click', () => onSelectResult(result.item));
        resultsContainer.appendChild(button);
    });
}

/* ===========================
   API PUBLICA
   =========================== */

/* Inicializa busca por obras em qualquer pagina de catalogo */
export function inicializarBusca({
    triggerButton,
    panel,
    closeButton,
    input,
    resultsContainer,
    getSourceItems,
    onSelectResult
}) {
    if (!triggerButton || !panel || !closeButton || !input || !resultsContainer || !getSourceItems) {
        return;
    }

    const closePanel = () => {
        panel.hidden = true;
        input.value = '';
        renderPrompt(resultsContainer);
    };

    const openPanel = () => {
        panel.hidden = false;
        renderPrompt(resultsContainer);
        input.focus();
    };

    const runSearch = () => {
        const query = input.value.trim();

        if (!query) {
            renderPrompt(resultsContainer);
            return;
        }

        const sourceItems = getSourceItems();
        const scoredResults = sourceItems
            .map((item) => ({ item, score: getSearchScore(query, item) }))
            .filter((result) => result.score >= 0)
            .sort((left, right) => right.score - left.score)
            .slice(0, 8);

        if (scoredResults.length === 0) {
            renderNoResults(resultsContainer, query);
            return;
        }

        renderResults(resultsContainer, scoredResults, (item) => {
            closePanel();
            if (onSelectResult) {
                onSelectResult(item, criarIdObra(item));
            }
        });
    };

    triggerButton.addEventListener('click', openPanel);
    closeButton.addEventListener('click', closePanel);
    input.addEventListener('input', runSearch);

    panel.addEventListener('click', (event) => {
        if (event.target === panel) {
            closePanel();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            closePanel();
        }
    });
}
