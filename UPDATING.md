# Updating to Angular 10

## Removed and deprecated properties

We have renamed, for coherence, `GrootAgGridRenderer.date` to `dates`.

## SCSS

Replace the scss import to be:

```
@import "~@listgroup/groot-ag-grid/src/style/groot-ag-grid.component";
```

## Alignments

If you are aligning a cell to the right, such as a number, you need to add to your
`colDef` the property `cellClass: 'ag-cell-right'`.

If you are aligning a cell to the center, a `class="text-center"` won't work anymore.
You need to set in your `colDef` the property `cellClass: 'ag-cell-center'`. This is useful
for example for booleans.

If you need to insert a list (an `ul`) in a cell, in the `colDef` specify 
`cellClass: 'ag-cell-height-100'`.
