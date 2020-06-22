import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageDemoTableComponent} from './pages/page-demo-table/page-demo-table.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: PageDemoTableComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
