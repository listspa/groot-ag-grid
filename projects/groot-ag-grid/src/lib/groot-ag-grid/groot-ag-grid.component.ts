import {Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  GrootTableTitleRightAreaDirective,
  isLoadingFailed,
  LoadingFailed,
  PaginatedResponse,
  SortPagination
} from '@listgroup/groot';
import {
  CellClickedEvent,
  CellMouseDownEvent,
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  IsRowSelectable,
  RowDragEndEvent,
  RowDragEnterEvent,
  RowDragLeaveEvent,
  RowDragMoveEvent,
  RowNode
} from 'ag-grid-community';
import {TranslateService} from '@ngx-translate/core';
import {GrootAgGridNoRowsOverlayComponent, GrootAgGridNoRowsParams} from './groot-ag-grid-no-rows-overlay/groot-ag-grid-no-rows-overlay.component';
import {GrootAgGridLoadingOverlayComponent} from './groot-ag-grid-loading-overlay/groot-ag-grid-loading-overlay.component';
import {GrootAgGridRendererBooleansComponent} from './groot-ag-grid-renderer-booleans/groot-ag-grid-renderer-booleans.component';
import {GrootAgGridRendererDatesComponent} from './groot-ag-grid-renderer-dates/groot-ag-grid-renderer-dates.component';
import {GrootAgGridRendererNumbersComponent} from './groot-ag-grid-renderer-numbers/groot-ag-grid-renderer-numbers.component';
import {GrootAgGridRendererTemplateComponent} from './groot-ag-grid-renderer-template/groot-ag-grid-renderer-template.component';
import {GrootAgGridHeaderTemplateComponent} from './groot-ag-grid-header-template/groot-ag-grid-header-template.component';
import {GrootAgGridCustomizationService} from './groot-ag-grid-customization.service';
import {GrootAgGridSelection} from './groot-ag-grid-selection.model';
import {isNoGridDataMessage, NoGridDataMessage} from './no-grid-data.model';
import {AgGridAngular} from 'ag-grid-angular';
import {
  TablePaginationComponent
} from '@listgroup/groot/lib/groot-base/components/tables/table-pagination/table-pagination.component';
import {MultiSortPaginationOptions} from './groot-ag-grid-pagination.model';

const SPECIAL_TOOL_CELL: ColDef = {
  resizable: false,
  pinned: true,
  sortable: false,
  suppressMenu: true,
  suppressMovable: true,
  suppressColumnsToolPanel: true,
  maxWidth: 30,
  width: 30,
};

export declare type GetDataPath = (data: any) => string[];

@Component({
  selector: 'groot-ag-grid',
  templateUrl: './groot-ag-grid.component.html',
})
export class GrootAgGridComponent<T> implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<MultiSortPaginationOptions>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() cellMiddleClicked = new EventEmitter<CellClickedEvent>();
  @Output() columnsStatusChanged = new EventEmitter<string>();
  @Output() bodyScroll = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<GrootAgGridSelection<T>>();
  @Output() agGridReady = new EventEmitter<GridApi>();

  @Input() disableSorting = false;
  /**
   * @deprecated please use defaultSort which supports multiple column sorting
   */
  @Input() defaultSortColumn: string;
  /**
   * @deprecated please use defaultSort which supports multiple column sorting
   */
  @Input() defaultSortReverseFlag = false;
  @Input() defaultSort: SortPagination[];
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
  @Input() keepServerSorting: boolean = null;
  @Input() rowClassRules?: { [cssClassName: string]: (((params: any) => boolean) | string) } | null = null;
  @ContentChild(GrootTableTitleRightAreaDirective, {read: TemplateRef}) tableTitleRightArea: TemplateRef<any> | null = null;
  @Input() showPaginationIfEmpty = this.grootAgGridCustomizationService.showPaginationIfEmptyDefault;
  @Input() singleRowSelection = false;
  @Input() rowMultiSelectWithClick = false;
  @Input() titleLabel = 'common.searchResults';
  @Input() suppressRowTransform = false;
  @Input() modules: Array<any> = null;
  @Input() autoGroupColumnDef: ColDef = null;
  @Input() groupMultiAutoColumn = false;
  @Input() suppressAggFuncInHeader = false;
  @Input() getRowNodeId: any = null;
  @Output() rowDragEnter = new EventEmitter<RowDragEnterEvent>();
  @Output() rowDragEnd = new EventEmitter<RowDragEndEvent>();
  @Output() rowDragMove = new EventEmitter<RowDragMoveEvent>();
  @Output() rowDragLeave = new EventEmitter<RowDragLeaveEvent>();

  @Input() set searchResultsData(searchResultsData: PaginatedResponse<T> | NoGridDataMessage | LoadingFailed | null | undefined) {
    if (isNoGridDataMessage(searchResultsData)) {
      this.noRowsOverlayComponentParams.loadingError = false;
      this.noRowsOverlayComponentParams.message = searchResultsData.message;
      this.noRowsOverlayComponentParams.style = searchResultsData.style;
      this.data = null;
      this.rowsDisplayed = [];
    } else if (isLoadingFailed(searchResultsData)) {
      this.noRowsOverlayComponentParams.loadingError = true;
      this.noRowsOverlayComponentParams.message = null;
      this.noRowsOverlayComponentParams.style = null;
      this.data = null;
      this.rowsDisplayed = [];
    } else {
      this.noRowsOverlayComponentParams.loadingError = false;
      this.noRowsOverlayComponentParams.message = null;
      this.noRowsOverlayComponentParams.style = null;
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

    this.setDefaultColComparator();
  }

  /**
   * Note: the columns must have set colId to the name of the database column.
   */
  @Input() set columnDefs(columnDefs: (ColDef | ColGroupDef)[]) {
    this.columnDefs_ = columnDefs;
    this.handleSpecialColumns();
  }

  @Input() set accordionTemplate(template: TemplateRef<any> | null) {
    this.accordionTemplate_ = template;
    this.gridOptions.fullWidthCellRendererParams.ngTemplate = template;
    this.gridOptions.isRowSelectable = row => !row.data.$isAccordionRow && this._isRowSelectable(row);
    this.handleSpecialColumns();
  }

  @Input() set actionButtonTemplate(template: TemplateRef<any> | null) {
    this.actionButtonTemplate_ = template;
    this.handleSpecialColumns();
  }

  @Input() set actionButtonTemplateRight(right: boolean) {
    this.actionButtonTemplateRight_ = right;
    this.handleSpecialColumns();
  }

  @Input() set additionalButtonsTemplate(template: TemplateRef<any> | TemplateRef<any>[] | null) {
    if (Array.isArray(template)) {
      this.additionalButtonsTemplate_ = template;
    } else {
      this.additionalButtonsTemplate_ = [template];
    }
    this.handleSpecialColumns();
  }

  @Input() set checkboxSelection(enable: boolean) {
    this.checkboxSelection_ = enable;
    this.handleSpecialColumns();
  }

  get checkboxSelection(): boolean {
    return this.checkboxSelection_;
  }

  @Input() set headerCheckboxSelection(value: boolean | ((params: any) => boolean)) {
    this.headerCheckboxSelection_ = value;
    this.handleSpecialColumns();
  }

  get headerCheckboxSelection(): boolean | ((params: any) => boolean) {
    return this.headerCheckboxSelection_;
  }

  private handleSpecialColumns(): void {
    const colDefs = this.columnDefs_ ? [...this.columnDefs_] : [];

    if (this.checkboxSelection_) {
      const checkboxCell: ColDef = {
        ...SPECIAL_TOOL_CELL,
        checkboxSelection: true,
        headerCheckboxSelection: this.headerCheckboxSelection_,
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
        cellClass: 'groot-accordion-icon-cell',
      };
      colDefs.unshift(accordionCell);
    }

    if (this.additionalButtonsTemplate_ && this.additionalButtonsTemplate_.length > 0) {
      for (const template of this.additionalButtonsTemplate_) {
        const actionButtonCell: ColDef = {
          ...SPECIAL_TOOL_CELL,
          cellRenderer: 'templateRenderer',
          cellRendererParams: {
            ngTemplate: template
          },
          cellClass: 'groot-additional-buttons-cell',
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
      this.gridOptions.api.redrawRows();
    }
  }

  @Input() set savedColumnState(state: string | null) {
    this._savedColumnState = state;
    this.restoreColState();
  }

  private restoreColState(): void {
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

  /**
   * -1:  expand all row groups
   * 0:   no groups are expanded (default)
   * 1:   first row group will be expanded
   */
  @Input()
  set groupDefaultExpanded(value: number) {
    this.groupExpanded = value;
    if (this.gridOptions) {
      this.gridOptions.groupDefaultExpanded = this.groupExpanded;
    }
  }

  @Input()
  set rowDragManaged(value: boolean) {
    this._rowDragManaged = value;
    if (this.gridOptions) {
      this.gridOptions.rowDragManaged = this._rowDragManaged;
    }
  }

  @Input()
  set suppressMoveWhenRowDragging(value: boolean) {
    this._suppressMoveWhenRowDragging = value;
    if (this.gridOptions) {
      this.gridOptions.suppressMoveWhenRowDragging  = this._suppressMoveWhenRowDragging;
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

  @Input()
  set isRowSelectable(isRowSelectable: IsRowSelectable | null) {
    this._isRowSelectable = isRowSelectable || (() => true);
    if (this.gridOptions) {
      this.gridOptions.isRowSelectable = this._isRowSelectable;
    }
  }

  @Input()
  set getDataPath(fun: GetDataPath) {
    if (fun) {
      this.gridOptions.treeData = true;
      this.gridOptions.getDataPath = fun;
    } else {
      this.gridOptions.treeData = false;
      this.gridOptions.getDataPath = null;
    }
  }

  public data: PaginatedResponse<T> = null;
  private _isRowSelectable: IsRowSelectable = () => true;
  private groupExpanded = 0;
  private _rowDragManaged = false;
  private _suppressMoveWhenRowDragging = false;
  public gridOptions: GridOptions = {
    defaultColDef: {
      filter: false,
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    columnDefs: [],
    frameworkComponents: {
      GrootAgGridNoRowsOverlayComponent,
      GrootAgGridLoadingOverlayComponent,
      booleansRenderer: GrootAgGridRendererBooleansComponent,
      datesRenderer: GrootAgGridRendererDatesComponent,
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
    isRowSelectable: this._isRowSelectable,
    rowMultiSelectWithClick: false,
    applyColumnDefOrder: true,
    treeData: false,
    getDataPath: null,
    groupDefaultExpanded: this.groupExpanded,
    rowDragManaged: this._rowDragManaged,
    suppressMoveWhenRowDragging : this._suppressMoveWhenRowDragging
  };
  public noRowsOverlayComponentParams: GrootAgGridNoRowsParams = {loadingError: false, api: null};
  private labelSub: Subscription;
  private _currentPageNum = 0;
  private sorting: SortPagination[] | null;
  private _savedColumnState: string | null = null;
  private accordionTemplate_: TemplateRef<any>;
  private actionButtonTemplate_: TemplateRef<any>;
  private actionButtonTemplateRight_: boolean;
  private additionalButtonsTemplate_: TemplateRef<any>[];
  private checkboxSelection_ = false;
  private headerCheckboxSelection_: boolean | ((params: any) => boolean);
  private columnDefs_: (ColDef | ColGroupDef)[];
  private rowsDisplayed: T[] = [];
  private _accordionHeight = 60;
  private _getRowStyle: ((rowNode: RowNode) => any) = null;
  private _getRowClass: ((rowNode: RowNode) => any) = null;
  public alignedGridsComponents: AgGridAngular[] = [];
  @ViewChild('accordionButtonTemplate', {static: true}) accordionButtonTemplate: TemplateRef<any>;
  @ViewChild('grid', {static: true}) grid: AgGridAngular;
  @ViewChild('gridPagination', {static: true}) gridPagination: TablePaginationComponent;
  private _initialized = false;
  public isGridReady = false;

  @Input() set accordionHeight(value: number) {
    this._accordionHeight = value;
    this.reloadTable();
  }

  get accordionHeight(): number {
    return this._accordionHeight;
  }

  @Input()
  set alignedGrids(value: GrootAgGridComponent<any>[]) {
    if (!value) {
      this.alignedGridsComponents = [];
    } else {
      this.alignedGridsComponents = value.map(v => v.grid);
    }
  }

  constructor(private translate: TranslateService,
              private grootAgGridCustomizationService: GrootAgGridCustomizationService) {
  }

  ngOnInit(): void {
    if (!this.gridHeightCss) {
      this.gridOptions.domLayout = 'autoHeight';
    }

    if (this.rowClassRules) {
      this.gridOptions.rowClassRules = {
        ...this.gridOptions.rowClassRules,
        ...this.rowClassRules
      };
    }

    this.resetDefaultSorting();
    this.translateHeaders();
    this._initialized = true;
  }

  private resetDefaultSorting(): void {
    if (this.gridOptions.defaultColDef) {
      this.gridOptions.defaultColDef.sortable = !this.disableSorting;
    }
    this.sorting = this.defaultSort ?? (
      this.defaultSortColumn ? [{sortField: this.defaultSortColumn, sortReversed: this.defaultSortReverseFlag}] : null);
    this.setSorting();
  }

  private translateHeaders(): void {
    if (!this.gridOptions.columnDefs || !this.gridOptions.columnDefs.length) {
      return;
    }

    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }

    const columnState = this.gridOptions.api ? this.gridOptions.columnApi.getColumnState() : null;
    const labelKeys: string[] = [];
    this.gridOptions.columnDefs.forEach((col: ColDef | ColGroupDef) => {
      if ('children' in col) {
        col.children.forEach(child => {
          labelKeys.push(this.getColumnLabel(child));
        });
      }
      labelKeys.push(this.getColumnLabel(col));
    });
    if (labelKeys.length > 0) {
      this.labelSub = this.translate.stream(labelKeys)
        .subscribe(labels => {
          this.gridOptions.columnDefs.forEach((col: ColDef | ColGroupDef, i) => {
            if ('children' in col) {
              col.children.forEach(child => {
                this.getTranslationForLeafColumn(child, labels, i);
              });
            }
            this.getTranslationForLeafColumn(col, labels, i);
          });
          if (this.gridOptions.api) {
            // Update labels in the grid
            this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs);
            this.gridOptions.columnApi.applyColumnState({state: columnState});
          }
        });
    } else {
      if (this.gridOptions.api) {
        this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs);
        this.gridOptions.columnApi.applyColumnState({state: columnState});
      }
    }
  }

  private getTranslationForLeafColumn(child: ColDef | ColGroupDef, labels, i: number): void {
    const label = this.getColumnLabel(child);
    if (!label) {
      return;
    }

    if (Array.isArray(labels)) {
      child.headerName = labels[i];
    } else {
      const value = labels[this.getColumnLabel(child)];
      if (value) {
        child.headerName = value;
      }
    }
  }

  private getColumnLabel(col: ColDef | ColGroupDef): string {
    if (col.headerName !== undefined) {
      return col.headerName;
    } else if ('colId' in col && col.colId) {
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

  onPageChanged(pageNum: number): void {
    this._currentPageNum = pageNum;
    this.reloadTable(false);
  }

  gridReady(): void {
    this.isGridReady = true;
    this.gridOptions.api.setColumnDefs(this.gridOptions.columnDefs); // Update labels
    this.restoreColState();
    const sortingSet = this.setSorting();
    this.agGridReady.next(this.gridOptions.api);

    // Avoid reloading if we changed the sort - if we did, we will receive an `onSortChange` event
    if (!sortingSet) {
      this.reloadTable(true);
    }
  }

  private setSorting(): boolean {
    if (!this.disableSorting && this.sorting && this.gridOptions.columnApi) {
      const columns = this.gridOptions.columnApi.getAllColumns();
      const sortingState = this.sorting
        .filter(s => columns.some(col => s.sortField === col.getColId()))
        .map((s, i) => ({
          colId: s.sortField,
          sort: s.sortReversed ? 'desc' : 'asc',
          sortIndex: i
        }));
      this.gridOptions.columnApi.applyColumnState( {
        state: sortingState,
        defaultState: { sort: null },
      });
      return sortingState.length > 0;
    }
    return false;
  }

  onSortChanged(): void {
    this.sorting = this.gridOptions.columnApi.getColumnState()
      .filter(col => col.sort)
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map(col => ({
        sortField: col.colId,
        sortReversed: col.sort === 'desc'
      }));

    if (this.sorting.length === 0) {
      this.resetDefaultSorting();
    }

    if (!this.data || this.isSortedServerSide()) {
      this.reloadTable(false);
    }
  }

  firstDataRendered(): void {
    this.autoSizeColumns();
  }

  autoSizeColumns(): void {
    this.gridOptions.columnApi.autoSizeAllColumns();
  }

  reloadTable(resetPageNumber = false, resetSortField = false): void {
    if (!this._initialized) {
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

  getCurrentPagination(): MultiSortPaginationOptions {
    return {
      sort: this.sorting,
      ...(this.sorting?.length > 0 ? this.sorting[0] : {sortField: null, sortReversed: false}),
      pageNum: this._currentPageNum,
      pageLen: this.pageSize
    };
  }

  saveColumnOrder(): void {
    const state = this.gridOptions.columnApi.getColumnState();
    this.columnsStatusChanged.emit(JSON.stringify(state));
  }

  toggleAccordion(row, index): void {
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
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < selectedRows.length; i++) {
          if (selectedRows[i].rowIndex <= index) {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex, true, false);
          } else {
            this.gridOptions.api.selectIndex(selectedRows[i].rowIndex + 1, true, false);
          }
        }
      } else {
        // tslint:disable-next-line:prefer-for-of
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

  onScroll($event: Event): void {
    this.bodyScroll.emit($event);
  }

  gridSelectionChanged(): void {
    if (this.gridOptions.api) {
      const rows = this.gridOptions.api.getSelectedRows();
      const indexes = this.gridOptions.api.getSelectedNodes().map(n => n.rowIndex);

      this.selectionChanged.next({rows, indexes});
    }
  }

  resetRowHeights(): void {
    if (this.gridOptions.api) {
      this.gridOptions.api.resetRowHeights();
    }
  }

  clearSelection(): void {
    if (this.gridOptions.api) {
      this.gridOptions.api.deselectAll();
    }
  }

  cellMouseDown(event: CellMouseDownEvent): void {
    if (!event) {
      return;
    }

    const ev = event.event as MouseEvent;
    if (ev.button === 1) {      // Middle button click
      event.event.preventDefault();
      event.event.stopImmediatePropagation();

      this.cellMiddleClicked.next(event);
    }
  }

  onRowDragEnter($event: RowDragEnterEvent): void {
    this.rowDragEnter.emit($event);
  }

  onRowDragEnd($event: RowDragEndEvent): void {
    this.rowDragEnd.emit($event);
  }

  onRowDragMove($event: RowDragMoveEvent): void {
    this.rowDragMove.emit($event);
  }

  onRowDragLeave($event: RowDragLeaveEvent): void {
    this.rowDragLeave.emit($event);
  }

  private setDefaultColComparator(): void {
    let comparator = null;
    if (this.isSortedServerSide()) {
      comparator = () => 0;
    }
    this.columnDefs_.forEach(
      (column, index) => {
        this.columnDefs_[index] = {...column, comparator};
      }
    );
    if (this.gridOptions.api) {
      this.gridOptions.api.setColumnDefs(this.columnDefs_);
    }
  }

  isPaginated(): boolean {
    return this.data && (this.showPaginationIfEmpty || (this.data.totalNumRecords > 0 && this.data.totalNumRecords > this.data.pageLen)
      || this.data.totalNumRecords === -1);
  }

  private isSortedServerSide(): boolean {
    return (this.keepServerSorting === null && this.isPaginated()) || this.keepServerSorting;
  }
}
