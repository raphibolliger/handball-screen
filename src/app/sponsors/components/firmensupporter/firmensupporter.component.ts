import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    imports: [CommonModule],
    templateUrl: './firmensupporter.component.html',
    styleUrl: './firmensupporter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirmensupporterComponent {}
