# Site inspirado na Netflix (Apenas Aparencia)

Projeto de estudo Front-end da Alura inspirado na experiencia visual da Netflix, construido com HTML, CSS e JavaScript puro (sem framework).

## Objetivo

- Praticar desenvolvimento Front-end com arquitetura modular.
- Simular uma experiencia de navegacao com catalogo, busca e perfis.
- Evoluir organizacao de codigo com separacao por camadas (paginas, componentes, dominio e compartilhado).

## Arquitetura do projeto

O projeto segue uma arquitetura modular em JavaScript, com responsabilidades separadas:

### 1) Camada de pagina (orquestracao)

Arquivos que montam a tela, ligam eventos e inicializam os modulos:

- `catalogo/js/principal.js` (home do catalogo)
- `catalogo/js/series.js` (pagina de series)
- `catalogo/js/filmes.js` (pagina de filmes)
- `catalogo/js/minha-lista.js` (pagina minha lista)
- `js/compartilhado/selecao-perfil.js` (selecao e gerenciamento de perfis na home)

### 2) Camada de componentes (UI reutilizavel)

Componentes visuais e logica de interacao reutilizada entre paginas:

- `catalogo/js/componentes/Carrossel.js`
- `catalogo/js/componentes/Cartao.js`
- `catalogo/js/componentes/PaginaCatalogo.js` (base compartilhada para paginas de catalogo)

### 3) Camada de dominio (regras e persistencia)

Regras de negocio e acesso ao `localStorage`:

- `catalogo/js/dominio/perfil-ativo.js` (perfil atualmente selecionado)
- `catalogo/js/dominio/catalogo-perfis.js` (lista de perfis disponiveis)
- `catalogo/js/dominio/minha-lista.js` (obras da minha lista por perfil)

### 4) Camada compartilhada

Modulos globais usados em mais de uma tela:

- `js/compartilhado/tema.js` (alternancia de tema)
- `catalogo/js/busca.js` (busca no catalogo)
- `catalogo/js/perfil-menu.js` (dropdown e edicao do perfil ativo)
- `catalogo/js/dados.js` (fonte de dados das obras)
- `catalogo/js/utilitarios.js` (helpers gerais)

## Fluxo principal de navegacao

1. Usuario seleciona um perfil em `index.html`.
2. Perfil ativo e salvo no `localStorage`.
3. Paginas do catalogo leem o perfil ativo e montam a UI.
4. Modulos de dominio controlam persistencia (perfil, minha lista, catalogo de perfis).

## Organizacao de pastas

```text
ativos/
	perfis/

catalogo/
	catalogo.html
	series.html
	filmes.html
	minha-lista.html
	catalogo.css
	js/
		principal.js
		series.js
		filmes.js
		minha-lista.js
		busca.js
		perfil-menu.js
		dados.js
		utilitarios.js
		componentes/
			Carrossel.js
			Cartao.js
			PaginaCatalogo.js
		dominio/
			perfil-ativo.js
			catalogo-perfis.js
			minha-lista.js

js/
	compartilhado/
		tema.js
		selecao-perfil.js

index.html
style.css
README.md
```

## Convencoes usadas

- Comentarios em todos os modulos para contextualizar responsabilidade.
- Separacao por responsabilidade (paginas, componentes, dominio).
- Importacoes explicitas entre modulos ES.
- Nomes de arquivos orientados ao papel de cada modulo.

## Observacao

Este projeto e apenas para estudo e nao possui vinculacao oficial com a Netflix.
