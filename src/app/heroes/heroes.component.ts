import { Component, OnInit } from '@angular/core';
import { Hero } from '../../services/hero/schema';
import { HeroService } from '../../services/hero/hero.service';

//@Component is a decorator function that specifies the Angular metadata for the component.
@Component({
  selector: 'app-heroes',                  // the component's CSS element selector
  templateUrl: './heroes.component.html',  // the location of the component's template file.
  styleUrls: ['./heroes.component.css']    // the location of the component's private CSS styles.
})
export class HeroesComponent implements OnInit {
  heroes: Hero[];
  
  // The parameter simultaneously defines a private heroService property and identifies it as a HeroService injection site.
  constructor(private heroService: HeroService) { }

  ngOnInit(): void {  // lifecycle hook
    this.getHeroes();  // load data
  }

  getHeroes(): void {
    this.heroService.getHeroes()
    .subscribe(heroes => this.heroes = heroes);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { 
      return; 
    }

    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        this.heroes.push(hero);   // add to the cached list
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);   // remove from the cached list
    this.heroService.deleteHero(hero).subscribe();
  }
}
