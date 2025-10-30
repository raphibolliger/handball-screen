import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    imports: [CommonModule],
    templateUrl: './herren.component.html',
    styleUrl: './herren.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HerrenComponent {}
