import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {normalizeNgBootstrapDateFormat} from '@listgroup/groot';

@Component({
  templateUrl: './groot-ag-grid-renderer-date.component.html'
})
export class GrootAgGridRendererDatesComponent implements ICellRendererAngularComp {
  params: any;
  dateFormat: string;

  constructor(bsDatepickerConfig: BsDatepickerConfig) {
    this.dateFormat = normalizeNgBootstrapDateFormat(bsDatepickerConfig.dateInputFormat);
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
}
