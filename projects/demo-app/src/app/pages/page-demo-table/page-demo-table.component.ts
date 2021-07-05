import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {GrootAgGridRenderer} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
import {LoadingFailed, PaginatedResponse, PaginationOptions} from '@listgroup/groot';
import {GrootAgGridSelection} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-selection.model';
import {GrootAgGridComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {NoGridDataMessage} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/no-grid-data.model';
import {ColGroupDef} from 'ag-grid-community/dist/lib/entities/colDef';
import {GrootAgGridColumnSelectorModalComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-column-selector-modal/groot-ag-grid-column-selector-modal.component';
import {Subject} from 'rxjs';
import {BsModalService} from 'ngx-bootstrap/modal';
import {RowGroupingModule} from '@ag-grid-enterprise/all-modules';
import {EnterpriseCoreModule} from '@ag-grid-enterprise/core/dist/cjs/agGridEnterpriseModule';

interface User {
  id: string;
  name: string;
  age: number;
  birthDate: Date;
  grownUp: boolean;
}

interface CategoryData {
  macroCategory: string;
  category?: string;
  subCategory?: string;
  count: number;
}

@Component({
  templateUrl: './page-demo-table.component.html',
  styleUrls: ['./page-demo-table.component.scss']
})
export class PageDemoTableComponent implements OnInit {
  availableColumns: ColDef[];
  columns: ColDef[];
  columnsGroup: ColGroupDef[];
  searchResultsData: PaginatedResponse<User>;
  @ViewChild('cellTemplate', {static: true}) cellTemplate: TemplateRef<any>;
  selectionMode: 'single' | 'multi' | 'multi-click' = 'multi';
  @ViewChild('gridSelection', {static: true}) gridSelection: GrootAgGridComponent<User>;
  loadingFailedData: LoadingFailed = {loadingFailed: true};
  emptyData: PaginatedResponse<User>;
  alertData: NoGridDataMessage = {message: 'A generic warning', style: 'warning'};
  selection: GrootAgGridSelection<User>;

  treeModules = [EnterpriseCoreModule, RowGroupingModule];
  searchResultsDataTree: PaginatedResponse<CategoryData>;
  columnsTree: ColDef[];
  treeGroupColDef: ColDef;
  getDataPath = data => {
    if (data.subCategory) {
      return [data.macroCategory, data.category, data.subCategory];
    } else if (data.category) {
      return [data.macroCategory, data.category];
    } else {
      return [data.macroCategory];
    }
  };

  constructor(private bsModalService: BsModalService) {
  }

  ngOnInit(): void {
    this.availableColumns = [
      {
        colId: 'id',
        field: 'id',
      },
      {
        colId: 'name',
        field: 'name',
      },
      {
        colId: 'age',
        field: 'age',
        cellRenderer: GrootAgGridRenderer.numbers,
        cellClass: 'ag-cell-right'
      },
      {
        colId: 'birthDate',
        field: 'birthDate',
        cellRenderer: GrootAgGridRenderer.dates,
      },
      {
        colId: 'grownUp',
        field: 'grownUp',
        cellRenderer: GrootAgGridRenderer.booleans,
        cellClass: 'ag-cell-center',
      },
      {
        colId: 'buttons',
        cellRenderer: GrootAgGridRenderer.template,
        cellRendererParams: {ngTemplate: this.cellTemplate}
      }
    ];
    this.columns = [...this.availableColumns];

    this.columnsGroup = [{
      headerName: 'Group 1',
      children: [
        {
          colId: 'id',
          field: 'id',
        },
        {
          colId: 'name',
          field: 'name',
        },
      ]
    }, {
      headerName: 'Group 2',
      children: [
        {
          colId: 'age',
          field: 'age',
          cellRenderer: GrootAgGridRenderer.numbers,
          cellClass: 'ag-cell-right'
        },
        {
          colId: 'birthDate',
          field: 'birthDate',
          cellRenderer: GrootAgGridRenderer.dates,
        },
        {
          colId: 'grownUp',
          field: 'grownUp',
          cellRenderer: GrootAgGridRenderer.booleans,
          cellClass: 'ag-cell-center',
          columnGroupShow: 'open'
        },
        {
          colId: 'buttons',
          cellRenderer: GrootAgGridRenderer.template,
          cellRendererParams: {ngTemplate: this.cellTemplate},
          columnGroupShow: 'open'
        }
      ]
    }
    ];

    this.columnsTree = [
      // First column is the auto group
      {colId: 'count', field: 'count', cellRenderer: GrootAgGridRenderer.numbers, cellClass: 'ag-cell-right'},
    ];
    this.treeGroupColDef = {
      headerName: 'Category',
      cellRendererParams: {
        suppressCount: true,
      }
    };
  }

  search(event: PaginationOptions): void {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 4,
      records: [
        {id: 'U001', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true},
        {id: 'U002', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true},
        {id: 'U003', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false},
        {id: 'U004', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false},
      ]
    };

    this.applySort(event);
  }

  private applySort(event: PaginationOptions): void {
    // Apply sort
    if (event.sortField) {
      this.searchResultsData.records.sort((r1, r2) => {
        if (r1[event.sortField] < r2[event.sortField]) {
          return event.sortReversed ? +1 : -1;
        } else if (r1[event.sortField] > r2[event.sortField]) {
          return event.sortReversed ? -1 : +1;
        } else {
          return 0;
        }
      });
    }
  }

  setSelection(event: GrootAgGridSelection<User>): void {
    console.log('Selection set to %o', event);
    this.selection = event;
  }

  searchLoadingFailed(): void {
    this.loadingFailedData = {...this.loadingFailedData};
  }

  searchAlertData(): void {
    this.alertData = {...this.alertData};
  }

  showColumnSelector(): void {
    const reset = new Subject<void>();
    reset.subscribe(() => this.columns = [...this.availableColumns]);

    const save = new Subject<string[]>();
    save.subscribe(cols => {
      console.table('save and apply selected columns: ', cols);
      this.columns = cols.map(colName => this.availableColumns.find(col => col.colId === colName));
    });

    this.bsModalService.show(GrootAgGridColumnSelectorModalComponent, {
      initialState: {
        labelsPrefix: '',
        availableColumns: this.availableColumns,
        selectedColumns: this.columns.map(c => c.colId),
        reset,
        save,
      },
      class: 'modal-lg groot-darwin-modal',
      backdrop: 'static'
    });
  }

  searchEmptyData(): void {
    this.emptyData = {pageNum: 0, pageLen: 10, records: [], totalNumRecords: 0};
  }

  searchTree(): void {
    this.searchResultsDataTree = {
      pageNum: 0,
      pageLen: 10,
      totalNumRecords: 8,
      records: [
        {macroCategory: 'Liquid product', count: 47},
        {macroCategory: 'Liquid product', category: 'Cash', count: 24},
        {macroCategory: 'Liquid product', category: 'Cash', subCategory: 'Cash', count: 10},
        {macroCategory: 'Liquid product', category: 'Cash', subCategory: 'Traveller\'s cheque', count: 14},
        {macroCategory: 'Liquid product', category: 'Treasury bills', count: 23},
        {macroCategory: 'Liquid product', category: 'Treasury bills', subCategory: 'Treasury bills', count: 23},
      ]
    };
  }
}
