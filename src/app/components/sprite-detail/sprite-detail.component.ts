import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';

interface SpriteVariant {
  label: string;
  url: string | null;
}

interface GameRow {
  game: string;
  normalSprites: SpriteVariant[];
  shinySprites: SpriteVariant[];
  backSprites?: SpriteVariant[];
  backShinySprites?: SpriteVariant[];
}

interface GenerationData {
  title: string;
  hasBack: boolean;
  hasShiny: boolean;
  games: GameRow[];
}

@Component({
  selector: 'app-sprite-detail',
  templateUrl: './sprite-detail.component.html',
  styleUrls: ['./sprite-detail.component.scss'],
})
export class SpriteDetailComponent implements OnInit {
  pokemonName: string = '';
  pokemonId: number = 0;
  loading: boolean = true;

  overviewColumns: string[] = [
    'type',
    'gen1',
    'gen2',
    'gen3',
    'gen4',
    'gen5',
    'gen6',
    'gen7',
    'gen8',
    'gen9',
  ];
  overviewData: any[] = [];
  generations: GenerationData[] = [];

  private varieties: any[] = [];
  private mainSprites: any = null;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.pokemonName = params['name'];
      this.loadPokemonSprites();
    });
  }

  loadPokemonSprites(): void {
    this.loading = true;
    this.pokemonService.getPokemonByName(this.pokemonName).subscribe({
      next: (data) => {
        this.pokemonId = data.id;
        this.mainSprites = data.sprites;

        this.pokemonService.getPokemonSpecies(this.pokemonName).subscribe({
          next: (speciesData) => {
            this.varieties = speciesData.varieties || [];
            this.loadAllVarieties();
          },
          error: () => {
            this.processAllSprites([]);
          },
        });
      },
      error: (err) => {
        console.error('Error loading pokemon:', err);
        this.loading = false;
      },
    });
  }

  loadAllVarieties(): void {
    const specialForms = this.varieties.filter((v: any) => !v.is_default);

    if (specialForms.length === 0) {
      this.processAllSprites([]);
      return;
    }

    const varietySprites: any[] = [];
    let loadedCount = 0;

    specialForms.forEach((variety: any) => {
      const pokemonName = variety.pokemon.name;
      this.pokemonService.getPokemonByName(pokemonName).subscribe({
        next: (data) => {
          varietySprites.push({
            name: pokemonName,
            formName: this.formatFormName(pokemonName),
            sprites: data.sprites,
          });
          loadedCount++;
          if (loadedCount === specialForms.length) {
            this.processAllSprites(varietySprites);
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === specialForms.length) {
            this.processAllSprites(varietySprites);
          }
        },
      });
    });
  }
  formatFormName(fullName: string): string {
    let formName = fullName.replace(this.pokemonName + '-', '');
    formName = formName.charAt(0).toUpperCase() + formName.slice(1);

    if (formName === 'Gmax') return 'Gigantamax';
    if (formName === 'Mega') return 'Mega ' + this.capitalize(this.pokemonName);
    if (formName === 'Mega-x')
      return 'Mega ' + this.capitalize(this.pokemonName) + ' X';
    if (formName === 'Mega-y')
      return 'Mega ' + this.capitalize(this.pokemonName) + ' Y';

    return formName;
  }

  processAllSprites(varietySprites: any[]): void {
    const sprites = this.mainSprites;
    const v = sprites.versions;

    this.overviewData = [
      {
        type: 'Normal',
        gen1: v?.['generation-i']?.['red-blue']?.front_default,
        gen2: v?.['generation-ii']?.['silver']?.front_default,
        gen3: v?.['generation-iii']?.['ruby-sapphire']?.front_default,
        gen4: v?.['generation-iv']?.['diamond-pearl']?.front_default,
        gen5: v?.['generation-v']?.['black-white']?.front_default,
        gen6: v?.['generation-vi']?.['x-y']?.front_default,
        gen7:
          v?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_default ||
          v?.['generation-vii']?.['icons']?.front_default,
        gen8: sprites.other?.home?.front_default || sprites.front_default,
        gen9: v?.['generation-ix']?.['scarlet-violet']?.front_default,
      },
      {
        type: 'Shiny',
        gen1: null,
        gen2: v?.['generation-ii']?.['silver']?.front_shiny,
        gen3: v?.['generation-iii']?.['ruby-sapphire']?.front_shiny,
        gen4: v?.['generation-iv']?.['diamond-pearl']?.front_shiny,
        gen5: v?.['generation-v']?.['black-white']?.front_shiny,
        gen6: v?.['generation-vi']?.['x-y']?.front_shiny,
        gen7:
          v?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_shiny || null,
        gen8: sprites.other?.home?.front_shiny || sprites.front_shiny,
        gen9: v?.['generation-ix']?.['scarlet-violet']?.front_shiny || null,
      },
    ];

    this.generations = [];

    const sv = v?.['generation-ix']?.['scarlet-violet'];
    if (sv?.front_default) {
      this.generations.push({
        title: 'Generation 9',
        hasBack: false,
        hasShiny: true,
        games: [
          {
            game: 'Scarlet Violet',
            normalSprites: this.getGenderVariants(sv, 'front'),
            shinySprites: this.getGenderVariants(sv, 'front_shiny'),
          },
        ],
      });
    }

    const gen8Games: GameRow[] = [];
    const home = sprites.other?.home;
    if (home?.front_default) {
      gen8Games.push({
        game: 'Home',
        normalSprites: this.getGenderVariants(home, 'front').concat(
          this.getVarietyVariants(varietySprites, 'other.home', 'front')
        ),
        shinySprites: this.getGenderVariants(home, 'front_shiny').concat(
          this.getVarietyVariants(varietySprites, 'other.home', 'front_shiny')
        ),
      });
    }

    const bdsp = v?.['generation-viii']?.['brilliant-diamond-shining-pearl'];
    if (bdsp?.front_default) {
      gen8Games.push({
        game: 'Brilliant Diamond Shining Pearl',
        normalSprites: this.getGenderVariants(bdsp, 'front'),
        shinySprites: this.getGenderVariants(bdsp, 'front_shiny'),
      });
    }

    if (sprites.front_default) {
      gen8Games.push({
        game: 'Sword Shield',
        normalSprites: this.getGenderVariants(sprites, 'front').concat(
          this.getVarietyVariants(varietySprites, '', 'front', 'Gigantamax')
        ),
        shinySprites: this.getGenderVariants(sprites, 'front_shiny').concat(
          this.getVarietyVariants(
            varietySprites,
            '',
            'front_shiny',
            'Gigantamax'
          )
        ),
      });
    }

    if (gen8Games.length) {
      this.generations.push({
        title: 'Generation 8',
        hasBack: false,
        hasShiny: true,
        games: gen8Games,
      });
    }

    const gen7Games: GameRow[] = [];
    const usum = v?.['generation-vii']?.['ultra-sun-ultra-moon'];
    if (usum?.front_default) {
      gen7Games.push({
        game: 'Ultra Sun Ultra Moon',
        normalSprites: this.getGenderVariants(usum, 'front'),
        shinySprites: this.getGenderVariants(usum, 'front_shiny'),
      });
    }

    const lgpe = v?.['generation-vii']?.['icons'];
    if (lgpe?.front_default) {
      gen7Games.push({
        game: "Let's Go Pikachu Let's Go Eevee",
        normalSprites: [{ label: '', url: lgpe.front_default }],
        shinySprites: lgpe.front_shiny
          ? [{ label: '', url: lgpe.front_shiny }]
          : [],
      });
    }

    if (gen7Games.length) {
      this.generations.push({
        title: 'Generation 7',
        hasBack: false,
        hasShiny: true,
        games: gen7Games,
      });
    }

    const gen6Games: GameRow[] = [];
    if (home?.front_default) {
      gen6Games.push({
        game: 'Bank',
        normalSprites: this.getGenderVariants(home, 'front').concat(
          this.getVarietyVariants(varietySprites, 'other.home', 'front', 'Mega')
        ),
        shinySprites: this.getGenderVariants(home, 'front_shiny').concat(
          this.getVarietyVariants(
            varietySprites,
            'other.home',
            'front_shiny',
            'Mega'
          )
        ),
      });
    }

    const showdown = sprites.other?.showdown;
    if (showdown?.front_default) {
      gen6Games.push({
        game: 'GO',
        normalSprites: this.getGenderVariants(showdown, 'front').concat(
          this.getVarietyVariants(
            varietySprites,
            'other.showdown',
            'front',
            'Mega'
          )
        ),
        shinySprites: this.getGenderVariants(showdown, 'front_shiny').concat(
          this.getVarietyVariants(
            varietySprites,
            'other.showdown',
            'front_shiny',
            'Mega'
          )
        ),
      });
    }

    const oras = v?.['generation-vi']?.['omegaruby-alphasapphire'];
    if (oras?.front_default) {
      gen6Games.push({
        game: 'Omega Ruby Alpha Sapphire',
        normalSprites: this.getGenderVariants(oras, 'front').concat(
          this.getVarietyVariants(
            varietySprites,
            'versions.generation-vi.omegaruby-alphasapphire',
            'front',
            'Mega'
          )
        ),
        shinySprites: this.getGenderVariants(oras, 'front_shiny').concat(
          this.getVarietyVariants(
            varietySprites,
            'versions.generation-vi.omegaruby-alphasapphire',
            'front_shiny',
            'Mega'
          )
        ),
      });
    }

    const xy = v?.['generation-vi']?.['x-y'];
    if (xy?.front_default) {
      gen6Games.push({
        game: 'X Y',
        normalSprites: this.getGenderVariants(xy, 'front').concat(
          this.getVarietyVariants(
            varietySprites,
            'versions.generation-vi.x-y',
            'front',
            'Mega'
          )
        ),
        shinySprites: this.getGenderVariants(xy, 'front_shiny').concat(
          this.getVarietyVariants(
            varietySprites,
            'versions.generation-vi.x-y',
            'front_shiny',
            'Mega'
          )
        ),
      });
    }

    if (gen6Games.length) {
      this.generations.push({
        title: 'Generation 6',
        hasBack: false,
        hasShiny: true,
        games: gen6Games,
      });
    }

    const bw = v?.['generation-v']?.['black-white'];
    if (bw?.front_default) {
      const g5Games: GameRow[] = [
        {
          game: 'Black White',
          normalSprites: this.getGenderVariants(bw, 'front'),
          shinySprites: this.getGenderVariants(bw, 'front_shiny'),
          backSprites: this.getGenderVariants(bw, 'back'),
          backShinySprites: this.getGenderVariants(bw, 'back_shiny'),
        },
      ];

      if (bw.animated?.front_default) {
        g5Games.push({
          game: 'Black 2 White 2 Black White Animated',
          normalSprites: this.getGenderVariants(bw.animated, 'front'),
          shinySprites: this.getGenderVariants(bw.animated, 'front_shiny'),
          backSprites: this.getGenderVariants(bw.animated, 'back'),
          backShinySprites: this.getGenderVariants(bw.animated, 'back_shiny'),
        });
      }
      this.generations.push({
        title: 'Generation 5',
        hasBack: true,
        hasShiny: true,
        games: g5Games,
      });
    }

    const gen4 = v?.['generation-iv'];
    if (gen4) {
      const g4Games: GameRow[] = [];
      ['heartgold-soulsilver', 'platinum', 'diamond-pearl'].forEach((g) => {
        const game = gen4[g];
        if (game?.front_default) {
          g4Games.push({
            game: g
              .split('-')
              .map((x) => this.capitalize(x))
              .join(' '),
            normalSprites: this.getGenderVariants(game, 'front'),
            shinySprites: this.getGenderVariants(game, 'front_shiny'),
            backSprites: this.getGenderVariants(game, 'back'),
            backShinySprites: this.getGenderVariants(game, 'back_shiny'),
          });
        }
      });
      if (g4Games.length) {
        this.generations.push({
          title: 'Generation 4',
          hasBack: true,
          hasShiny: true,
          games: g4Games,
        });
      }
    }

    const gen3Games: GameRow[] = [];
    const gen3 = v?.['generation-iii'];
    ['emerald', 'firered-leafgreen', 'ruby-sapphire'].forEach((g) => {
      const game = gen3?.[g];
      if (game?.front_default) {
        const backDefault =
          game.back_default || gen3?.['ruby-sapphire']?.back_default;
        const backShiny =
          game.back_shiny || gen3?.['ruby-sapphire']?.back_shiny;

        gen3Games.push({
          game: g
            .split('-')
            .map((x) => this.capitalize(x))
            .join(' '),
          normalSprites: [{ label: '', url: game.front_default }],
          shinySprites: [{ label: '', url: game.front_shiny }],
          backSprites: backDefault ? [{ label: '', url: backDefault }] : [],
          backShinySprites: backShiny ? [{ label: '', url: backShiny }] : [],
        });
      }
    });
    if (gen3Games.length)
      this.generations.push({
        title: 'Generation 3',
        hasBack: true,
        hasShiny: true,
        games: gen3Games,
      });

    const gen2Games: GameRow[] = [];
    ['crystal', 'gold', 'silver'].forEach((g) => {
      const game = v?.['generation-ii']?.[g];
      if (game?.front_default) {
        gen2Games.push({
          game: this.capitalize(g),
          normalSprites: [{ label: '', url: game.front_default }],
          shinySprites: [{ label: '', url: game.front_shiny }],
          backSprites: [{ label: '', url: game.back_default }],
          backShinySprites: [{ label: '', url: game.back_shiny }],
        });
      }
    });
    if (gen2Games.length)
      this.generations.push({
        title: 'Generation 2',
        hasBack: true,
        hasShiny: true,
        games: gen2Games,
      });

    const gen1Games: GameRow[] = [];
    ['yellow', 'red-blue'].forEach((g) => {
      const game = v?.['generation-i']?.[g];
      if (game?.front_default || game?.front_gray) {
        const n: SpriteVariant[] = [];
        const b: SpriteVariant[] = [];
        if (game.front_gray) n.push({ label: '', url: game.front_gray });
        if (game.front_default)
          n.push({ label: 'Colorized', url: game.front_default });
        if (game.back_gray) b.push({ label: '', url: game.back_gray });
        if (game.back_default)
          b.push({ label: 'Colorized', url: game.back_default });
        gen1Games.push({
          game: g
            .split('-')
            .map((x) => this.capitalize(x))
            .join(' '),
          normalSprites: n,
          shinySprites: [],
          backSprites: b,
          backShinySprites: [],
        });
      }
    });
    if (gen1Games.length)
      this.generations.push({
        title: 'Generation 1',
        hasBack: true,
        hasShiny: false,
        games: gen1Games,
      });

    this.loading = false;
  }

  private getGenderVariants(gameData: any, type: string): SpriteVariant[] {
    const variants: SpriteVariant[] = [];
    if (!gameData) return variants;

    const femaleKey = `${type}_female`;
    const defaultKey = type.includes('shiny') ? type : `${type}_default`;

    if (gameData[defaultKey]) {
      const label = gameData[femaleKey] ? 'Male' : '';
      variants.push({ label: label, url: gameData[defaultKey] });
    }
    if (gameData[femaleKey]) {
      variants.push({ label: 'Female', url: gameData[femaleKey] });
    }
    return variants;
  }

  private getVarietyVariants(
    varietySprites: any[],
    path: string,
    type: string,
    filter: string = ''
  ): SpriteVariant[] {
    const variants: SpriteVariant[] = [];
    const defaultKey = type.includes('shiny') ? type : `${type}_default`;

    varietySprites.forEach((vs) => {
      if (filter && !vs.formName.includes(filter)) return;
      let spriteObj = vs.sprites;
      if (path) {
        path.split('.').forEach((p) => {
          spriteObj = spriteObj?.[p];
        });
      }
      if (spriteObj?.[defaultKey]) {
        variants.push({ label: vs.formName, url: spriteObj[defaultKey] });
      }
    });
    return variants;
  }

  hasSprites(sprites: SpriteVariant[] | undefined): boolean {
    return !!sprites && sprites.length > 0 && sprites.some((s) => s.url);
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatId(id: number): string {
    return '#' + id.toString().padStart(4, '0');
  }
}
