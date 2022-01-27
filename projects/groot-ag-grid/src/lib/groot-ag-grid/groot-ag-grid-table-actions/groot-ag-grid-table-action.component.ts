import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'groot-ag-grid-table-action',
  templateUrl: './groot-ag-grid-table-action.component.html',
})
export class GrootAgGridTableActionComponent {
  @Output() actionTriggered = new EventEmitter<void>();

  @Input() label!: string;
  @Input() labelArgs: any | null | undefined = null;
  @Input() disabled = false;

  click(): void {
    if (!this.disabled) {
      this.actionTriggered.emit();
    }
  }
}
