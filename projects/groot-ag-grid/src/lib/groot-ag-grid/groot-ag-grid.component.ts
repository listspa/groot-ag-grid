import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  GrootTableTitleRightAreaDirective,
  isLoadingFailed,
  LoadingFailed,
  PaginatedResponse,
  SortPagination
} from '@listgroup/groot';
import {
  BodyScrollEvent,
  CellClickedEvent,
  CellMouseDownEvent,
  ColDef,
  ColGroupDef,
  ColumnState,
  GetDataPath,
  GetRowIdFunc,
  GridApi,
  GridOptions,
  IRowNode,
  IDatasource,
  IGetRowsParams,
  IsRowSelectable,
  Module,
  RowClassParams,
  RowDragEndEvent,
  RowDragEnterEvent,
  RowDragLeaveEvent,
  RowDragMoveEvent,
  RowGroupingDisplayType,
  RowHeightParams,
  RowStyle,
  GridReadyEvent,
  Column, AlignedGrid
} from 'ag-grid-community';
import {TranslateService} from '@ngx-translate/core';
import {
  GrootAgGridNoRowsOverlayComponent,
  GrootAgGridNoRowsParams
} from './groot-ag-grid-no-rows-overlay/groot-ag-grid-no-rows-overlay.component';
import {
  GrootAgGridLoadingOverlayComponent
} from './groot-ag-grid-loading-overlay/groot-ag-grid-loading-overlay.component';
import {
  GrootAgGridRendererBooleansComponent
} from './groot-ag-grid-renderer-booleans/groot-ag-grid-renderer-booleans.component';
import {GrootAgGridRendererDatesComponent} from './groot-ag-grid-renderer-dates/groot-ag-grid-renderer-dates.component';
import {
  GrootAgGridRendererNumbersComponent
} from './groot-ag-grid-renderer-numbers/groot-ag-grid-renderer-numbers.component';
import {
  GrootAgGridRendererTemplateComponent
} from './groot-ag-grid-renderer-template/groot-ag-grid-renderer-template.component';
import {
  GrootAgGridHeaderTemplateComponent
} from './groot-ag-grid-header-template/groot-ag-grid-header-template.component';
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
  lockPinned: true,
  lockPosition: true,
  sortable: false,
  suppressHeaderMenuButton: true,
  suppressMovable: true,
  suppressColumnsToolPanel: true,
  maxWidth: 30,
  width: 30,
};

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
  @Input() getRowHeight: ((rowNode: RowHeightParams) => number | null) = null;
  @Input() keepServerSorting: boolean = null;
  @Input() rowClassRules?: { [cssClassName: string]: (((params: any) => boolean) | string) } | null = null;
  @ContentChild(GrootTableTitleRightAreaDirective, {read: TemplateRef}) tableTitleRightArea: TemplateRef<any> | null = null;
  @Input() showPaginationIfEmpty = this.grootAgGridCustomizationService.showPaginationIfEmptyDefault;
  @Input() singleRowSelection = false;
  @Input() rowMultiSelectWithClick = false;
  @Input() titleLabel = 'common.searchResults';
  @Input() suppressRowTransform = false;
  @Input() modules: Array<Module> = null;
  @Input() autoGroupColumnDef: ColDef = null;
  @Input() groupMultiAutoColumn = false;
  @Input() groupDisplayType: RowGroupingDisplayType | undefined = this.groupMultiAutoColumn ? 'multipleColumns' : 'singleColumn';
  @Input() suppressAggFuncInHeader = false;
  @Input() getRowId: GetRowIdFunc | undefined;
  /**
   * @deprecated AG-6394 - gridOptions.immutableData and gridOptions.getRowNodeId() are deprecated.
   * Instead, implement getRowId(), and the grid will then also treat the data as immutable data automatically.
   * https://www.ag-grid.com/changelog/?fixVersion=27.1.0
   */
  @Input() getRowNodeId: any = null;
  @Input() disableAutosize = false;
  @Input() defaultClass = 'ag-theme-balham ag-grid-rows-clickable';
  @Input() disablePagination = false;
  @Input() infiniteScroll = false;

  @Input() columnsForAutoSize: (string | ColDef | Column)[] = [];
  @Input() skipHeaderForAutoSize = false;

  @Output() rowDragEnter = new EventEmitter<RowDragEnterEvent>();
  @Output() rowDragEnd = new EventEmitter<RowDragEndEvent>();
  @Output() rowDragMove = new EventEmitter<RowDragMoveEvent>();
  @Output() rowDragLeave = new EventEmitter<RowDragLeaveEvent>();

  successCallback: (rowsThisBlock: any[], lastRow?: number) => void;
  private treeData = false;
  private _getDataPath: GetDataPath = undefined;
  private _defaultColDef: ColDef<T> = {
    filter: false,
    sortable: true,
    resizable: true,
    lockPinned: true,
    autoHeaderHeight: true,
    wrapHeaderText: true
  };

  @Input() set defaultColDef(defaultColDef: ColDef<T>) {
    if (defaultColDef) {
      this._defaultColDef = {...defaultColDef};
      this.api?.setGridOption('defaultColDef', this._defaultColDef);
      this.handleSpecialColumns();
    }
  }

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
      this.rowsDisplayed = this.data?.records || [];
    }

    if (this.api) {
      this.api.hideOverlay();
      if (this.gridOptions.rowModelType === 'infinite') {
        if (this.successCallback) { // avoid first invocation, when successCallback is not set already
          // set lastRow only in the last page to avoid having a little scrollbar with no data available
          if ((this.data.pageNum + 1) * this.data.pageLen >= this.data.totalNumRecords) {
            this.successCallback(this.rowsDisplayed, this.data.totalNumRecords);
          } else {
            this.successCallback(this.rowsDisplayed, null);
          }
        }
      } else {
        this.setDefaultColComparator();
        this.api.setGridOption('rowData', this.rowsDisplayed);
      }

      if (this.rowsDisplayed?.length <= 0) {
        this.api.showNoRowsOverlay();
      }
    }
  }

  private getDatasource(grootAgGrid: GrootAgGridComponent<any>): IDatasource {

    return new class implements IDatasource {
      getRows(params: IGetRowsParams): void {
        grootAgGrid.successCallback = params.successCallback;
        grootAgGrid.onPageChanged(params.startRow / grootAgGrid.pageSize);
      }
    }();
  }

  /**
   * Note: the columns must have set colId to the name of the database column.
   */
  @Input() set columnDefs(columnDefs: (ColDef | ColGroupDef)[]) {
    this.columnDefs_ = columnDefs ?? [];
    this.handleSpecialColumns();
  }

  @Input() set defaultSort(defaultSort: SortPagination[]) {
    this._defaultSort = defaultSort;
    this.handleSpecialColumns();
  }

  @Input() set accordionTemplate(ngTemplate: TemplateRef<any> | null) {
    this.accordionTemplate_ = ngTemplate;
    this.api?.setGridOption('fullWidthCellRendererParams', {ngTemplate});
    this.api?.setGridOption('isRowSelectable', row => !row.data?.$isAccordionRow && this._isRowSelectable(row));
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

    if (this.additionalButtonsTemplate_?.length > 0) {
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

    // handle sort order of default column
    let colId: string;
    if ((this._defaultSort && this._defaultSort.length === 1)) {
      colId = this._defaultSort[0].sortField;
    } else if (this.defaultSortColumn && this.defaultSortReverseFlag) {
      colId = this.defaultSortColumn;
    }
    if (colId) {
      this.setSortingOrderInDefaultColId(colDefs, colId);
    }

    if (this.api) {
      this.api.setGridOption('columnDefs', colDefs);
      this.translateHeaders();
      this.api.redrawRows();
    }
  }

  setSortingOrderInDefaultColId(colDefs: (ColDef | ColGroupDef)[], colId: string): void {
    for (const colDef of colDefs) {
      if ((colDef as ColDef).colId === colId) {
        // If colDef is a ColDef, check if its colId matches and apply sortingOrder, if not already set
        if (!(colDef as ColDef).sortingOrder) {
          (colDef as ColDef).sortingOrder = ['asc', 'desc'];
        }
        return;
      } else if ((colDef as ColGroupDef).children) {
        // If colDef is a ColGroupDef, recursively search its children
        this.setSortingOrderInDefaultColId((colDef as ColGroupDef).children, colId);
      }
    }
  }

  @Input() set savedColumnState(state: string | null) {
    this._savedColumnState = state;
    this.restoreColState();
  }

  private restoreColState(): void {
    if (this._savedColumnState && this.api) {
      const parsedState = JSON.parse(this._savedColumnState);
      if (parsedState) {
        this.api.applyColumnState(parsedState);
      }
    }
  }

  get getRowStyle(): (rowNode: RowClassParams) => RowStyle {
    return this._getRowStyle;
  }

  @Input()
  set getRowStyle(value: (rowNode: RowClassParams) => RowStyle) {
    this._getRowStyle = value;
    this.api?.setGridOption('getRowStyle', value);
  }

  /**
   * -1:  expand all row groups
   * 0:   no groups are expanded (default)
   * 1:   first row group will be expanded
   */
  @Input()
  set groupDefaultExpanded(value: number) {
    this.groupExpanded = value;
    this.api?.setGridOption('groupDefaultExpanded', value);
  }

  @Input()
  set rowDragManaged(value: boolean) {
    this._rowDragManaged = value;
    this.api?.setGridOption('rowDragManaged', value);
  }

  @Input()
  set suppressMoveWhenRowDragging(value: boolean) {
    this._suppressMoveWhenRowDragging = value;
    this.api?.setGridOption('suppressMoveWhenRowDragging', value);
  }

  get getRowClass(): (rowNode: RowClassParams) => string | string[] {
    return this._getRowClass;
  }

  @Input()
  set getRowClass(value: (rowNode: RowClassParams) => string | string[]) {
    this._getRowClass = value;
    this.api?.setGridOption('getRowClass', value);
  }

  @Input()
  set isRowSelectable(value: IsRowSelectable | null) {
    this._isRowSelectable = value || (() => true);
    this.api?.setGridOption('isRowSelectable', this._isRowSelectable);
  }

  @Input()
  set getDataPath(fun: GetDataPath) {
    if (fun) {
      this.treeData = true;
      this._getDataPath = fun;
      this.api?.setGridOption('treeData', this.treeData);
      this.api?.setGridOption('getDataPath', this._getDataPath);
    }
  }

  @Input()
  set lockPinned(lockPinned: boolean) {
    this._defaultColDef.lockPinned = lockPinned;
    this.api?.setGridOption('defaultColDef', this._defaultColDef);
    this.handleSpecialColumns();
  }

  private _defaultSort: SortPagination[];
  public data: PaginatedResponse<T> = null;
  private _isRowSelectable: IsRowSelectable = () => true;
  private groupExpanded = 0;
  private _rowDragManaged = false;
  private _suppressMoveWhenRowDragging = false;
  public gridOptions: GridOptions;
  public noRowsOverlayComponentParams: GrootAgGridNoRowsParams = {loadingError: false, api: null, columnApi: undefined, context: undefined};
  private labelSub: Subscription;
  private _currentPageNum = 0;
  private sorting: SortPagination[] | null;
  private _savedColumnState: string | null = null;
  private accordionTemplate_: TemplateRef<any> = null;
  private actionButtonTemplate_: TemplateRef<any>;
  private actionButtonTemplateRight_: boolean;
  private additionalButtonsTemplate_: TemplateRef<any>[];
  private checkboxSelection_ = false;
  private headerCheckboxSelection_: boolean | ((params: any) => boolean);
  private columnDefs_: (ColDef | ColGroupDef)[] = [];
  private rowsDisplayed: T[] = [];
  private _accordionHeight = 60;
  private _getRowStyle: ((rowNode: RowClassParams) => RowStyle) = null;
  private _getRowClass: ((rowNode: RowClassParams) => string | string[]) = null;
  private _alignedGrids: () => AlignedGrid[] = () => [];
  @ViewChild('accordionButtonTemplate', {static: true}) accordionButtonTemplate: TemplateRef<any>;
  @ViewChild('grid', {static: true}) grid: AgGridAngular;
  @ViewChild('gridPagination', {static: true}) gridPagination: TablePaginationComponent;
  _initialized = false;
  public isGridReady = false;
  public api: GridApi;

  @Input() set accordionHeight(value: number) {
    this._accordionHeight = value;
    this.api?.setGridOption('getRowHeight', (rowHeightParams: RowHeightParams): number => {
      if (this.getRowHeight) {
        const result = this.getRowHeight(rowHeightParams);
        if (result !== null && result !== undefined) {
          return result;
        }
      }
      return rowHeightParams.data?.$isAccordionRow ? this._accordionHeight : this.rowHeight;
    });
    this.reloadTable(this.infiniteScroll);
  }

  get accordionHeight(): number {
    return this._accordionHeight;
  }

  @Input()
  set alignedGrids(grids: GrootAgGridComponent<any>[]) {
    this._alignedGrids = () => (grids || []).map(el => el?.api ?? null);
  }

  get alignedGrids(): () => AlignedGrid[] {
    return this._alignedGrids;
  }

  constructor(private translate: TranslateService,
              private grootAgGridCustomizationService: GrootAgGridCustomizationService) {
  }

  ngOnInit(): void {
    let rowClassRules = {
      'accordion-row': rowNode => rowNode.data?.$isAccordionRow,
      'accordion-expanded': rowNode => rowNode.data?.$showingAccordion,
    };
    if (this.rowClassRules) {
      rowClassRules = {
        ...rowClassRules,
        ...this.rowClassRules
      };
    }

    this.gridOptions = {
      defaultColDef: this._defaultColDef,
      columnDefs: this.columnDefs_ ?? [],
      components: {
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
      isFullWidthRow: params => params.rowNode?.data?.$isAccordionRow,
      fullWidthCellRenderer: 'templateRenderer',
      fullWidthCellRendererParams: {
        ngTemplate: this.accordionTemplate_,
      },
      getRowHeight: (rowHeightParams: RowHeightParams): number => {
        if (this.getRowHeight) {
          const result = this.getRowHeight(rowHeightParams);
          if (result !== null && result !== undefined) {
            return result;
          }
        }
        return rowHeightParams.data?.$isAccordionRow ? this._accordionHeight : this.rowHeight;
      },
      rowClassRules,
      suppressCellFocus: true,
      enableCellTextSelection: true,
      suppressScrollOnNewData: true,
      isRowSelectable: row => !row.data?.$isAccordionRow && this._isRowSelectable(row),
      rowMultiSelectWithClick: false,
      treeData: this.treeData,
      getDataPath: this._getDataPath,
      groupDefaultExpanded: !this.infiniteScroll ? this.groupExpanded : undefined,
      rowDragManaged: this._rowDragManaged,
      suppressMoveWhenRowDragging: this._suppressMoveWhenRowDragging,
      rowModelType: this.infiniteScroll ? 'infinite' : 'clientSide',
      cacheBlockSize: this.infiniteScroll ? this.pageSize : undefined,
      datasource: this.infiniteScroll ? this.getDatasource(this) : undefined,
      getRowClass: this._getRowClass,
      getRowStyle: this._getRowStyle,
      domLayout: this.gridHeightCss ? 'normal' : 'autoHeight',
      blockLoadDebounceMillis: 100
    };

    this.resetDefaultSorting();
    this._initialized = true;
  }

  private resetDefaultSorting(): void {
    if (this._defaultColDef.sortable !== !this.disableSorting) {
      this._defaultColDef.sortable = !this.disableSorting;
      this.api?.setGridOption('defaultColDef', this._defaultColDef);
    }
    this.sorting = this._defaultSort ?? (
      this.defaultSortColumn ? [{sortField: this.defaultSortColumn, sortReversed: this.defaultSortReverseFlag}] : null);
    this.setSorting();
  }

  private translateHeaders(): void {
    const columnDefs = this.api.getGridOption('columnDefs');
    if (!columnDefs?.length) {
      return;
    }

    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }

    const columnState = this.api ? this.api.getColumnState() : null;
    const labelKeys: string[] = [];
    columnDefs.forEach((col: ColDef | ColGroupDef) => {
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
          columnDefs.forEach((col: ColDef | ColGroupDef, i) => {
            if ('children' in col) {
              col.children.forEach(child => {
                this.getTranslationForLeafColumn(child, labels, i);
              });
            }
            this.getTranslationForLeafColumn(col, labels, i);
          });
          if (this.api) {
            // Update labels in the grid
            this.api.setGridOption('columnDefs', columnDefs);
            this.api.applyColumnState({state: columnState});
          }
        });
    } else {
      if (this.api) {
        this.api.setGridOption('columnDefs', columnDefs);
        this.api.applyColumnState({state: columnState});
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
    this.labelSub?.unsubscribe();
  }

  onPageChanged(pageNum: number): void {
    this._currentPageNum = pageNum;
    this.api?.showLoadingOverlay();
    this.search.emit(this.getCurrentPagination());
  }

  gridReady(event: GridReadyEvent<T>): void {
    this.api = event.api;
    this.handleSpecialColumns();
    this.restoreColState();
    const sortingSet = this.setSorting();
    this.agGridReady.next(this.api);

    // Avoid reloading if we changed the sort - if we did, we will receive an `onSortChange` event
    if (!sortingSet && !this.infiniteScroll) {
      this.reloadTable(true);
    }
    this.isGridReady = true;
  }

  private setSorting(): boolean {
    if (!this.disableSorting && this.sorting && this.api) {
      const columns = this.api.getColumns();
      const sortingState: Array<ColumnState> = this.sorting
        .filter(s => columns.some(col => s.sortField === col.getColId()))
        .map((s, i) => ({
          colId: s.sortField,
          sort: s.sortReversed ? 'desc' : 'asc',
          sortIndex: i
        }));
      this.api.applyColumnState({
        state: sortingState,
        defaultState: {sort: null},
      });
      this.api.refreshHeader();
      return sortingState.length > 0;
    }
    return false;
  }

  onSortChanged(): void {
    this.sorting = this.api.getColumnState()
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
      this.reloadTable(this.infiniteScroll);
    }
  }

  firstDataRendered(): void {
    this.autoSizeColumns();
  }

  autoSizeColumns(): void {
    if (!this.disableAutosize) {
      if (this.columnsForAutoSize?.length) {
        this.api?.autoSizeColumns(this.columnsForAutoSize, this.skipHeaderForAutoSize);
      } else {
        this.api?.autoSizeAllColumns(this.skipHeaderForAutoSize);
      }
    }
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

    this.api?.showLoadingOverlay();

    if (this.infiniteScroll) {
      if (resetPageNumber) {
        this.api.setGridOption('datasource', this.gridOptions.datasource);
      } else {
        this.api.refreshInfiniteCache();
      }
    } else {
      this.search.emit(this.getCurrentPagination());
    }
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
    const state = this.api.getColumnState();
    this.columnsStatusChanged.emit(JSON.stringify(state));
  }

  toggleAccordion(row, index): void {
    row.$showingAccordion = !row.$showingAccordion;

    const selectedRows: IRowNode[] = this.api.getSelectedNodes();

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

    this.api?.setGridOption('rowData', this.rowsDisplayed);

    if (selectedRows?.length) {
      let showAccordionValue = -1;
      if (row.$showingAccordion) {
        showAccordionValue = +1;
      }

      for (const selectedRow of selectedRows) {
        /*
         retrieve node in this way (using getDisplayedRowAtIndex instead of using directly selectedRow) because
         after setNewRowData the nodes are not bind anymore to new data,
         in fact here this.api.getSelectedNodes() will return always an empty array
        */
        let node: IRowNode;
        if (selectedRow.rowIndex > index) {
          node = this.api?.getDisplayedRowAtIndex(selectedRow.rowIndex + showAccordionValue);
        } else {
          node = this.api?.getDisplayedRowAtIndex(selectedRow.rowIndex);
        }
        node.setSelected(true, false);
      }
    }

  }

  onScroll($event: BodyScrollEvent): void {
    this.bodyScroll.emit($event);
  }

  gridSelectionChanged(): void {
    if (this.api) {
      const rows = this.api.getSelectedRows();
      const indexes = this.api.getSelectedNodes().map(n => n.rowIndex);

      this.selectionChanged.next({rows, indexes});
    }
  }

  resetRowHeights(): void {
    this.api?.resetRowHeights();
  }

  clearSelection(): void {
    this.api?.deselectAll();
  }

  cellMouseDown(event: CellMouseDownEvent): void {
    if (!event) {
      return;
    }

    const ev = event.event as MouseEvent;
    if (ev.button === 1) {      // Middle button click
      ev.preventDefault();
      ev.stopImmediatePropagation();

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
    if (this.api) {
      this.handleSpecialColumns();
    }
  }

  private isPaginated(): boolean {
    return this.data && (this.showPaginationIfEmpty || (this.data.totalNumRecords > 0 && this.data.totalNumRecords > this.data.pageLen)
      || this.data.totalNumRecords === -1);
  }

  private isSortedServerSide(): boolean {
    return (this.keepServerSorting === null && this.isPaginated()) || this.keepServerSorting || this.infiniteScroll;
  }
}
