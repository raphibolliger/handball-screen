import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './herren.component.html',
  styleUrl: './herren.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HerrenComponent {}
