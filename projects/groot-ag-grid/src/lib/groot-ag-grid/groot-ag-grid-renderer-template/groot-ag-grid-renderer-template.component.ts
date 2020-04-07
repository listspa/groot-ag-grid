import {Component, TemplateRef} from '@angular/core';
import {ICellRendererParams} from 'ag-grid-community';
import {ICellRendererAngularComp} from 'ag-grid-angular';

/**
 * Component to render a generic template inside a table cell.
 * See https://blog.angularindepth.com/easier-embedding-of-angular-ui-in-ag-grid-52db93b73884
 */
@Component({
  templateUrl: './groot-ag-grid-renderer-template.component.html'
})
export class GrootAgGridRendererTemplateComponent implements ICellRendererAngularComp {
  template: TemplateRef<any>;
  templateContext: { $implicit: any, row: any, index: number, params: any };

  agInit(params: ICellRendererParams): void {
    this.template = params['ngTemplate'];
    this.refresh(params);
  }

  refresh(params: any): boolean {
    this.templateContext = {
      $implicit: params.data,
      row: params.data,
      index: params.rowIndex,
      params: params
    };
    return true;
  }
}
