import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
import {normalizeNgBootstrapDateFormat} from '@listgroup/groot';
import {ICellRendererParams} from "ag-grid-community";

interface RendererDatesParams extends ICellRendererParams {
  timestamp?: boolean;
  showMilliseconds?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  millisecondsFormat?: string;
}

@Component({
  templateUrl: './groot-ag-grid-renderer-date.component.html'
})
export class GrootAgGridRendererDatesComponent implements ICellRendererAngularComp {
  params: RendererDatesParams;
  dateFormat: string;
  timeFormat: string;
  millisecondsFormat: string;

  constructor(bsDatepickerConfig: BsDatepickerConfig) {
    this.dateFormat = normalizeNgBootstrapDateFormat(bsDatepickerConfig.dateInputFormat);
  }

  agInit(params: RendererDatesParams): void {
    this.params = params;
    this.dateFormat = this.params?.dateFormat ?? this.dateFormat;
    this.timeFormat = this.params?.timeFormat ?? 'HH:mm:ss';
    this.millisecondsFormat = this.params?.millisecondsFormat ?? '.SSS';
  }

  refresh(params: RendererDatesParams): boolean {
    this.agInit(params);
    return true;
  }
}
