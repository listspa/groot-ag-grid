import {Component, HostListener, TemplateRef} from '@angular/core';
import {IHeaderParams} from 'ag-grid-community';
import {IHeaderAngularComp} from 'ag-grid-angular';

interface GrootAgGridHeaderParams extends IHeaderParams {
    ngTemplate: TemplateRef<any>
}

/**
 * Component to render a generic template inside a table header.
 */
@Component({
  selector: 'app-custom-header',
  templateUrl: './groot-ag-grid-header-template.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class GrootAgGridHeaderTemplateComponent implements IHeaderAngularComp {
  params: GrootAgGridHeaderParams;
  sorted: 'asc' | 'desc' | '';

  agInit(params: GrootAgGridHeaderParams): void {
    this.params = params;
    this.params.column.addEventListener('sortChanged', () => this.onSortChanged());
    this.onSortChanged();
  }

  refresh(params: GrootAgGridHeaderParams): boolean {
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
    this.params.columnApi['moreThanOneColumnSorted'] = this.params.columnApi.getColumnState().filter(c => c.sort).length > 1;
    console.log(`${this.params.column.getId()}: [${this.sorted}], moreThanOneColumnSorted: ${this.params.columnApi['moreThanOneColumnSorted']}`);
  }

  @HostListener('click', ['$event'])
  toggleSort($event: MouseEvent): void {
    this.params.progressSort($event.shiftKey);
  }
}
