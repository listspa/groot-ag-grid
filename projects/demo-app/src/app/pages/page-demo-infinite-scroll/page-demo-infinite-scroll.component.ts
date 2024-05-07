import {Component, OnInit, ViewChild} from '@angular/core';
import {GrootAgGridComponent} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.component';
import {ColDef} from 'ag-grid-community';
import {PaginatedResponse} from '@listgroup/groot';
import {BsModalService} from 'ngx-bootstrap/modal';
import {
  GrootAgGridRenderer
} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';
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

@Component({
  selector: 'app-page-demo-infinite-scroll',
  templateUrl: './page-demo-infinite-scroll.component.html',
  styleUrls: ['./page-demo-infinite-scroll.component.scss']
})
export class PageDemoInfiniteScrollComponent implements OnInit {

  @ViewChild('table1', {static: false}) table1: GrootAgGridComponent<any>;

  availableColumns: ColDef[];
  columns: ColDef[];
  searchResultsData: PaginatedResponse<User>;
  emptyData: PaginatedResponse<User>;

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
        colId: 'lastUpdateTimestamp',
        field: 'lastUpdateTimestamp',
        cellRenderer: GrootAgGridRenderer.dates,
        cellRendererParams: {timestamp: true, showMilliseconds: true}
      },
    ];
    this.columns = [...this.availableColumns];
  }

  search(event: MultiSortPaginationOptions): void {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 24,
      records: [
        {id: 'U001', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U002', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U003', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U004', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U005', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U006', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U007', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U008', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U009', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U010', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U011', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U012', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U031', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U032', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U033', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U034', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U035', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U036', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U037', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U038', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U039', name: 'Andrea Bergia', age: 34, birthDate: new Date('1985-12-04'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U040', name: 'John Peterson', age: 44, birthDate: new Date('1975-01-03'), grownUp: true, lastUpdateTimestamp: new Date()},
        {id: 'U041', name: 'Donald Trump', age: 99, birthDate: new Date('1921-06-05'), grownUp: false, lastUpdateTimestamp: new Date()},
        {id: 'U042', name: 'Baby Boy', age: 4, birthDate: new Date('2016-07-02'), grownUp: false, lastUpdateTimestamp: new Date()},
      ].slice(event.pageNum * event.pageLen, event.pageNum * event.pageLen + event.pageLen)
    };

    this.applySort(event);
  }

  searchEmptyData(event: MultiSortPaginationOptions): void {
    this.emptyData = {pageNum: 0, pageLen: 10, records: [], totalNumRecords: 0};
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

}
