import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    imports: [CommonModule],
    templateUrl: './saisonmatchball.component.html',
    styleUrl: './saisonmatchball.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaisonmatchballComponent {}
