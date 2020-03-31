import {Component} from '@angular/core';
import {ILoadingOverlayAngularComp} from 'ag-grid-angular';

/**
 * Components used to show a loading indicator when the grid is loading data.
 */
@Component({
  templateUrl: './groot-ag-grid-loading-overlay.component.html'
})
export class GrootAgGridLoadingOverlayComponent implements ILoadingOverlayAngularComp {
  agInit(params: any): void {
  }
}
