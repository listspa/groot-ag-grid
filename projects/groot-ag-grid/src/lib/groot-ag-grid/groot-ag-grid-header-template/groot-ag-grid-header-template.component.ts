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
  moreThanOneColSorting = false;

  agInit(params: IHeaderParams): void {
    this.template = params['ngTemplate'];
    this.params = params;
    this.params.column.addEventListener('sortChanged', () => this.onSortChanged());
    this.onSortChanged();
  }

  refresh(params: IHeaderParams): boolean {
    this.template = params['ngTemplate'];
    this.params = params;
    this.onSortChanged();
    return true;
  }

  onSortChanged(): void {
    if (this.params.column.isSortAscending()) {
      this.sorted = 'asc';
    } else if (this.params.column.isSortDescending()) {
      this.sorted = 'desc';
    } else {
      this.sorted = '';
    }
    this.moreThanOneColSorting = this.params.columnApi.getColumnState()
      .filter(c => c.sort).length > 1;
  }

  @HostListener('click', ['$event'])
  toggleSort($event: MouseEvent): void {
    switch (this.sorted) {
      case 'asc':
        this.changeSort('desc', $event);
        break;

      case 'desc':
        this.changeSort('', $event);
        break;

      case '':
        this.changeSort('asc', $event);
        break;
    }
  }

  private changeSort(order: string, $event: MouseEvent): void {
    this.params.setSort(order, $event.shiftKey);
  }
}
