import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColDef, RowNode} from 'ag-grid-community';
import {PaginatedResponse, PaginationOptions} from '@listgroup/groot';
import {GrootAgGridRenderer} from '../../../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid-customization.consts';

@Component({
  selector: 'app-page-demo-style',
  templateUrl: './page-demo-style.component.html',
  styleUrls: ['./page-demo-style.component.scss']
})
export class PageDemoStyleComponent implements OnInit {
  @ViewChild('listData', {static: true}) private listData: TemplateRef<any>;
  columns: ColDef[];
  getRowHeight = this.calculateRowHeight.bind(this);

  searchResultsData: PaginatedResponse<{id: string}>;

  ngOnInit(): void {
    this.columns = [
      {
        colId: 'id',
        field: 'id',
        cellRenderer: GrootAgGridRenderer.template,
        cellRendererParams: {ngTemplate: this.listData}
      }
    ];
  }

  private calculateRowHeight(rowNode: RowNode) {
    const max = this.getMaxNmItems(rowNode);
    if (max === 1) {
      // Default base height
      return 28;
    } else {
      // Each li takes 1.5rem vertically, with 1rem = 13px. Add some pixels for the padding
      return max * 1.5 * 13 + 4;
    }
  }

  private getMaxNmItems(rowNode: RowNode): number {
    const preComputedValue = (rowNode as any).$garfieldNmMax;
    if (preComputedValue !== undefined) {
      return preComputedValue;
    }

    const result = 3;
    (rowNode as any).$garfieldNmMax = result;
    return result;
  }

  search(event: PaginationOptions): void {
    this.searchResultsData = {
      pageNum: event.pageNum,
      pageLen: event.pageLen,
      totalNumRecords: 3,
      records: [
        {id: ''},
        {id: ''},
        {id: ''},
      ]
    };
  }
}
