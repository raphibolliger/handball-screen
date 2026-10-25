import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SponsorEntry, SponsorLogo } from '../../../slide.model';

const SLIDE_ASPECT_RATIO = 16 / 9;
const SPONSOR_AREA_HEIGHT_SHARE = 0.85;
const TYPICAL_LOGO_ASPECT_RATIO = 2;

@Component({
  selector: 'app-sponsor-grid',
  templateUrl: './sponsor-grid.component.html',
  styleUrl: './sponsor-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--columns]': 'grid().columns',
    '[style.--rows]': 'grid().rows',
  },
})
export class SponsorGridComponent {
  readonly entries = input.required<readonly SponsorEntry[]>();

  readonly grid = computed(() => gridWithLargestLogos(this.entries().length));

  isLogo(entry: SponsorEntry): entry is SponsorLogo {
    return 'logo' in entry;
  }
}

type Grid = {
  readonly columns: number;
  readonly rows: number;
};

function gridWithLargestLogos(entryCount: number): Grid {
  const columnOptions = Array.from({ length: Math.max(entryCount, 1) }, (_, index) => index + 1);
  const grids = columnOptions.map((columns) => ({ columns, rows: Math.ceil(entryCount / columns) }));
  return grids.reduce((best, grid) => (logoWidth(grid) > logoWidth(best) ? grid : best));
}

function logoWidth({ columns, rows }: Grid): number {
  const cellWidth = SLIDE_ASPECT_RATIO / columns;
  const cellHeight = SPONSOR_AREA_HEIGHT_SHARE / rows;
  return Math.min(cellWidth, cellHeight * TYPICAL_LOGO_ASPECT_RATIO);
}
