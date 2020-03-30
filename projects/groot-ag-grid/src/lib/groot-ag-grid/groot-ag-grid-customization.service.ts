import {Injectable} from '@angular/core';

type FrameworkComponents = { [key: string]: any };

@Injectable({
  providedIn: 'root'
})
export class GrootAgGridCustomizationService {
  showPaginationIfEmptyDefault = false;
  frameworkComponents: FrameworkComponents = {};

  registerFrameworkComponent(key: string, component: any) {
    this.frameworkComponents[key] = component;
  }
}
