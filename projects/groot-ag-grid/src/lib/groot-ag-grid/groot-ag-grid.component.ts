import {Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  GrootTableTitleRightAreaDirective,
  isLoadingFailed,
  LoadingFailed,
  PaginatedResponse,
  PaginationOptions,
  SortPagination
} from '@listgroup/groot';
import {CellClickedEvent, ColDef, GridApi, GridOptions, RowNode} from 'ag-grid-community';
import {TranslateService} from '@ngx-translate/core';
import {toSortModel, toSortPagination} from './agGrid.utils';
import {
  GrootAgGridNoRowsOverlayComponent,
  GrootAgGridNoRowsParams
} from './groot-ag-grid-no-rows-overlay/groot-ag-grid-no-rows-overlay.component';
import {GrootAgGridLoadingOverlayComponent} from './groot-ag-grid-loading-overlay/groot-ag-grid-loading-overlay.component';
import {GrootAgGridRendererDateComponent} from './groot-ag-grid-renderer-date/groot-ag-grid-renderer-date.component';
import {GrootAgGridRendererNumbersComponent} from './groot-ag-grid-renderer-numbers/groot-ag-grid-renderer-numbers.component';
import {GrootAgGridRendererTemplateComponent} from './groot-ag-grid-renderer-template/groot-ag-grid-renderer-template.component';
import {GrootAgGridHeaderTemplateComponent} from './groot-ag-grid-header-template/groot-ag-grid-header-template.component';
import {GrootAgGridCustomizationService} from './groot-ag-grid-customization.service';
import {GrootAgGridSelection} from './groot-ag-grid-selection.model';

const SPECIAL_TOOL_CELL: ColDef = {
  resizable: false,
  pinned: true,
  sortable: false,
  suppressMenu: true,
  suppressMovable: true,
  suppressToolPanel: true,
  maxWidth: 30,
  width: 30,
};

@Component({
  selector: 'groot-ag-grid',
  templateUrl: './groot-ag-grid.component.html',
})
export class GrootAgGridComponent<T> implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<PaginationOptions>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() columnsStatusChanged = new EventEmitter<string>();
  @Output() bodyScroll = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<GrootAgGridSelection<T>>();
  @Output() agGridReady = new EventEmitter<GridApi>();

  @Input() defaultSortColumn: string;
  @Input() defaultSortReverseFlag = false;
  @Input() pageSize = 15;
  @Input() labelPrefix = '';
  @Input() gridHeightCss: string | null = null;
  @Input() hideTitleBar = false;
  @Input() downloadExcelLabel = 'common.downloadExcel';
  @Input() downloadExcelUrl: string | null;
  @Input() downloadExcelUrlProvider: () => string | null;
  @Input() downloadExcelArgs: () => any | null;
  @Input() downloadExcelIsAjax = false;
  @Input() downloadExcelFileName = 'download.xlsx';
  @Input() showRefreshIcon = false;
  @Input() lastRefreshTimestamp: Date | string = null;
  @Input() rowHeight = 28;
  @Input() getRowHeight: ((rowNode: RowNode) => number | null) = null;
  @Input() keepServerSorting = true;
  @Input() rowClassRules?: { [cssClassName: string]: (((params: any) => boolean) | string) };
  @Input() headerCheckboxSelection: boolean | ((params: any) => boolean);
  @Input() @ContentChild(GrootTableTitleRightAreaDirective, {read: TemplateRef}) tableTitleRightArea: TemplateRef<any>;
  @Input() showPaginationIfEmpty = this.grootAgGridCustomizationService.showPaginationIfEmptyDefault;
  @Input() singleRowSelection = false;

  @Input() set searchResultsData(searchResultsData: PaginatedResponse<T> | LoadingFailed) {
    if (isLoadingFailed(searchResultsData)) {
      this.noRowsOverlayComponentParams.loadingError = true;
      this.data = null;
      this.rowsDisplayed = [];
    } else {
      this.noRowsOverlayComponentParams.loadingError = false;
      this.data = searchResultsData;
      if (this.data) {
        this.rowsDisplayed = this.data.records;
      } else {
        this.rowsDisplayed = [];
      }
    }

    if (this.gridOptions.api) {
      this.gridOptions.api.hideOverlay();
      this.gridOptions.api.setRowData(this.rowsDisplayed);
    }
  }

  /**
   * Note: the columns must have set colId to the name of the database column.
   */
  @Input() set columnDefs(columnDefs: ColDef[]) {
    this.columnDefs_ = columnDefs;
    this.handleSpecialColumns();

    if (this.gridOptions.api) {
      this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs);
    }
    if (this.gridOptions.columnApi) {
      this.gridOptions.columnApi.resetColumnState();
    }
    if (this.gridOptions.api) {
      this.gridOptions.api.redrawRows();
    }
  }

  @Input() set accordionTemplate(template: TemplateRef<any>) {
    this.accordionTemplate_ = template;
    this.gridOptions.fullWidthCellRendererParams.ngTemplate = template;
    this.gridOptions.isRowSelectable = row => !row.data.$isAccordionRow;
    this.handleSpecialColumns();
  }

  @Input() set actionButtonTemplate(template: TemplateRef<any>) {
    this.actionButtonTemplate_ = template;
    this.handleSpecialColumns();
  }

  @Input() set actionButtonTemplateRight(right: boolean) {
    this.actionButtonTemplateRight_ = right;
    this.handleSpecialColumns();
  }

  @Input() set additionalButtonsTemplate(template: TemplateRef<any> | TemplateRef<any>[]) {
    if (Array.isArray(template)) {
      this.additionalButtonsTemplate_ = template;
    } else {
      this.additionalButtonsTemplate_ = [template];
    }
    this.handleSpecialColumns();
  }

  @Input() set checkboxSelection(enable: boolean) {
    if (enable) {
      this.checkboxSelection_ = enable;
      this.handleSpecialColumns();
    }
  }

  get checkboxSelection(): boolean {
    return this.checkboxSelection_;
  }

  private handleSpecialColumns() {
    const colDefs = [...this.columnDefs_];

    if (this.checkboxSelection_) {
      const checkboxCell: ColDef = {
        ...SPECIAL_TOOL_CELL,
        checkboxSelection: true,
        headerCheckboxSelection: this.headerCheckboxSelection,
        cellClass: 'groot-checkbox-cell',
        headerClass: 'groot-header-checkbox-cell'
      };

      colDefs.unshift(checkboxCell);
    }

    if (this.accordionTemplate_) {
      const accordionCell: ColDef = {
        ...SPECIAL_TOOL_CELL,
        cellRenderer: 'templateRenderer',
        cellRendererParams: {
          ngTemplate: this.accordionButtonTemplate
        },
      };
      colDefs.unshift(accordionCell);
    }

    if (this.additionalButtonsTemplate_ && this.additionalButtonsTemplate_.length > 0) {
      for (let template of this.additionalButtonsTemplate_) {
        const actionButtonCell: ColDef = {
          ...SPECIAL_TOOL_CELL,
          cellRenderer: 'templateRenderer',
          cellRendererParams: {
            ngTemplate: template
          },
        };

        colDefs.unshift(actionButtonCell);
      }
    }

    if (this.actionButtonTemplate_) {
      const actionButtonCell: ColDef = {
        ...SPECIAL_TOOL_CELL,
        pinned: this.actionButtonTemplateRight_ ? 'right' : true,
        cellRenderer: 'templateRenderer',
        cellRendererParams: {
          ngTemplate: this.actionButtonTemplate_
        },
        cellClass: 'groot-action-button-cell',
      };

      colDefs.unshift(actionButtonCell);
    }

    this.gridOptions.columnDefs = colDefs;
    if (this.gridOptions.api) {
      this.translateHeaders();
    }
  }

  @Input() set savedColumnState(state: string | null) {
    this._savedColumnState = state;
    this.restoreColState();
  }

  private restoreColState() {
    if (this._savedColumnState && this.gridOptions.columnApi) {
      const parsedState = JSON.parse(this._savedColumnState);
      if (parsedState) {
        this.gridOptions.columnApi.setColumnState(parsedState);
      }
    }
  }

  get getRowStyle(): (rowNode: RowNode) => any {
    return this._getRowStyle;
  }

  @Input()
  set getRowStyle(value: (rowNode: RowNode) => any) {
    this._getRowStyle = value;
    if (this.gridOptions) {
      this.gridOptions.getRowStyle = this.getRowStyle;
    }
  }

  get getRowClass(): (rowNode: RowNode) => any {
    return this._getRowClass;
  }

  @Input()
  set getRowClass(value: (rowNode: RowNode) => any) {
    this._getRowClass = value;
    if (this.gridOptions) {
      this.gridOptions.getRowClass = this._getRowClass;
    }
  }

  public data: PaginatedResponse<T> = null;
  public gridOptions: GridOptions = {
    defaultColDef: {
      filter: false,
      sortable: true,
      resizable: true,
    },
    columnDefs: [],
    frameworkComponents: {
      GrootAgGridNoRowsOverlayComponent,
      GrootAgGridLoadingOverlayComponent,
      dateRenderer: GrootAgGridRendererDateComponent,
      numbersRenderer: GrootAgGridRendererNumbersComponent,
      templateRenderer: GrootAgGridRendererTemplateComponent,
      headerTemplateRenderer: GrootAgGridHeaderTemplateComponent,

      // The registered components
      ...this.grootAgGridCustomizationService.frameworkComponents,
      ...this.grootAgGridCustomizationService.overlays,
    },
    isFullWidthCell: rowNode => rowNode.data && rowNode.data.$isAccordionRow,
    fullWidthCellRenderer: 'templateRenderer',
    fullWidthCellRendererParams: {
      ngTemplate: null,
    },
    getRowHeight: (rowNode: RowNode) => {
      if (this.getRowHeight) {
        const result = this.getRowHeight(rowNode);
        if (result !== null && result !== undefined) {
          return result;
        }
      }
      return rowNode.data && rowNode.data.$isAccordionRow ? this._accordionHeight : this.rowHeight;
    },
    rowClassRules: {
      'accordion-row': rowNode => rowNode.data && rowNode.data.$isAccordionRow,
      'accordion-expanded': rowNode => rowNode.data && rowNode.data.$showingAccordion,
    },
    suppressCellSelection: true,
    enableCellTextSelection: true,
    suppressScrollOnNewData: true,
  };
  public noRowsOverlayComponentParams: GrootAgGridNoRowsParams = {loadingError: false};
  private labelSub: Subscription;
  private _currentPageNum = 0;
  private sorting: SortPagination;
  private _savedColumnState: string | null = null;
  private accordionTemplate_: TemplateRef<any>;
  private actionButtonTemplate_: TemplateRef<any>;
  private actionButtonTemplateRight_: boolean;
  private additionalButtonsTemplate_: TemplateRef<any>[];
  private checkboxSelection_ = false;
  private columnDefs_: ColDef[];
  private rowsDisplayed: T[] = [];
  private _accordionHeight = 60;
  private _getRowStyle: ((rowNode: RowNode) => any) = null;
  private _getRowClass: ((rowNode: RowNode) => any) = null;
  @ViewChild('accordionButtonTemplate') accordionButtonTemplate: TemplateRef<any>;

  @Input() set accordionHeight(value: number) {
    this._accordionHeight = value;
    this.reloadTable();
  }

  get accordionHeight(): number {
    return this._accordionHeight;
  }

  constructor(private translate: TranslateService,
              private grootAgGridCustomizationService: GrootAgGridCustomizationService) {
  }

  ngOnInit(): void {
    if (!this.gridHeightCss) {
      this.gridOptions.domLayout = 'autoHeight';
    }

    if (this.keepServerSorting) {
      this.gridOptions.defaultColDef.comparator = this.keepServerSort;
    }

    if (this.rowClassRules) {
      this.gridOptions.rowClassRules = {
        ...this.gridOptions.rowClassRules,
        ...this.rowClassRules
      };
    }

    this.resetDefaultSorting();
    this.translateHeaders();
  }

  private keepServerSort(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) {
    return 0;
  }

  private resetDefaultSorting() {
    this.sorting = {sortField: this.defaultSortColumn, sortReversed: this.defaultSortReverseFlag};
  }

  private translateHeaders() {
    if (!this.gridOptions.columnDefs || !this.gridOptions.columnDefs.length) {
      return;
    }

    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }

    const labelKeys = this.gridOptions.columnDefs
      .filter((col: ColDef) => this.getColumnLabel(col))
      .map((col: ColDef) => this.getColumnLabel(col));
    if (labelKeys.length > 0) {
      this.labelSub = this.translate.stream(labelKeys)
        .subscribe(labels => {
          this.gridOptions.columnDefs.forEach((col: ColDef, i) => {
            const label = this.getColumnLabel(col);
            if (!label) {
              return;
            }

            if (Array.isArray(labels)) {
              col.headerName = labels[i];
            } else {
              const value = labels[this.getColumnLabel(col)];
              if (value) {
                col.headerName = value;
              }
            }
          });
          if (this.gridOptions.api) {
            // Update labels in the grid
            this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs);
          }
        });
    } else {
      if (this.gridOptions.api) {
        this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs);
      }
    }
  }

  private getColumnLabel(col: ColDef): string {
    if (col.headerName !== undefined) {
      return col.headerName;
    } else if (col.colId) {
      return this.labelPrefix + col.colId;
    } else {
      return null;
    }
  }

  ngOnDestroy(): void {
    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }
  }

  onPageChanged(pageNum: number) {
    this._currentPageNum = pageNum;
    this.reloadTable(false);
  }

  gridReady() {
    this.gridOptions.api.setSortModel(toSortModel(this.sorting));
    this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs); // Update labels
    this.restoreColState();
    this.agGridReady.next(this.gridOptions.api);
  }

  onSortChanged() {
    const sortModel = this.gridOptions.api.getSortModel()[0];
    if (!sortModel) {
      this.resetDefaultSorting();
    } else {
      this.sorting = toSortPagination(sortModel);
    }

    this.reloadTable(false);
  }

  firstDataRendered() {
    this.gridOptions.columnApi.autoSizeAllColumns();
  }

  reloadTable(resetPageNumber = false, resetSortField = false) {
    if (!this.sorting) {
      // Before our ngOnInit
      return;
    }

    if (resetPageNumber) {
      this._currentPageNum = 0;
    }

    if (resetSortField) {
      this.resetDefaultSorting();
    }

    if (this.gridOptions.api) {
      this.gridOptions.api.showLoadingOverlay();
    }
    this.search.emit(this.getCurrentPagination());
  }

  getCurrentPagination(): PaginationOptions {
    return {
      sortField: this.sorting.sortField || this.defaultSortColumn,
      sortReversed: this.sorting.sortReversed,
      pageNum: this._currentPageNum,
      pageLen: this.pageSize
    };
  }

  saveColumnOrder() {
    const state = this.gridOptions.columnApi.getColumnState();
    this.columnsStatusChanged.emit(JSON.stringify(state));
  }

  toggleAccordion(row, index) {
    row.$showingAccordion = !row.$showingAccordion;

    const selectedRows: RowNode[] = this.gridOptions.api.getSelectedNodes();

    if (row.$showingAccordion) {
      const accordionRow = {
        ...row,
        $isAccordionRow: true,
        $showingAccordion: false
      };

      this.rowsDisplayed = [
        ...this.rowsDisplayed.slice(0, index + 1),
        accordionRow,
        ...this.rowsDisplayed.slice(index + 1)];

    } else {
      this.rowsDisplayed.splice(index + 1, 1);
    }

    if (this.gridOptions.api) {
      this.gridOptions.api.setRowData(this.rowsDisplayed);
    }

    if (selectedRows) {
      if (row.$showingAccordion) {
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].rowIndex <= index) {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex, true, false);
          } else {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex + 1, true, false);
          }
        }
      } else {
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].rowIndex <= index) {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex, true, false);
          } else {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex - 1, true, false);
          }
        }
      }
    }

  }

  onScroll($event: Event) {
    this.bodyScroll.emit($event);
  }

  gridSelectionChanged() {
    if (this.gridOptions.api) {
      const rows = this.gridOptions.api.getSelectedRows();
      const indexes = this.gridOptions.api.getSelectedNodes().map(n => n.rowIndex);

      this.selectionChanged.next({rows, indexes});
    }
  }

  resetRowHeights() {
    if (this.gridOptions.api) {
      this.gridOptions.api.resetRowHeights();
    }
  }
}
