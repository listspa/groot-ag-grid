import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ColDef} from 'ag-grid-community';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {Subject} from 'rxjs';

@Component({
  selector: 'groot-ag-grid-columns-selector-modal',
  templateUrl: './groot-ag-grid-column-selector-modal.component.html',
})
export class GrootAgGridColumnSelectorModalComponent implements OnInit {
  //  Modal inputs
  labelsPrefix: string;
  availableColumns: ColDef[];
  selectedColumns: string[];
  reset: Subject<void>;
  save: Subject<string[]>;

  available: Array<ColDef>;
  selected: Array<ColDef>;

  constructor(private bsModalRef: BsModalRef) {
  }

  ngOnInit(): void {
    const selectedPos = new Map<string, number>();
    this.selectedColumns.forEach((col, i) => selectedPos.set(col, i));

    this.selected = this.availableColumns
      .filter(field => selectedPos.has(field.colId))
      .sort((f1, f2) => {
        const pos1 = selectedPos.get(f1.colId);
        const pos2 = selectedPos.get(f2.colId);
        return pos1 - pos2;
      });

    this.available = this.availableColumns
      .filter(field => !selectedPos.has(field.colId));
  }

  drop(event: CdkDragDrop<Array<ColDef>, Array<ColDef>>): void {
    if (event.container.data === event.previousContainer.data) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  close(): void {
    this.bsModalRef.hide();
  }

  apply(): void {
    const selectedColumns = this.selected.map(f => f.colId);
    this.save.next(selectedColumns);
    this.close();
  }

  resetClicked(): void {
    this.reset.next();
    this.close();
  }
}
