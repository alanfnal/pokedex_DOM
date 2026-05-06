// Constantes e Estados
const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const LIMIT = 20;
const MAX_POKEMON_ID = 1025; // Limite atual da PokeAPI
let currentOffset = 0;
let isFavoritesView = false;
let favorites = JSON.parse(localStorage.getItem('pokedex_favorites')) || [];
let currentDisplayedPokemons = []; // Guarda a lista atual para a ordenação

// Elementos do DOM
const pokemonContainer = document.getElementById('pokemonContainer');
const statusMessage = document.getElementById('statusMessage');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const sortSelect = document.getElementById('sortSelect');

// Elementos do Modal
const pokemonModal = document.getElementById('pokemonModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalDetails = document.getElementById('modalDetails');
const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');

let currentModalPokemon = null;

// === FUNÇÕES DE API ===

async function fetchPokemons(offset) {
    showLoading();
    try {
        const response = await fetch(`${API_URL}?limit=${LIMIT}&offset=${offset}`);
        if (!response.ok) throw new Error('Erro na rede');
        const data = await response.json();
        
        const detailedPokemons = await Promise.all(
            data.results.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                return res.json();
            })
        );
        
        displayPokemons(detailedPokemons);
        updatePaginationStatus(data.count);
    } catch (error) {
        showError('Erro ao carregar Pokémon. Tente novamente mais tarde.');
    }
}

async function searchPokemon(query) {
    if (!query) return loadInitialState();
    
    showLoading();
    pagination.classList.add('hidden');
    try {
        const response = await fetch(`${API_URL}/${query.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        const data = await response.json();
        displayPokemons([data]);
    } catch (error) {
        showError('Nenhum Pokémon encontrado com este nome ou ID.');
    }
}

async function fetchSurprisePokemons() {
    isFavoritesView = false;
    toggleFavoritesBtn.innerText = '⭐ Mostrar Favoritos';
    pagination.classList.add('hidden');
    showLoading();

    try {
        const randomIds = [];
        for (let i = 0; i < 12; i++) {
            randomIds.push(Math.floor(Math.random() * MAX_POKEMON_ID) + 1);
        }

        const randomPokemons = await Promise.all(
            randomIds.map(async (id) => {
                const res = await fetch(`${API_URL}/${id}`);
                return res.json();
            })
        );
        
        displayPokemons(randomPokemons);
    } catch (error) {
        showError('Erro ao buscar Pokémon surpresa.');
    }
}

// === RENDERIZAÇÃO E ORDENAÇÃO ===

function displayPokemons(pokemonList) {
    currentDisplayedPokemons = pokemonList;
    applySortingAndDisplay();
}

function applySortingAndDisplay() {
    pokemonContainer.innerHTML = '';
    hideMessages();

    if (currentDisplayedPokemons.length === 0) {
        showError('Nenhum Pokémon para exibir.');
        return;
    }

    let listToSort = [...currentDisplayedPokemons];
    const sortType = sortSelect.value;

    if (sortType === 'id-asc') {
        listToSort.sort((a, b) => a.id - b.id);
    } else if (sortType === 'id-desc') {
        listToSort.sort((a, b) => b.id - a.id);
    } else if (sortType === 'name-asc') {
        listToSort.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'name-desc') {
        listToSort.sort((a, b) => b.name.localeCompare(a.name));
    }

    listToSort.forEach(pokemon => {
        const isFav = favorites.some(fav => fav.id === pokemon.id);
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.onclick = () => openModal(pokemon);

        const typesHtml = pokemon.types.map(t => 
            `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
        ).join('');

        // Tenta pegar a imagem do Dream World primeiro. Se não existir, vai para o plano B e C.
        const imageUrl = pokemon.sprites.other?.dream_world?.front_default 
                      || pokemon.sprites.other?.['official-artwork']?.front_default 
                      || pokemon.sprites.front_default 
                      || 'https://via.placeholder.com/120';

        card.innerHTML = `
            <button class="fav-icon ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${pokemon.id}, '${pokemon.name}', '${imageUrl}', ${JSON.stringify(pokemon.types).replace(/"/g, '&quot;')})">
                ${isFav ? '★' : '☆'}
            </button>
            <div class="id">Nº ${String(pokemon.id).padStart(4, '0')}</div>
            <img src="${imageUrl}" alt="${pokemon.name}" style="height: 120px; object-fit: contain;">
            <h3>${pokemon.name}</h3>
            <div class="type-container">${typesHtml}</div>
        `;
        
        pokemonContainer.appendChild(card);
    });
}

// === FAVORITOS E LOCAL STORAGE ===

function toggleFavorite(id, name, image, types) {
    const index = favorites.findIndex(fav => fav.id === id);
    
    if (index === -1) {
        // Atualiza a estrutura fake simulando a API para garantir que o dream_world seja carregado nos favoritos
        favorites.push({ 
            id, 
            name, 
            sprites: { 
                other: { 
                    dream_world: { front_default: image }, 
                    'official-artwork': { front_default: image } 
                }, 
                front_default: image 
            }, 
            types 
        });
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('pokedex_favorites', JSON.stringify(favorites));
    
    if (isFavoritesView) {
        displayPokemons(favorites);
    } else {
        applySortingAndDisplay(); 
    }
}

function showFavoritesView() {
    isFavoritesView = !isFavoritesView;
    searchInput.value = '';
    
    if (isFavoritesView) {
        toggleFavoritesBtn.innerText = '📋 Mostrar Todos';
        pagination.classList.add('hidden');
        displayPokemons(favorites);
    } else {
        toggleFavoritesBtn.innerText = '⭐ Mostrar Favoritos';
        loadInitialState();
    }
}

// === MODAL ===

function openModal(pokemon) {
    currentModalPokemon = pokemon;
    const isFav = favorites.some(fav => fav.id === pokemon.id);
    modalFavoriteBtn.className = isFav ? 'favorite-btn active' : 'favorite-btn';

    const typesHtml = pokemon.types.map(t => 
        `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
    ).join('');

    const heightM = pokemon.height ? (pokemon.height / 10).toFixed(1) + ' m' : 'Desconhecido';
    const weightKg = pokemon.weight ? (pokemon.weight / 10).toFixed(1) + ' kg' : 'Desconhecido';
    
    // Mesma lógica de prioridade para a imagem do Modal
    const imageUrl = pokemon.sprites.other?.dream_world?.front_default 
                  || pokemon.sprites.other?.['official-artwork']?.front_default 
                  || pokemon.sprites.front_default 
                  || 'https://via.placeholder.com/120';

    modalDetails.innerHTML = `
        <img src="${imageUrl}" alt="${pokemon.name}" style="height: 200px; width: 100%; object-fit: contain;">
        <h2>${pokemon.name.toUpperCase()} (Nº ${String(pokemon.id).padStart(4, '0')})</h2>
        <div class="type-container" style="margin: 15px 0;">${typesHtml}</div>
        <p><strong>Altura:</strong> ${heightM}</p>
        <p><strong>Peso:</strong> ${weightKg}</p>
    `;
    
    pokemonModal.classList.remove('hidden');
}

closeModalBtn.onclick = () => pokemonModal.classList.add('hidden');
window.onclick = (e) => { if (e.target === pokemonModal) pokemonModal.classList.add('hidden'); }

modalFavoriteBtn.onclick = () => {
    if(!currentModalPokemon) return;
    
    const imageUrl = currentModalPokemon.sprites.other?.dream_world?.front_default 
                  || currentModalPokemon.sprites.other?.['official-artwork']?.front_default 
                  || currentModalPokemon.sprites.front_default;
                  
    toggleFavorite(
        currentModalPokemon.id, 
        currentModalPokemon.name, 
        imageUrl, 
        currentModalPokemon.types
    );
    const isFav = favorites.some(fav => fav.id === currentModalPokemon.id);
    modalFavoriteBtn.className = isFav ? 'favorite-btn active' : 'favorite-btn';
};

// === NAVEGAÇÃO E UTILITÁRIOS ===

function showLoading() {
    pokemonContainer.innerHTML = '';
    statusMessage.innerText = 'Buscando dados na PokéDex...';
    statusMessage.classList.remove('hidden');
}

function showError(msg) {
    pokemonContainer.innerHTML = '';
    statusMessage.innerText = msg;
    statusMessage.classList.remove('hidden');
}

function hideMessages() {
    statusMessage.classList.add('hidden');
}

function updatePaginationStatus(totalCount) {
    pagination.classList.remove('hidden');
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + LIMIT >= totalCount;
    pageInfo.innerText = `Página ${Math.floor(currentOffset / LIMIT) + 1}`;
}

function loadInitialState() {
    pagination.classList.remove('hidden');
    isFavoritesView = false;
    toggleFavoritesBtn.innerText = '⭐ Mostrar Favoritos';
    fetchPokemons(currentOffset);
}

// === EVENT LISTENERS ===

prevBtn.addEventListener('click', () => {
    if (currentOffset >= LIMIT) {
        currentOffset -= LIMIT;
        fetchPokemons(currentOffset);
    }
});

nextBtn.addEventListener('click', () => {
    currentOffset += LIMIT;
    fetchPokemons(currentOffset);
});

searchBtn.addEventListener('click', () => {
    isFavoritesView = false;
    toggleFavoritesBtn.innerText = '⭐ Mostrar Favoritos';
    searchPokemon(searchInput.value.trim());
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        isFavoritesView = false;
        toggleFavoritesBtn.innerText = '⭐ Mostrar Favoritos';
        searchPokemon(searchInput.value.trim());
    }
});

toggleFavoritesBtn.addEventListener('click', showFavoritesView);
surpriseBtn.addEventListener('click', fetchSurprisePokemons);
sortSelect.addEventListener('change', applySortingAndDisplay);

// Inicia a aplicação
loadInitialState();