import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';

const defaultParams = {
  format: '0.2',
  locale: 'en',
};

@Component({
  templateUrl: './groot-ag-grid-renderer-numbers-show-update.component.html'
})
export class GrootAgGridRendererNumbersShowUpdateComponent implements ICellRendererAngularComp {
  params: any;
  oldValue: any;
  difference: any;
  classDifference: string;
  classValue: string;
  arrow: string;
  private updateTimeout: number;

  agInit(params: any): void {
    this.params = {...defaultParams, ...params};
    this.updateTimeout = params.updateTimeout ? params.updateTimeout : 2000;
    this.oldValue = params.value;
  }

  refresh(params: any): boolean {
    this.params = {...defaultParams, ...params};
    this.difference = params.value - this.oldValue;
    this.classValue = 'ag-value-change-value ag-value-change-value-highlight';
    if (this.difference < 0) {
      this.classDifference = 'ag-value-change-delta ag-value-change-delta-down';
      this.arrow = '↓';
    } else if (this.difference > 0) {
      this.classDifference = 'ag-value-change-delta ag-value-change-delta-up';
      this.arrow = '↑';
    } else {
      this.classDifference = 'ag-value-change-delta ag-value-change-delta-up';
    }
    this.oldValue = params.value;
    setTimeout(() => {
      this.difference = null;
      this.classValue = 'ag-value-change-value';
    }, this.updateTimeout);
    return true;
  }
}
