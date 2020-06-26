import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef} from 'ag-grid-community';
import {GrootAgGridRenderer} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
import {LoadingFailed, PaginatedResponse, PaginationOptions} from '@listgroup/groot';
import {GrootAgGridSelection} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-selection.model';
import {GrootAgGridComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {NoGridDataMessage} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/no-grid-data.model';

interface User {
  id: string;
  name: string;
  age: number;
  birthDate: Date;
}

@Component({
  templateUrl: './page-demo-table.component.html',
  styleUrls: ['./page-demo-table.component.scss']
})
export class PageDemoTableComponent implements OnInit {
  columns: ColDef[];
  searchResultsData: PaginatedResponse<User>;
  @ViewChild('cellTemplate') cellTemplate: TemplateRef<any>;
  selectionMode: 'single' | 'multi' = 'multi';
  @ViewChild('gridSelection') gridSelection: GrootAgGridComponent<User>;
  loadingFailedData: LoadingFailed = {loadingFailed: true};
  alertData: NoGridDataMessage = {message: 'A generic warning', style: 'warning'};

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
      },
      {
        colId: 'birthDate',
        field: 'birthDate',
        cellRenderer: GrootAgGridRenderer.date,
      },
      {
        colId: 'buttons',
        cellRenderer: GrootAgGridRenderer.template,
        cellRendererParams: {ngTemplate: this.cellTemplate}
      }
    ];
  }

  search(event: PaginationOptions) {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 3,
      records: [
        {id: 'U001', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04')},
        {id: 'U002', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03')},
        {id: 'U003', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05')},
      ]
    };
  }

  setSelection(event: GrootAgGridSelection<User>) {
    console.log('Selection set to %o', event);
  }

  searchLoadingFailed() {
    this.loadingFailedData = {...this.loadingFailedData};
  }

  searchAlertData() {
    this.alertData = {...this.alertData};
  }
}
