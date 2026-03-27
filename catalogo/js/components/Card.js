import { getYouTubeId, getRandomMatchScore, getRandomDuration, getRandomAgeBadge } from '../utils.js';

/* ===========================
    HELPERS DE DADOS E MARKUP
    =========================== */

let cardSequence = 0;

/* Garante campos minimos para o bloco de resumo */
function getMovieInfo(item) {
    return {
        title: item.title || 'Título indisponível',
        summary: item.summary || 'Resumo indisponível no momento.',
        releaseDate: item.releaseDate || 'Data não informada',
        communityRating: item.communityRating || 'Sem nota'
    };
}

/* Cria imagem e iframe de video do card */
function createMediaElements(item, videoId) {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = 'Movie cover';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.allow = 'autoplay; encrypted-media';
    iframe.dataset.videoId = videoId;

    return { img, iframe };
}

/* Monta o conteudo textual e botoes do painel expandido */
function createDetailsElement(item, metadata, movieInfo, cardId) {
    const summaryId = `${cardId}-summary`;

    const details = document.createElement('div');
    details.className = 'card-details';
    details.innerHTML = `
        <div class="details-buttons">
            <div class="left-buttons">
                <button class="btn-icon btn-play-icon"><i class="fas fa-play" style="margin-left:2px;"></i></button>
                ${item.progress ? '<button class="btn-icon"><i class="fas fa-check"></i></button>' : '<button class="btn-icon"><i class="fas fa-plus"></i></button>'}
                <button class="btn-icon"><i class="fas fa-thumbs-up"></i></button>
            </div>
            <div class="right-buttons">
                <button class="btn-icon btn-expand-summary" type="button" aria-expanded="false" aria-controls="${summaryId}" aria-label="Abrir resumo de ${movieInfo.title}">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
        </div>
        <div class="details-info">
            <span class="match-score">${metadata.matchScore}% relevante</span>
            <span class="age-badge ${metadata.ageBadge.class}">${metadata.ageBadge.text}</span>
            <span class="duration">${metadata.duration}</span>
            <span class="resolution">HD</span>
        </div>
        <div class="details-tags">
            <span>Empolgante</span>
            <span>Animação</span>
            <span>Ficção</span>
        </div>
        <div class="movie-summary" id="${summaryId}" hidden>
            <p class="movie-summary-title">${movieInfo.title}</p>
            <p class="movie-summary-text">${movieInfo.summary}</p>
            <div class="movie-summary-meta">
                <span><strong>Lançamento:</strong> ${movieInfo.releaseDate}</span>
                <span><strong>Nota da comunidade:</strong> ${movieInfo.communityRating}</span>
            </div>
        </div>
    `;

    return details;
}

/* Vincula o botao da seta ao abre/fecha do resumo */
function bindSummaryToggle(detailsElement) {
    const toggleButton = detailsElement.querySelector('.btn-expand-summary');
    const summaryPanel = detailsElement.querySelector('.movie-summary');

    if (!toggleButton || !summaryPanel) {
        return;
    }

    toggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const shouldOpen = toggleButton.getAttribute('aria-expanded') !== 'true';
        toggleButton.setAttribute('aria-expanded', String(shouldOpen));
        toggleButton.classList.toggle('is-open', shouldOpen);
        summaryPanel.hidden = !shouldOpen;
    });
}

/* Fecha o resumo quando o card perde foco visual */
function closeSummaryIfOpen(cardElement) {
    const toggleButton = cardElement.querySelector('.btn-expand-summary');
    const summaryPanel = cardElement.querySelector('.movie-summary');

    if (!toggleButton || !summaryPanel) {
        return;
    }

    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.classList.remove('is-open');
    summaryPanel.hidden = true;
}

/* Cria barra de progresso para itens em continuidade */
function createProgressBar(progressValue) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar-container';

    const progress = document.createElement('div');
    progress.className = 'progress-value';
    progress.style.width = `${progressValue}%`;

    progressContainer.appendChild(progress);
    return progressContainer;
}

/* ===========================
    CONTROLE DE HOVER E VIDEO
    =========================== */

/* Controla animacao de hover, origem de escala e autoplay do trailer */
class CardHoverVideoController {
    constructor(card, iframe, img, videoId) {
        this.card = card;
        this.iframe = iframe;
        this.img = img;
        this.videoId = videoId;
        this.playTimeout = null;
    }

    bind() {
        this.card.addEventListener('mouseenter', () => this.onMouseEnter());
        this.card.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    onMouseEnter() {
        const rect = this.card.getBoundingClientRect();
        const viewportWidth = globalThis.innerWidth;

        if (rect.left < 100) {
            this.card.classList.add('origin-left');
        } else if (rect.right > viewportWidth - 100) {
            this.card.classList.add('origin-right');
        }

        this.playTimeout = setTimeout(() => {
            this.iframe.src = this.createEmbedUrl();
            this.iframe.classList.add('playing');
            this.img.classList.add('playing-video');
        }, 600);
    }

    onMouseLeave() {
        clearTimeout(this.playTimeout);
        this.iframe.classList.remove('playing');
        this.img.classList.remove('playing-video');
        this.iframe.src = '';
        this.card.classList.remove('origin-left', 'origin-right');
        closeSummaryIfOpen(this.card);
    }

    createEmbedUrl() {
        return `https://www.youtube.com/embed/${this.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${this.videoId}`;
    }
}

/* Gera metadados aleatorios exibidos na linha de informacoes */
function createMetadata(item, randomSource = Math.random) {
    return {
        matchScore: getRandomMatchScore(randomSource),
        duration: getRandomDuration(item.progress, randomSource),
        ageBadge: getRandomAgeBadge(randomSource)
    };
}

/* Factory principal de card */
export function createCard(item, randomSource = Math.random) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    cardSequence += 1;

    if (item.progress) {
        card.classList.add('has-progress');
    }

    const videoId = getYouTubeId(item.youtube);
    const { img, iframe } = createMediaElements(item, videoId);
    const metadata = createMetadata(item, randomSource);
    const movieInfo = getMovieInfo(item);
    const details = createDetailsElement(item, metadata, movieInfo, `movie-card-${cardSequence}`);

    card.appendChild(iframe);
    card.appendChild(img);
    card.appendChild(details);
    bindSummaryToggle(details);

    if (item.progress) {
        card.appendChild(createProgressBar(item.progress));
    }

    const hoverController = new CardHoverVideoController(card, iframe, img, videoId);
    hoverController.bind();

    return card;
}
