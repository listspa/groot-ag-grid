import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {
  ConsoleLoggingService,
  GrootCapabilityService,
  grootConfigBsDatePicker,
  GrootMissingTranslationLogger,
  GrootModule,
  GrootTranslateHttpLoader,
  NoCacheInterceptor,
  NoCheckCapabilityService
} from '@listgroup/groot';
import {PopoverModule} from 'ngx-bootstrap/popover';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {MissingTranslationHandler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {BsDatepickerConfig, BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgSelectModule} from '@ng-select/ng-select';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';
import {ModalModule} from 'ngx-bootstrap/modal';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {PageDemoTableComponent} from './pages/page-demo-table/page-demo-table.component';
import {GrootAgGridModule} from '../../../groot-ag-grid/src/lib/groot-ag-grid/groot-ag-grid.module';
import {AgGridModule} from 'ag-grid-angular';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {PageHomepageComponent} from './pages/page-homepage/page-homepage.component';

// Required as a separate function for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new GrootTranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    PageDemoTableComponent,
    PageHomepageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient]},
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: GrootMissingTranslationLogger,
        deps: [ConsoleLoggingService]
      }
    }),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    GrootModule.forRoot(),

    // Ag-grid
    GrootAgGridModule,
    AgGridModule.withComponents([
      // Other components to be registered
    ]),

    AppRoutingModule,
    ButtonsModule
  ],
  providers: [
    {provide: BsDatepickerConfig, useFactory: grootConfigBsDatePicker},
    {provide: HTTP_INTERCEPTORS, useClass: NoCacheInterceptor, multi: true},
    {provide: GrootCapabilityService, useClass: NoCheckCapabilityService},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
