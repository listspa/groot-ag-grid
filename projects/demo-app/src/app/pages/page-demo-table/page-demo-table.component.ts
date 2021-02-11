import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {GrootAgGridRenderer} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
import {LoadingFailed, PaginatedResponse, PaginationOptions} from '@listgroup/groot';
import {GrootAgGridSelection} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-selection.model';
import {GrootAgGridComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {NoGridDataMessage} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/no-grid-data.model';
import {ColGroupDef} from 'ag-grid-community/dist/lib/entities/colDef';

interface User {
  id: string;
  name: string;
  age: number;
  birthDate: Date;
  grownUp: boolean;
}

@Component({
  templateUrl: './page-demo-table.component.html',
  styleUrls: ['./page-demo-table.component.scss']
})
export class PageDemoTableComponent implements OnInit {
  columns: ColDef[];
  columnsGroup: ColGroupDef[];
  searchResultsData: PaginatedResponse<User>;
  @ViewChild('cellTemplate', {static: true}) cellTemplate: TemplateRef<any>;
  selectionMode: 'single' | 'multi' | 'multi-click' = 'multi';
  @ViewChild('gridSelection', {static: true}) gridSelection: GrootAgGridComponent<User>;
  loadingFailedData: LoadingFailed = {loadingFailed: true};
  alertData: NoGridDataMessage = {message: 'A generic warning', style: 'warning'};
  selection: GrootAgGridSelection<User>;

  constructor() {
  }

  ngOnInit(): void {
    this.columns = [
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
  }

  search(event: PaginationOptions) {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 4,
      records: [
        {id: 'U001', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true,},
        {id: 'U002', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true,},
        {id: 'U003', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false,},
        {id: 'U004', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false,},
      ]
    };

    this.applySort(event);
  }

  private applySort(event: PaginationOptions) {
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

  setSelection(event: GrootAgGridSelection<User>) {
    console.log('Selection set to %o', event);
    this.selection = event;
  }

  searchLoadingFailed() {
    this.loadingFailedData = {...this.loadingFailedData};
  }

  searchAlertData() {
    this.alertData = {...this.alertData};
  }

  showColumnSelector() {

  }
}
