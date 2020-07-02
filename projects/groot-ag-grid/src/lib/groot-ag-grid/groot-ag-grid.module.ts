import {NgModule} from '@angular/core';
import {GrootModule} from '@listgroup/groot';
import {GrootAgGridRendererTemplateComponent} from './groot-ag-grid-renderer-template/groot-ag-grid-renderer-template.component';
import {CommonModule} from '@angular/common';
import {GrootAgGridHeaderTemplateComponent} from './groot-ag-grid-header-template/groot-ag-grid-header-template.component';
import {GrootAgGridRendererNumbersComponent} from './groot-ag-grid-renderer-numbers/groot-ag-grid-renderer-numbers.component';
import {GrootAgGridRendererDateComponent} from './groot-ag-grid-renderer-date/groot-ag-grid-renderer-date.component';
import {GrootAgGridLoadingOverlayComponent} from './groot-ag-grid-loading-overlay/groot-ag-grid-loading-overlay.component';
import {GrootAgGridNoRowsOverlayComponent} from './groot-ag-grid-no-rows-overlay/groot-ag-grid-no-rows-overlay.component';
import {GrootAgGridComponent} from './groot-ag-grid.component';
import {AgGridModule} from 'ag-grid-angular';
import {TranslateModule} from '@ngx-translate/core';
import {GrootAgGridRendererBooleansComponent} from './groot-ag-grid-renderer-booleans/groot-ag-grid-renderer-booleans.component';

export const GROOT_AG_GRID_COMPONENTS = [
  GrootAgGridComponent,
  GrootAgGridLoadingOverlayComponent,
  GrootAgGridNoRowsOverlayComponent,
  GrootAgGridRendererDateComponent,
  GrootAgGridRendererBooleansComponent,
  GrootAgGridRendererNumbersComponent,
  GrootAgGridRendererTemplateComponent,
  GrootAgGridHeaderTemplateComponent,
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    GrootModule,
    AgGridModule.withComponents(GROOT_AG_GRID_COMPONENTS)
  ],
  declarations: GROOT_AG_GRID_COMPONENTS,
  exports: GROOT_AG_GRID_COMPONENTS,
  entryComponents: []
})
export class GrootAgGridModule {
}

// Remember to update public_api.ts whenever you add a new angular object!
