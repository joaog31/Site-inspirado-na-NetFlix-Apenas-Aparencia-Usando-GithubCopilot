import { createCard } from './Card.js';

/* ===========================
    HELPERS DE ESTRUTURA
    =========================== */

/* Cria cabecalho com titulo da categoria */
function createHeader(titleText) {
    const header = document.createElement('div');
    header.className = 'slider-header';

    const title = document.createElement('h2');
    title.className = 'slider-title';
    title.innerText = titleText;

    const indicators = document.createElement('div');
    indicators.className = 'slider-indicators';

    header.appendChild(title);
    header.appendChild(indicators);

    return header;
}

/* Cria linha horizontal de cards da categoria */
function createRow(items, cardFactory) {
    const row = document.createElement('div');
    row.className = 'movie-row';

    items.forEach((item) => {
        row.appendChild(cardFactory(item));
    });

    return row;
}

/* Factory principal de carrossel */
export function createCarousel(category, cardFactory = createCard) {
    const section = document.createElement('div');
    section.className = 'slider-section';

    section.appendChild(createHeader(category.title));
    section.appendChild(createRow(category.items, cardFactory));

    return section;
}
