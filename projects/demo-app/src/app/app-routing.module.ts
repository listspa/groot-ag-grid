import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageDemoTableComponent} from './pages/page-demo-table/page-demo-table.component';
import {PageHomepageComponent} from './pages/page-homepage/page-homepage.component';
import {PageCustomComponentsComponent} from './pages/page-custom-components/page-custom-components.component';
import {PageDemoStyleComponent} from './pages/page-demo-style/page-demo-style.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: PageHomepageComponent},
  {path: 'demo-simple', component: PageDemoTableComponent},
  {path: 'custom-components', component: PageCustomComponentsComponent},
  {path: 'demo-style', component: PageDemoStyleComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
