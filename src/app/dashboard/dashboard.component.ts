import { Component, OnInit } from '@angular/core';
import { Hero } from '../../services/hero/schema';
import { HeroService } from '../../services/hero/hero.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})

export class DashboardComponent implements OnInit {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    const numOfTop = 4;
    this.heroService.getHeroes() // Obtain the first number of top heros or what we have from the list
      .subscribe(heroes => this.heroes = heroes.length >= numOfTop? heroes.slice(0, numOfTop) : heroes);
  }
}
