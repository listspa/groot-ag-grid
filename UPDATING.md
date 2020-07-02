# Updating to Angular 10

TODO: differences about scss

If you are aligning a cell to the right, such as a number, you need to add to your
`colDef` the property `cellClass: 'ag-cell-right'`.

If you are aligning a cell to the center, a `class="text-center"` won't work anymore.
You need to set in your `colDef` the property `cellClass: 'ag-cell-center'`. This is useful
for example for booleans.
