import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firmensupporter.component.html',
  styleUrl: './firmensupporter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirmensupporterComponent {}
