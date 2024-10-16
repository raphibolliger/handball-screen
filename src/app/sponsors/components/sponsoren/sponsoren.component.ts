import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sponsoren.component.html',
  styleUrl: './sponsoren.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsorenComponent {}
