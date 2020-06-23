import {Component} from '@angular/core';
import {SimpleNavBarItem, TranslationsLanguageService} from '@listgroup/groot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  menu: SimpleNavBarItem[] = [
    {label: 'Basic sample', url: '/demo-simple'},
  ];

  constructor(_: TranslationsLanguageService) {
  }
}
