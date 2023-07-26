import { NgModule } from '@angular/core';
import { GrootModule } from '@listgroup/groot';
import { GrootAgGridRendererTemplateComponent } from './groot-ag-grid-renderer-template/groot-ag-grid-renderer-template.component';
import { CommonModule } from '@angular/common';
import { GrootAgGridHeaderTemplateComponent } from './groot-ag-grid-header-template/groot-ag-grid-header-template.component';
import { GrootAgGridRendererNumbersComponent } from './groot-ag-grid-renderer-numbers/groot-ag-grid-renderer-numbers.component';
import { GrootAgGridRendererDatesComponent } from './groot-ag-grid-renderer-dates/groot-ag-grid-renderer-dates.component';
import { GrootAgGridLoadingOverlayComponent } from './groot-ag-grid-loading-overlay/groot-ag-grid-loading-overlay.component';
import { GrootAgGridNoRowsOverlayComponent } from './groot-ag-grid-no-rows-overlay/groot-ag-grid-no-rows-overlay.component';
import { GrootAgGridComponent } from './groot-ag-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { TranslateModule } from '@ngx-translate/core';
import { GrootAgGridRendererBooleansComponent } from './groot-ag-grid-renderer-booleans/groot-ag-grid-renderer-booleans.component';
import { GrootAgGridColumnSelectorModalComponent } from './groot-ag-grid-column-selector-modal/groot-ag-grid-column-selector-modal.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GrootAgGridTableHeaderComponent } from './groot-ag-grid-table-header/groot-ag-grid-table-header.component';
import { FormsModule } from '@angular/forms';
import { GrootAgGridTableActionComponent } from './groot-ag-grid-table-actions/groot-ag-grid-table-action.component';

export const GROOT_AG_GRID_COMPONENTS = [
  GrootAgGridComponent,
  GrootAgGridColumnSelectorModalComponent,
  GrootAgGridLoadingOverlayComponent,
  GrootAgGridNoRowsOverlayComponent,
  GrootAgGridRendererDatesComponent,
  GrootAgGridRendererBooleansComponent,
  GrootAgGridRendererNumbersComponent,
  GrootAgGridRendererTemplateComponent,
  GrootAgGridHeaderTemplateComponent,
  GrootAgGridTableActionComponent,
  GrootAgGridTableHeaderComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TranslateModule.forChild(),
    GrootModule,
    AgGridModule,
  ],
  declarations: GROOT_AG_GRID_COMPONENTS,
  exports: GROOT_AG_GRID_COMPONENTS
})
export class GrootAgGridModule {
}

// Remember to update public_api.ts whenever you add a new angular object!
