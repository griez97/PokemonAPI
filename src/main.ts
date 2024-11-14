import { IPokemon, Type } from './interfaces/IPokemon';
import { IPokemonJSON, Result } from './interfaces/IPokemonJSON';
import { Generation, IPokeType, Pokemon } from './interfaces/IPokeType';
import './style.css'

const pokemonContainer = document.querySelector(".pokemon__container") as HTMLElement;
const inputNamePokemons = document.querySelector(".input__name-pokemons") as HTMLInputElement;
const btnSearch = document.querySelector(".btn__search") as HTMLElement;
const typeBtns = document.querySelectorAll(".type") as NodeListOf<HTMLButtonElement>;
const BASE_URL = "https://pokeapi.co/api/v2/";

const fetchData = async (url: string):Promise<any> => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const fetchAllData = async (url:string) => {
  const pokemonUrl = `${BASE_URL + url}`;
  const response: Response = await fetch(pokemonUrl)
  console.log(response)
  const data:IPokemonJSON = await response.json()
  const dataResults:Result[] = data.results;
  const pokemonList:IPokemon[] = await Promise.all(dataResults.map(async (pokemon:Result) => await fetchPokemonData(pokemon.name)))
  renderPokemonList(pokemonList)
}


const fetchPokemonData = async (name: string) => {
    const pokemonDataURL = `${BASE_URL + "pokemon/" +  name}`;
    const response: Response = await fetch(pokemonDataURL)

    const data: IPokemon = await response.json()

    console.log(data)
    return data
}

const renderPokemonList = (pokemonList:IPokemon[]) => {
    pokemonContainer.innerHTML = "";
    pokemonList.forEach((pokemon: IPokemon) => {
      const pokemonCard = document.createElement("div")
      pokemonCard.className = "pokemon";
      pokemonCard.innerHTML =  `
        <div class="pokemon__box">
              <img class="pokemon__img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" alt="${pokemon.name}">
            </div>
            <div class="pokemon__content">
              <span class="pokemon__id">${pokemon.id}</span>
              <span class="pokemon__name">${pokemon.name}</span>
            </div>
            <div class="type__container">
            <span class="pokemon__type">${pokemon.types[0].type.name}</span>
            <span class="pokemon__type">${pokemon.types[1]?.type.name || ""}</span>
            </div>

      </div>

      `
      pokemonCard.addEventListener("click", () => openPopup(pokemon));

      pokemonContainer.append(pokemonCard)

    })
}

const openPopup = async (pokemon: IPokemon) => {
  const popup = document.createElement("div");
  popup.className = "overlay";

  const abilityContainer = document.createElement("div");
  abilityContainer.className = "ability__container";


  await Promise.all(pokemon.abilities.map(async (ability) => {
    const effect = await fetchAbility(ability.ability.name);
    const abilityElement = document.createElement("p");
    abilityElement.textContent = effect;
    abilityContainer.appendChild(abilityElement);
  }));

  popup.innerHTML = `
    <div class="modal">
      <div class="pokemon__box">
        <img class="pokemon__img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg" alt="${pokemon.name}">
      </div>
      <div class="pokemon__content">
      </div>
    </div>
  `;

  popup.querySelector(".pokemon__content")?.appendChild(abilityContainer);
  popup.addEventListener("click", () => {
    popup.remove();
    document.documentElement.style.overflow = "";
  });
  document.body.append(popup);
  document.documentElement.style.overflow = "hidden";
};


const fetchAbility = async (name: string): Promise<string> => {
  const data = await fetchData(`${BASE_URL}ability/${name}`);
  const effectEntry = data.effect_entries.find(entry => entry.language.name === "de"); 
  return effectEntry ? effectEntry.effect : "Effect not found";
};

const fetchTypeData = async (typeLink: string) => {
    const typeUrl = typeLink;

    const response:Response = await fetch(typeUrl);
    const data = await response.json();

    const pokemonTypeList = await Promise.all(data.pokemon.slice(0,20).map(async (item:Pokemon) => await fetchPokemonData(item.pokemon.name)))

    renderPokemonList(pokemonTypeList)
}



typeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const eTargetValue = btn.textContent?.toLowerCase()
    const newTypUrl = `${BASE_URL + "type/" + eTargetValue}`
    fetchTypeData(newTypUrl)
  })
})


const searchPokemon = async () => {
    const pokemonName = inputNamePokemons.value.toLowerCase().trim();
    const pokemon: IPokemon = await fetchPokemonData(pokemonName)

    renderPokemonList([pokemon])
    inputNamePokemons.value = ""
}

btnSearch.addEventListener('click', searchPokemon)


fetchAllData("pokemon")