import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  private cache = new Map<string, any>();

  constructor(private http: HttpClient) {}

  getPokemonList(limit: number = 1025): Observable<any> {
    const cacheKey = `list-${limit}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    return this.http.get(`${this.baseUrl}/pokemon?limit=${limit}`).pipe(
      tap((data: any) => {
        this.cache.set(cacheKey, data);
      })
    );
  }

  getPokemonByName(name: string): Observable<any> {
    const cacheKey = `pokemon-${name}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    return this.http.get(`${this.baseUrl}/pokemon/${name}`).pipe(
      tap((data: any) => {
        this.cache.set(cacheKey, data);
      })
    );
  }

  getPokemonSpecies(name: string): Observable<any> {
    const cacheKey = `species-${name}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    return this.http.get(`${this.baseUrl}/pokemon-species/${name}`).pipe(
      tap((data: any) => {
        this.cache.set(cacheKey, data);
      })
    );
  }
}
