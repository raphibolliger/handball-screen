import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { Observable, map, tap, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LetDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly teams: Slide[] = [
    { image: '/assets/images/m1.jpg', title: 'Herren 1 - 1. Liga' },
    { image: '/assets/images/m3.jpg', title: 'Herren 2 - 3. Liga' },
    { image: '/assets/images/f2.jpg', title: 'Damen 1 - 2. Liga' },
    { image: '/assets/images/fu18.jpg', title: 'Juniorinnen U18' },
    { image: '/assets/images/mu17i.jpg', title: 'Junioren U17 - Inter' },
    { image: '/assets/images/mu17p.jpg', title: 'Junioren U17 - Promotion' },
    { image: '/assets/images/fu16.jpg', title: 'Juniorinnen U16' },
    { image: '/assets/images/mu15i.jpg', title: 'Junioren U15 - Inter' },
    { image: '/assets/images/mu15p.jpg', title: 'Junioren U15 - Promotion' },
    { image: '/assets/images/fu14.jpg', title: 'Juniorinnen U14' },
    { image: '/assets/images/mu13i.jpg', title: 'Junioren U13 - Inter' },
    { image: '/assets/images/mu13p.jpg', title: 'Junioren U13 - Promotion' },
  ];

  readonly sponsors: Slide[] = [
    { image: '/assets/images/hauptsponsor.jpg', title: 'Hauptsponsor' },
    {
      image: '/assets/images/sponsoren_h1.jpg',
      title: 'Sponsoren Männer 1. Liga',
    },
    {
      image: '/assets/images/sponsoren.jpg',
      title:
        'Nachwuchssponsoren / Ausrüster / Sponsor Spieltag / Special-Sponsor',
    },
    { image: '/assets/images/firmensupporter.jpg', title: 'Firmensupporter' },
    {
      image: '/assets/images/saisonmatchball.jpg',
      title: 'Saisonmatchballpatronate',
    },
  ];

  readonly current$: Observable<Slide>;

  constructor() {
    this.current$ = timer(0, 15000).pipe(
      map((i) => {
        if (i % 2 === 0) {
          return this.teams[random(this.teams.length - 1)];
        } else {
          return this.sponsors[random(this.sponsors.length - 1)];
        }
      })
    );
  }
}

function random(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

export type Slide = {
  readonly image: string;
  readonly title?: string;
};
