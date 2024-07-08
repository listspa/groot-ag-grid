import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef, ColGroupDef, GetDataPath, GetRowIdFunc, Module} from 'ag-grid-community';
import {
  GrootAgGridRenderer
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
import {LoadingFailed, PaginatedResponse} from '@listgroup/groot';
import {GrootAgGridSelection} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-selection.model';
import {
  GrootAgGridComponent,
  TreeTableWithExtras
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {NoGridDataMessage} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/no-grid-data.model';
import {
  GrootAgGridColumnSelectorModalComponent
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-column-selector-modal/groot-ag-grid-column-selector-modal.component';
import {Subject} from 'rxjs';
import {BsModalService} from 'ngx-bootstrap/modal';
import {RowGroupingModule} from '@ag-grid-enterprise/row-grouping';
import {
  MultiSortPaginationOptions
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-pagination.model';

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
  @ViewChild('gridColumnHeaderTemplate', {static: false}) gridColumnHeaderTemplate: GrootAgGridComponent<any>;
  @ViewChild('columnHeaderTemplate', {static: true}) columnHeaderTemplate: TemplateRef<any>;
  @ViewChild('communityTreeTable', {static: true}) communityTreeTable: TemplateRef<any>;
  availableColumns: ColDef[];
  columns: ColDef[];
  customHeaderColumns: ColDef[];
  columnsGroup: ColGroupDef[];
  searchResultsDataTable1: PaginatedResponse<User>;
  searchResultsDataTable2: PaginatedResponse<User>;
  searchResultsDataTable3: PaginatedResponse<User>;
  searchResultsDataTable4: PaginatedResponse<User>;
  searchResultsDataGridSelection: PaginatedResponse<User>;
  searchResultsDataAlignedGrid1: PaginatedResponse<User>;
  searchResultsDataAlignedGrid2: PaginatedResponse<User>;
  searchResultsDataGridHeader: PaginatedResponse<User>;
  searchResultsDataColumnHeaderTemplate: PaginatedResponse<User>;
  @ViewChild('cellTemplate', {static: true}) cellTemplate: TemplateRef<any>;
  selectionMode: 'single' | 'multi' | 'multi-click' = 'multi';
  @ViewChild('gridSelection', {static: true}) gridSelection: GrootAgGridComponent<User>;
  loadingFailedData: LoadingFailed = {loadingFailed: true};
  emptyData: PaginatedResponse<User>;
  alertData: NoGridDataMessage = {message: 'A generic warning', style: 'warning'};
  selection: GrootAgGridSelection<User>;
  treeModules: Array<Module> = [RowGroupingModule] as unknown as Array<Module>;

  searchResultsDataTree: PaginatedResponse<CategoryData>;
  searchResultsDataCommunityTree: PaginatedResponse<TreeTableWithExtras<any>>;
  columnsTree: ColDef[];
  treeGroupColDef: ColDef;

  communityTreeColumns: ColDef[];
  communityTreeGroupColDef: ColDef;
  @ViewChild('communityTreeTemplate', {static: true}) communityTreeTemplate: TemplateRef<any>;

  getDataPath: GetDataPath<any> = data => {
    if (data.subCategory) {
      return [data.macroCategory, data.category, data.subCategory];
    } else if (data.category) {
      return [data.macroCategory, data.category];
    } else {
      return [data.macroCategory];
    }
  }

  getRowId: GetRowIdFunc<any> = data => {
    const {subCategory, macroCategory, category} = data.data;
    if (subCategory) {
      return macroCategory + category + subCategory;
    } else if (category) {
      return macroCategory + category;
    } else {
      return macroCategory;
    }
  }

  getRowIdCommunityTree: GetRowIdFunc<any> = params => {
    return params?.data?.rowId;
  }

  getDataPathCommunityTree: GetDataPath<any> = data => {
    return data?.rowId?.split('_');
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
        colId: 'ageShowingDelta',
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
      headerComponentParams: {ngTemplate: this.columnHeaderTemplate}
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

    this.communityTreeColumns = [
      {colId: 'count', field: 'count', cellRenderer: GrootAgGridRenderer.numbers, cellClass: 'ag-cell-right'},
    ];
    this.communityTreeGroupColDef = {
      colId: 'category',
      field: 'description',
      headerName: 'Category',
      cellRenderer: 'templateRenderer',
      cellRendererParams: {
        ngTemplate: this.communityTreeTemplate
      },
    }
  }

  getResultData(event): PaginatedResponse<User> {
    return {
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
  }

  searchTable1(event: MultiSortPaginationOptions): void {
    this.searchResultsDataTable1 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataTable1);
  }

  searchTable2(event: MultiSortPaginationOptions): void {
    this.searchResultsDataTable2 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataTable2);
  }

  searchTable3(event: MultiSortPaginationOptions): void {
    this.searchResultsDataTable3 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataTable3);
  }

  searchTable4(event: MultiSortPaginationOptions): void {
    this.searchResultsDataTable4 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataTable4);
  }

  searchGridSelection(event: MultiSortPaginationOptions): void {
    this.searchResultsDataGridSelection = this.getResultData(event);
    this.applySort(event, this.searchResultsDataGridSelection);
  }

  searchAlignedGrid1(event: MultiSortPaginationOptions): void {
    this.searchResultsDataAlignedGrid1 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataAlignedGrid1);
  }

  searchAlignedGrid2(event: MultiSortPaginationOptions): void {
    this.searchResultsDataAlignedGrid2 = this.getResultData(event);
    this.applySort(event, this.searchResultsDataAlignedGrid2);
  }

  searchGridHeader(event: MultiSortPaginationOptions): void {
    this.searchResultsDataGridHeader = this.getResultData(event);
    this.applySort(event, this.searchResultsDataGridHeader);
  }

  searchColumnHeaderTemplate(event: MultiSortPaginationOptions): void {
    this.searchResultsDataColumnHeaderTemplate = this.getResultData(event);
    this.applySort(event, this.searchResultsDataColumnHeaderTemplate);
  }

  private applySort(event: MultiSortPaginationOptions, searchResultsData: PaginatedResponse<User>): void {
    // Apply sort
    if (!event.sort) {
      return;
    }
    searchResultsData.records.sort((r1, r2) => {
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
    this.searchResultsDataCommunityTree = {
      pageNum: 0,
      pageLen: 10,
      totalNumRecords: 16,
      records: [
        {macroCategory: 'transportation', category: '', subCategory: '', description: 'Transportation', count: 542, rowId: '00' },
        {macroCategory: 'transportation', category: 'personal', subCategory: '', description: 'Train', count: 12, rowId: '00_00'},
        {macroCategory: 'transportation', category: 'personal', subCategory: 'train', subSubCategory: 'holidays', description: 'Holiday trips', count: 12, rowId: '00_00_00' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: '', description: 'Car', count: 530, rowId: '00_01' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'maintenance', description: 'Maintenance expenses', count: 345, rowId: '00_01_00' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'maintenance', subSubSubCategory: 'engine', description: 'Engine', count: 95, rowId: '00_01_00_00' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'maintenance', subSubSubCategory: 'tyres', description: 'Tyres', count: 250, rowId: '00_01_00_01' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'fuel', description: 'Fuel', count: 185, rowId: '00_01_01' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'fuel', subSubSubCategory: 'diesel', description: 'Diesel', count: 105, rowId: '00_01_01_00' },
        {macroCategory: 'transportation', category: 'personal', subCategory: 'car', subSubCategory: 'fuel', subSubSubCategory: 'electric', description: 'EV Vehicle', count: 80, rowId: '00_01_01_01' },
        {macroCategory: 'food', category: '', subCategory: '', description: 'Food', count: 55, rowId: '01'},
        {macroCategory: 'food', category: 'groceries', subCategory: '', description: 'Groceries', count: 35, children:[], rowId: '01_00' },
        {macroCategory: 'food', category: 'eatOutside', subCategory: '', description: 'Eating Outside', count: 20, children:[], rowId: '01_01' },
        {macroCategory: 'home', category: '', subCategory: '', description: 'Home', count: 95, rowId: '02'},
        {macroCategory: 'home', category: 'internet', subCategory: '', description: 'Internet', count: 35, children:[], rowId: '02_00' },
        {macroCategory: 'home', category: 'electricity', subCategory: '', description: 'Electricity', count: 60, children:[], rowId: '02_01' },
      ]
    };
  }

  changeAge(row: any): void {
    row.age = row.age + (Math.round(Math.random() * 100) * (Math.random() < 0.5 ? -1 : 1));
    this.table1.api.refreshCells();
    this.table2.api.refreshCells();
    this.table3.api.refreshCells();
    this.table4.api.refreshCells();
    this.alignedGrid1.api.refreshCells();
    this.alignedGrid2.api.refreshCells();
    this.gridHeader.api.refreshCells();
    this.gridSelection.api.refreshCells();
  }
}
