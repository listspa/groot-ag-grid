import {Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {GrootTableTitleRightAreaDirective, isLoadingFailed, LoadingFailed, PaginatedResponse, PaginationOptions, SortPagination} from '@listgroup/groot';
import {CellClickedEvent, CellMouseDownEvent, ColDef, ColGroupDef, GridApi, GridOptions, IsRowSelectable, RowNode} from 'ag-grid-community';
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
  @Output() search = new EventEmitter<PaginationOptions>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() cellMiddleClicked = new EventEmitter<CellClickedEvent>();
  @Output() columnsStatusChanged = new EventEmitter<string>();
  @Output() bodyScroll = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<GrootAgGridSelection<T>>();
  @Output() agGridReady = new EventEmitter<GridApi>();

  @Input() disableSorting = false;
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
  @Input() rowClassRules?: { [cssClassName: string]: (((params: any) => boolean) | string) } | null = null;
  @ContentChild(GrootTableTitleRightAreaDirective, {read: TemplateRef}) tableTitleRightArea: TemplateRef<any> | null = null;
  @Input() showPaginationIfEmpty = this.grootAgGridCustomizationService.showPaginationIfEmptyDefault;
  @Input() singleRowSelection = false;
  @Input() rowMultiSelectWithClick = false;
  @Input() titleLabel = 'common.searchResults';
  @Input() suppressRowTransform = false;
  @Input() modules: Array<any> = null;
  @Input() autoGroupColumnDef: ColDef = null;

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
  };
  public noRowsOverlayComponentParams: GrootAgGridNoRowsParams = {loadingError: false, api: null};
  private labelSub: Subscription;
  private _currentPageNum = 0;
  private sorting: SortPagination;
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
    this._initialized = true;
  }

  private keepServerSort(valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean): number {
    return 0;
  }

  private resetDefaultSorting(): void {
    if (this.gridOptions.defaultColDef) {
      this.gridOptions.defaultColDef.sortable = !this.disableSorting;
    }
    this.sorting = {sortField: this.defaultSortColumn, sortReversed: this.defaultSortReverseFlag};
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
    if (!this.disableSorting && this.sorting && this.sorting.sortField) {
      const columnState = this.gridOptions.columnApi.getColumnState();
      let found = false;
      columnState.forEach(col => {
        if (col.colId === this.sorting.sortField) {
          col.sort = this.sorting.sortReversed ? 'desc' : 'asc';
          found = true;
        } else {
          col.sort = null;
        }
      });
      this.gridOptions.columnApi.applyColumnState({
        state: columnState,
      });
      return found;
    }
    return false;
  }

  onSortChanged(): void {
    this.sorting = null;
    this.gridOptions.columnApi.getColumnState().forEach(col => {
      if (col.sort && col.colId && !this.sorting) {
        this.sorting = {
          sortField: col.colId,
          sortReversed: col.sort === 'desc',
        };
      }
    });

    // NOTE: In previous versions we emitted the default field. We might have to restore this behavior.
    // if (!this.sorting) {
    //   this.resetDefaultSorting();
    // }

    this.reloadTable(false);
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

  getCurrentPagination(): PaginationOptions {
    return {
      sortField: this.sorting && this.sorting.sortField,
      sortReversed: this.sorting && this.sorting.sortReversed,
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
}
