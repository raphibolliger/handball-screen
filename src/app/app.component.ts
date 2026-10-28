import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, fromEvent, map, startWith, switchMap, timer } from 'rxjs';
import { ShuffledDeck } from './shuffled-deck';
import { sponsorSlides, teamSlides } from './slides';
import { SponsorGridComponent } from './sponsors/components/sponsor-grid/sponsor-grid.component';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, NgTemplateOutlet, SponsorGridComponent],
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

  readonly teams = teamSlides;

  readonly sponsors = sponsorSlides;

  readonly #teamDeck = new ShuffledDeck(this.teams);

  readonly #sponsorDeck = new ShuffledDeck(this.sponsors);

  readonly #currentTimerSlide$ = timer(0, 15000).pipe(
    map((i) => {
      if (i % 2 === 0 && this.teams.length > 0) {
        return this.#teamDeck.draw();
      } else {
        return this.#sponsorDeck.draw();
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
