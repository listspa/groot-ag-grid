import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';

const defaultParams = {
  format: '0.2',
  locale: 'en',
};

@Component({
  templateUrl: './groot-ag-grid-renderer-numbers.component.html'
})
export class GrootAgGridRendererNumbersComponent implements ICellRendererAngularComp {
  params: any;
  oldValue: any;
  difference: any;
  classDifference: string;
  classValue: string;
  arrow: string;
  private updateTimeout: number;
  private showDelta: boolean;

  agInit(params: any): void {
    this.params = {...defaultParams, ...params};
    this.showDelta = params.showDelta ? params.showDelta : false;
    this.updateTimeout = params.updateTimeout ? params.updateTimeout : 2000;
    this.oldValue = params.value;
  }

  refresh(params: any): boolean {
    this.params = {...defaultParams, ...params};
    this.classValue = 'ag-value-change-value ag-value-change-value-highlight';
    if (this.showDelta) {
      this.difference = params.value - this.oldValue;
      if (this.difference < 0) {
        this.classDifference = 'ag-value-change-delta ag-value-change-delta-down';
        this.arrow = '↓';
      } else if (this.difference > 0) {
        this.classDifference = 'ag-value-change-delta ag-value-change-delta-up';
        this.arrow = '↑';
      }
      this.oldValue = params.value;
    }
    setTimeout(() => {
      this.difference = null;
      this.classValue = 'ag-value-change-value';
    }, this.updateTimeout);
    return true;
  }
}
