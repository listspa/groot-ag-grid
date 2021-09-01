import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {LoadingFailed, PaginatedResponse} from '@listgroup/groot';
import {GrootAgGridSelection} from '../groot-ag-grid-selection.model';
import {NoGridDataMessage} from '../no-grid-data.model';

@Component({
  selector: 'groot-ag-grid-table-header',
  templateUrl: './groot-ag-grid-table-header.component.html',
})
export class GrootAgGridTableHeaderComponent<T> {
  @Output() quickSearch = new EventEmitter<string>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() clickedColumnSelector = new EventEmitter<void>();

  @Input() totalNumRecords: number | null = null;
  @Input() loading = false;
  @Input() showColumnSelector = true;
  @Input() selection: GrootAgGridSelection<T> | null = null;
  @Input() gridData: PaginatedResponse<T> | null | LoadingFailed | NoGridDataMessage = null;
  @Input() actions: TemplateRef<any> | null = null;
  @Input() actionsSelection: TemplateRef<any> | null = null;
  @Input() showQuickSearch = true;
  @Input() showClearSelection = true;

  quickSearchText: string;

  constructor() {
  }

  enterOnQuickSearch(): void {
    this.quickSearch.emit(this.quickSearchText);
  }

  resetQuickSearch(): void {
    this.quickSearchText = null;
    this.quickSearch.emit(null);
  }

  openColumnSelector(): void {
    this.clickedColumnSelector.next();
  }

  deSelectAll(): void {
    this.clearSelection.next();
  }
}
