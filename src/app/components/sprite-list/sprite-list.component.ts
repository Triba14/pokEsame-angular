import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { Router } from '@angular/router';

interface GenGroup {
  id: number;
  name: string;
  pokemons: any[];
}

@Component({
  selector: 'app-sprite-list',
  templateUrl: './sprite-list.component.html',
  styleUrls: ['./sprite-list.component.scss'],
})
export class SpriteListComponent implements OnInit {
  generations: GenGroup[] = [];
  selectedGenId: number = 0;
  allPokemonList: any[] = [];

  genConfig = [
    { id: 1, name: 'Generation I', start: 0, end: 151 },
    { id: 2, name: 'Generation II', start: 151, end: 251 },
    { id: 3, name: 'Generation III', start: 251, end: 386 },
    { id: 4, name: 'Generation IV', start: 386, end: 493 },
    { id: 5, name: 'Generation V', start: 493, end: 649 },
    { id: 6, name: 'Generation VI', start: 649, end: 721 },
    { id: 7, name: 'Generation VII', start: 721, end: 809 },
    { id: 8, name: 'Generation VIII', start: 809, end: 905 },
    { id: 9, name: 'Generation IX', start: 905, end: 1025 },
  ];

  constructor(private pokeService: PokemonService, private router: Router) {}

  ngOnInit(): void {
    this.pokeService.getPokemonList().subscribe((response: any) => {
      const allPokemon = response.results.map((p: any, index: number) => ({
        ...p,
        id: index + 1,
      }));

      this.allPokemonList = allPokemon;

      this.generations = this.genConfig.map((config) => {
        return {
          id: config.id,
          name: config.name,
          pokemons: allPokemon.slice(config.start, config.end),
        };
      });
    });
  }

  goToPokemon(pokemonName: string) {
    this.router.navigate(['/sprites', pokemonName]);
  }

  filterGen(genId: number) {
    this.selectedGenId = genId;
  }
}
