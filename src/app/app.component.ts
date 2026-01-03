import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PokemonService } from './services/pokemon.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'pokEsame-angular';
  searchControl = new FormControl('');
  allPokemonList: any[] = [];
  filteredOptions: Observable<any[]> | undefined;

  constructor(private pokeService: PokemonService, private router: Router) {}

  ngOnInit() {
    this.pokeService.getPokemonList(1025).subscribe((response: any) => {
      this.allPokemonList = response.results.map((p: any, index: number) => ({
        ...p,
        id: index + 1,
      }));

      this.filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );
    });
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allPokemonList.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  goToPokemon(pokemonName: string) {
    this.router.navigate(['/sprites', pokemonName]);
    this.searchControl.setValue('');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
