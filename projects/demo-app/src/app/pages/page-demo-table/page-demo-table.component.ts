import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {GrootAgGridRenderer} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
import {LoadingFailed, PaginatedResponse} from '@listgroup/groot';
import {GrootAgGridSelection} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-selection.model';
import {GrootAgGridComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {NoGridDataMessage} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/no-grid-data.model';
import {ColGroupDef} from 'ag-grid-community/dist/lib/entities/colDef';
import {
  GrootAgGridColumnSelectorModalComponent
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-column-selector-modal/groot-ag-grid-column-selector-modal.component';
import {Subject} from 'rxjs';
import {BsModalService} from 'ngx-bootstrap/modal';
import {RowGroupingModule} from '@ag-grid-enterprise/all-modules';
import {EnterpriseCoreModule} from '@ag-grid-enterprise/core/dist/cjs/agGridEnterpriseModule';
import {MultiSortPaginationOptions} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-pagination.model';

interface User {
  id: string;
  name: string;
  age: number;
  birthDate: Date;
  grownUp: boolean;
  lastUpdateTimestamp?: Date;
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
  @ViewChild('table1', {static: false}) table1: GrootAgGridComponent<any>;
  @ViewChild('table2', {static: false}) table2: GrootAgGridComponent<any>;
  @ViewChild('table3', {static: false}) table3: GrootAgGridComponent<any>;
  @ViewChild('table4', {static: false}) table4: GrootAgGridComponent<any>;
  @ViewChild('alignedGrid1', {static: false}) alignedGrid1: GrootAgGridComponent<any>;
  @ViewChild('alignedGrid2', {static: false}) alignedGrid2: GrootAgGridComponent<any>;
  @ViewChild('gridHeader', {static: false}) gridHeader: GrootAgGridComponent<any>;
  @ViewChild('columnHeaderTemplate', {static: true}) columnHeaderTemplate: TemplateRef<any>;
  availableColumns: ColDef[];
  columns: ColDef[];
  customHeaderColumns: ColDef[];
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
  }

  constructor(private bsModalService: BsModalService) {
  }

  ngOnInit(): void {
    this.availableColumns = [
      {
        colId: 'id',
        field: 'id',
        sortable: true
  },
      {
        colId: 'name',
        field: 'name',
        sortable: true
      },
      {
        colId: 'age',
        field: 'age',
        cellRenderer: GrootAgGridRenderer.numbers,
        cellClass: 'ag-cell-right',
        sortable: true
      },
      {
        colId: 'age showing delta on update',
        field: 'age',
        cellRenderer: GrootAgGridRenderer.numbers,
        cellRendererParams: {showDelta: true},
        cellClass: 'ag-cell-right',
        sortable: true
      },
      {
        colId: 'birthDate',
        field: 'birthDate',
        cellRenderer: GrootAgGridRenderer.dates,
        sortable: true
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
      },
      {
        colId: 'lastUpdateTimestamp',
        field: 'lastUpdateTimestamp',
        cellRenderer: GrootAgGridRenderer.dates,
        cellRendererParams: {timestamp: true, showMilliseconds: true}
      },
    ];
    this.columns = [...this.availableColumns];
    this.customHeaderColumns = [...this.availableColumns.map(c => ({
      ...c,
      headerComponent: 'headerTemplateRenderer',
      headerComponentParams: { ngTemplate: this.columnHeaderTemplate}
    }))];

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
        },
      ]
    }
    ];

    this.columnsTree = [
      // First column is the auto group
      {colId: 'count', field: 'count', cellRenderer: GrootAgGridRenderer.numbers, cellClass: 'ag-cell-right'},
    ];
    this.treeGroupColDef = {
      headerName: 'Category',
      rowDrag: true,
      cellRendererParams: {
        suppressCount: true,
      }
    };
  }

  search(event: MultiSortPaginationOptions): void {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 4,
      records: [
        {id: 'U001', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U002', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U003', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U004', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
      ]
    };

    this.applySort(event);
  }

  private applySort(event: MultiSortPaginationOptions): void {
    // Apply sort
    if (!event.sort) {
      return;
    }
    this.searchResultsData.records.sort((r1, r2) => {
      for (const s of event.sort) {
        if (r1[s.sortField] < r2[s.sortField]) {
          return s.sortReversed ? +1 : -1;
        } else if (r1[s.sortField] > r2[s.sortField]) {
          return s.sortReversed ? -1 : +1;
        }
      }
      // if all fields in sort are equal, records are equal
      return 0;
    });
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

  changeAge(row: any): void {
    row.age = row.age + (Math.round(Math.random() * 100) * (Math.random() < 0.5 ? -1 : 1));
    this.table1.gridOptions.api.refreshCells();
    this.table2.gridOptions.api.refreshCells();
    this.table3.gridOptions.api.refreshCells();
    this.table4.gridOptions.api.refreshCells();
    this.alignedGrid1.gridOptions.api.refreshCells();
    this.alignedGrid2.gridOptions.api.refreshCells();
    this.gridHeader.gridOptions.api.refreshCells();
    this.gridSelection.gridOptions.api.refreshCells();
  }
}
