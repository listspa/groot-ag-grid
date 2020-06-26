import {Component} from '@angular/core';
import {INoRowsOverlayAngularComp} from 'ag-grid-angular';

export interface GrootAgGridNoRowsParams {
  loadingError: boolean;
  message?: string;
  style?: 'info' | 'warning' | 'danger';
}

/**
 * Components used to show two cases:
 * - no rows found
 * - loading error
 *
 * We abuse the system in this way since ag-grid doesn't seem to have a special handling for the case
 * of "errors while loading".
 */
@Component({
  templateUrl: './groot-ag-grid-no-rows-overlay.component.html'
})
export class GrootAgGridNoRowsOverlayComponent implements INoRowsOverlayAngularComp {
  params: GrootAgGridNoRowsParams;

  agInit(params: GrootAgGridNoRowsParams): void {
    this.params = params;
  }
}
