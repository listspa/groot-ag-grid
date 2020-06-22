import {Component} from '@angular/core';
import {TranslationsLanguageService} from '@listgroup/groot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(_: TranslationsLanguageService) {
  }
}
