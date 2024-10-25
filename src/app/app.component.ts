import { Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { map, mergeMap, switchMap, tap, timer } from 'rxjs';
import { HauptsponsorComponent } from './sponsors/components/hauptsponsor/hauptsponsor.component';
import { HerrenComponent } from './sponsors/components/herren/herren.component';
import { SponsorenComponent } from './sponsors/components/sponsoren/sponsoren.component';
import { FirmensupporterComponent } from './sponsors/components/firmensupporter/firmensupporter.component';
import { SaisonmatchballComponent } from './sponsors/components/saisonmatchball/saisonmatchball.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivatsupporterComponent } from './sponsors/components/privatsupporter/privatsupporter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgComponentOutlet, LetDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly demo$ = this.route.queryParamMap.pipe(
    map((params) => {
      const demo = params.get('demo');
      return demo !== null ? true : false;
    })
  );

  readonly teams: TeamSlide[] = [
    { type: 'team', image: '/assets/images/teams/m2_1.jpg', title: 'SG Wohlen Mutschellen - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/m2_2.jpg', title: 'SG Mutschellen-Wohlen - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/f2_1.jpg', title: 'SG Freiamt PLUS 1 - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/f2_2.jpg', title: 'SG Freiamt PLUS 2 - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/f3.jpg', title: 'SG Freiamt - 3. Liga' },
    { type: 'team', image: '/assets/images/teams/mu19i.jpg', title: 'Junioren U19 - Inter' },
    { type: 'team', image: '/assets/images/teams/mu19p.jpg', title: 'Junioren U19 - Promotion' },
    { type: 'team', image: '/assets/images/teams/fu18p.jpg', title: 'Juniorinnen U18' },
    { type: 'team', image: '/assets/images/teams/mu17i.jpg', title: 'Junioren U17 - Inter' },
    { type: 'team', image: '/assets/images/teams/mu17p.jpg', title: 'Junioren U17 - Promotion' },
    { type: 'team', image: '/assets/images/teams/mu15i.jpg', title: 'Junioren U15 - Inter' },
    { type: 'team', image: '/assets/images/teams/mu13i.jpg', title: 'Junioren U13 - Inter' },
  ];

  readonly sponsors: SponsorSlide[] = [
    { type: 'sponsor', component: HauptsponsorComponent, title: 'Hauptsponsor' },
    { type: 'sponsor', component: HerrenComponent, title: 'Sponsoren Männer 2. Liga' },
    { type: 'sponsor', component: SponsorenComponent, title: 'Nachwuchssponsoren / Ausrüster / Sponsor Spieltag / Special-Sponsor' },
    { type: 'sponsor', component: FirmensupporterComponent, title: 'Firmensupporter' },
    { type: 'sponsor', component: PrivatsupporterComponent, title: 'Supporter Privat' },
    { type: 'sponsor', component: SaisonmatchballComponent, title: 'Saisonmatchballpatronate' },
  ];

  readonly #currentTimerSlide$ = timer(0, 15000).pipe(
    map((i) => {
      if (i % 2 === 0 && this.teams.length > 0) {
        return this.teams[random(this.teams.length - 1)];
      } else {
        return this.sponsors[random(this.sponsors.length - 1)];
      }
    })
  );

  readonly currentIndex$ = this.route.queryParamMap.pipe(
    map((params) => {
      const indexString = params.get('index');
      const index = indexString !== null ? Number(indexString) : 0;
      const totalSlides = this.teams.length + this.sponsors.length;
      return index >= 0 && index < totalSlides ? index : 0;
    })
  );

  readonly #currentIndexSlide$ = this.currentIndex$.pipe(
    map((index) => {
      const i = Number(index);
      const totalSlides = this.teams.length + this.sponsors.length;
      if (i >= 0 && i < totalSlides) {
        // first return the sponsors slides then the teams slides
        if (i < this.sponsors.length) {
          const sponsorsSlide = this.sponsors.at(i);
          return sponsorsSlide ? sponsorsSlide : this.sponsors[0];
        } else {
          const teamSlide = this.teams.at(i - this.sponsors.length);
          return teamSlide ? teamSlide : this.teams[0];
        }
      }
      return this.teams[0];
    })
  );

  readonly current$ = this.demo$.pipe(switchMap((isDemo) => (isDemo ? this.#currentIndexSlide$ : this.#currentTimerSlide$)));

  public prev(currentIndex: number): void {
    // calculate prev index with overflow
    const prevIndex = currentIndex - 1 < 0 ? this.teams.length + this.sponsors.length - 1 : currentIndex - 1;
    this.router.navigate([], { queryParams: { index: prevIndex }, queryParamsHandling: 'merge' });
  }

  public next(currentIndex: number): void {
    // calculate next index with overflow
    const nextIndex = currentIndex + 1 >= this.teams.length + this.sponsors.length ? 0 : currentIndex + 1;
    this.router.navigate([], { queryParams: { index: nextIndex }, queryParamsHandling: 'merge' });
  }
}

function random(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

export type SponsorSlide = {
  readonly type: 'sponsor';
  readonly component: any;
  readonly title: string;
};

export type TeamSlide = {
  readonly type: 'team';
  readonly image: string;
  readonly title: string;
};
