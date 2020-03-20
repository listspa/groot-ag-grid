import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';

const defaultParams = {
  format: '0.2',
  locale: 'en',
}

@Component({
  templateUrl: './groot-ag-grid-renderer-numbers.component.html'
})
export class GrootAgGridRendererNumbersComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = {...defaultParams, ...params};
  }

  refresh(params: any): boolean {
    this.params = {...defaultParams, ...params};
    return true;
  }
}
