import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageDemoTableComponent} from './pages/page-demo-table/page-demo-table.component';
import {PageHomepageComponent} from './pages/page-homepage/page-homepage.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: PageHomepageComponent},
  {path: 'demo-simple', component: PageDemoTableComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
