import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saisonmatchball.component.html',
  styleUrl: './saisonmatchball.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaisonmatchballComponent {}
