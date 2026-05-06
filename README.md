# 🌟 Pokédex Web - Vanilla JS

Bem-vindo(a) à minha implementação da Pokédex! Este projeto foi desenvolvido com foco total nos fundamentos da web: **HTML, CSS e JavaScript puro**, sem a muleta de frameworks ou bibliotecas externas. 

A ideia central foi colocar a mão na massa com manipulação do DOM, consumo assíncrono de APIs e gerenciamento de estado no lado do cliente (Client-Side Storage).

## 🎯 Objetivo e Requisitos da Atividade

Este projeto foi construído para atender (e expandir) os seguintes critérios de avaliação:

- [x] **Listagem Inicial:** Consumo do endpoint `?limit=20&offset=0` da [PokeAPI](https://pokeapi.co/) assim que a página é carregada.
- [x] **Navegação (Paginação):** Botões funcionais de "Próxima" e "Anterior" para navegar pelo catálogo.
- [x] **Busca Dinâmica:** Campo de pesquisa integrado para encontrar Pokémon específicos pelo nome ou ID.
- [x] **Visualização de Detalhes:** Um Modal interativo que exibe a Imagem (priorizando as artes do *Dream World*), Nome, ID, Tipos, Altura e Peso.
- [x] **Sistema de Favoritos:** Funcionalidade de favoritar Pokémon com persistência de dados usando o `localStorage` do navegador.
- [x] **Filtro de Exibição:** Um botão dedicado para alternar entre a visão geral e a lista apenas de favoritos.
- [x] **Feedback Visual:** Implementação de estados de UI como "Carregando...", "Erro" ou "Nenhum resultado", respeitando a experiência do usuário.
- [x] **Responsividade:** Layout construído com CSS Grid e Flexbox, garantindo que a aplicação seja bonita e usável tanto em monitores ultrawide quanto em telas de celulares.

### ✨ Funcionalidades Extras (Bônus)
Para ir além do básico, implementei algumas funcionalidades adicionais que enriquecem a experiência:
* **Botão "Surpreenda-me":** Gera uma equipe aleatória de 12 Pokémon buscando IDs sortidos na API através de requisições simultâneas (`Promise.all`).
* **Filtros de Ordenação:** Permite organizar os Pokémon em tela por Ordem Alfabética (A-Z / Z-A) e Numérica (Crescente/Decrescente).

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estruturação semântica.
* **CSS3:** Variáveis nativas (`:root`), Grid Layout para os cards, Flexbox para alinhamentos e manipulação de estado (`.hidden`).
* **JavaScript (ES6+):** Lógica de programação, manipulação direta do DOM, `async/await` e `fetch API` para consumo de dados.

## 🧠 Aprendizados e Decisões Arquiteturais

Construir essa aplicação me permitiu reforçar conceitos essenciais:
1. **Tratamento de Promessas:** Lidar com a PokeAPI exige fazer um `fetch` inicial para pegar a lista, e depois uma série de requisições secundárias para pegar os detalhes de cada Pokémon. O uso do `Promise.all` foi essencial para carregar tudo em paralelo e não travar a tela.
2. **Separação de Responsabilidades:** O código JS foi dividido logicamente em blocos de "Chamadas de API", "Renderização", "Favoritos/Storage" e "Event Listeners" para manter o projeto limpo e manutenível.
3. **UX (Experiência do Usuário):** A inclusão de mensagens de carregamento e o tratamento de imagens pixeladas (`image-rendering: pixelated`) para o ícone mostram um cuidado extra com o produto final.

## 🚀 Como executar o projeto

1. Faça o clone deste repositório ou baixe os arquivos.
2. Certifique-se de que todos os arquivos (`index.html`, `style.css`, `script.js` e `pokeball.png`) estão na mesma pasta.
3. Abra o arquivo `index.html` em qualquer navegador moderno. 
   * *Dica: Se estiver usando o VS Code, a extensão **Live Server** é uma ótima opção para rodar o projeto localmente.*

---
Desenvolvido com ☕ e dedicação por **Alan Costa**.
