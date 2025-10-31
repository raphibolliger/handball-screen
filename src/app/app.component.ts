import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, fromEvent, map, startWith, switchMap, timer } from 'rxjs';
import { FirmensupporterComponent } from './sponsors/components/firmensupporter/firmensupporter.component';
import { HauptsponsorComponent } from './sponsors/components/hauptsponsor/hauptsponsor.component';
import { HerrenComponent } from './sponsors/components/herren/herren.component';
import { PrivatsupporterComponent } from './sponsors/components/privatsupporter/privatsupporter.component';
import { SaisonmatchballComponent } from './sponsors/components/saisonmatchball/saisonmatchball.component';
import { SponsorenComponent } from './sponsors/components/sponsoren/sponsoren.component';

@Component({
  selector: 'app-root',
  imports: [NgComponentOutlet, AsyncPipe, NgTemplateOutlet],
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
    }),
  );

  readonly windowWidth$ = fromEvent(window, 'resize').pipe(
    debounceTime(200),
    map(() => window.innerWidth),
    startWith(window.innerWidth),
  );

  readonly demoScale$ = this.windowWidth$.pipe(
    map((width) => {
      // based on the with i want to use 75% so please calculate the scale factor from 3840px which should be fit in the 75% of the available width
      const scale = (width * 0.75) / 3840;
      const widthScale = scale * 3840;
      const heightScale = scale * 2160;
      return scale < 1 ? { scale, width: widthScale, height: heightScale } : { scale: 1, width: 3840, height: 2160 };
    }),
  );

  readonly teams: TeamSlide[] = [
    { type: 'team', image: '/assets/images/teams/m2_1.jpg', title: 'SG Wohlen Mutschellen - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/m2_2.jpg', title: 'SG Mutschellen-Wohlen - 2. Liga' },
    //{ type: 'team', image: '/assets/images/teams/m3.jpg', title: 'Handball Wohlen - 3. Liga' },

    { type: 'team', image: '/assets/images/teams/f2_1.jpg', title: 'SG Freiamt 1 - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/f2_2.jpg', title: 'SG Freiamt 2 - 2. Liga' },
    { type: 'team', image: '/assets/images/teams/f3.jpg', title: 'SG Freiamt 3 - 3. Liga' },

    { type: 'team', image: '/assets/images/teams/mu19i.jpg', title: 'SG Freiamt PLUS - MU19 Inter' },
    { type: 'team', image: '/assets/images/teams/mu19p.jpg', title: 'SG Freiamt - MU19 Promotion' },
    { type: 'team', image: '/assets/images/teams/mu17i.jpg', title: 'SG Freiamt PLUS - MU17 Inter' },
    { type: 'team', image: '/assets/images/teams/mu17p.jpg', title: 'Handball Wohlen - MU17 Promotion' },
    { type: 'team', image: '/assets/images/teams/mu15i.jpg', title: 'SG Freiamt PLUS - MU15 Inter' },
    { type: 'team', image: '/assets/images/teams/mu15p.jpg', title: 'Handball Wohlen - MU15 Promotion' },
    { type: 'team', image: '/assets/images/teams/mu13i.jpg', title: 'SG Freiamt PLUS - MU13 Inter' },
    { type: 'team', image: '/assets/images/teams/mu13p.jpg', title: 'Handball Wohlen - MU13 Promotion' },

    { type: 'team', image: '/assets/images/teams/fu18p.jpg', title: 'SG Freiamt - FU18 Promotion' },
    { type: 'team', image: '/assets/images/teams/fu16p_1.jpg', title: 'SG Freiamt 1 - FU16 Promotion' },
    { type: 'team', image: '/assets/images/teams/fu16p_2.jpg', title: 'SG Freiamt 2 - FU16 Promotion' },
    { type: 'team', image: '/assets/images/teams/fu14p_1.jpg', title: 'SG Freiamt 1 - FU14 Promotion' },
    { type: 'team', image: '/assets/images/teams/fu14p_2.jpg', title: 'SG Freiamt 2 - FU14 Promotion' },

    { type: 'team', image: '/assets/images/teams/tol.jpg', title: 'SG Freiamt together' },
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
    }),
  );

  readonly currentIndex$ = this.route.queryParamMap.pipe(
    map((params) => {
      const indexString = params.get('index');
      const index = indexString !== null ? Number(indexString) : 0;
      const totalSlides = this.teams.length + this.sponsors.length;
      return index >= 0 && index < totalSlides ? index : 0;
    }),
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
    }),
  );

  readonly current$ = this.demo$.pipe(switchMap((isDemo) => (isDemo ? this.#currentIndexSlide$ : this.#currentTimerSlide$)));

  readonly options = [...this.sponsors, ...this.teams].map((slide, index) => ({ index, title: slide.title }));

  public goto(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const index = Number(select.value);
    this.router.navigate([], { queryParams: { index }, queryParamsHandling: 'merge' });
  }

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
