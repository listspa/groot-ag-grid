import {Component} from '@angular/core';
import {SimpleNavBarItem, TranslationsLanguageService} from '@listgroup/groot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  menu: SimpleNavBarItem[] = [
    {label: 'Samples', url: '/demo-simple'},
    {label: 'Customizing cells', url: '/custom-components'},
  ];

  constructor(_: TranslationsLanguageService) {
  }
}
