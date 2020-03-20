import {Component, HostListener, TemplateRef} from '@angular/core';
import {IHeaderParams} from 'ag-grid-community';
import {IHeaderAngularComp} from 'ag-grid-angular';

/**
 * Component to render a generic template inside a table header.
 */
@Component({
  templateUrl: './groot-ag-grid-header-template.component.html',
  styles: [`
      :host {
          display: block;
          width: 100%;
      }
  `]
})
export class GrootAgGridHeaderTemplateComponent implements IHeaderAngularComp {
  params: IHeaderParams;
  template: TemplateRef<any>;
  sorted: 'asc' | 'desc' | '';

  agInit(params: IHeaderParams): void {
    this.template = params['ngTemplate'];

    this.params = params;
    this.params.column.addEventListener('sortChanged', () => this.onSortChanged());
    this.onSortChanged();
  }

  onSortChanged() {
    if (this.params.column.isSortAscending()) {
      this.sorted = 'asc'
    } else if (this.params.column.isSortDescending()) {
      this.sorted = 'desc'
    } else {
      this.sorted = ''
    }
  }

  @HostListener('click', [])
  toggleSort() {
    switch (this.sorted) {
      case 'asc':
        this.changeSort('desc');
        break;

      case 'desc':
        this.changeSort('');
        break;

      case '':
        this.changeSort('asc');
        break;
    }
  }

  private changeSort(order) {
    this.params.setSort(order, false);
  };
}
