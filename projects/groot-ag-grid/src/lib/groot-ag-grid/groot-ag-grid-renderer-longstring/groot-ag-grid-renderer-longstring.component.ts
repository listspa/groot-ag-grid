import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
  templateUrl: './groot-ag-grid-renderer-longstring.component.html'
})
export class GrootAgGridRendererLongstringComponent implements ICellRendererAngularComp {

  params: any;
  text: string;

  agInit(params: any): void {
    this.params = params;
    this.text = this.getText();
  }

  refresh(params: any): boolean {
    this.params = params;
    this.text = this.getText();
    return true;
  }

  private getText() {
    if (this.params.value && this.params.length) {
      return this.params.value.substring(0, this.params.length);
    } else {
      return this.params.value;
    }
  }

}
