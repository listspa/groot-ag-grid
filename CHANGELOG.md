# Groot-ag-grid releases

## Version 0.4.3 - 2020-10-02

- feat: added customizable table title

## Version 0.4.2 - 2020-09-25

- fix: fixed autosize columns issue with invisible grids

## Version 0.4.1 - 2020-06-29

- fix: fixed issue with `NoGridDataMessage`

## Version 0.4.0 - 2020-06-26

- feat: allowed to pass a `NoGridDataMessage` to show a warning in the grid

## Version 0.3.3 - 2020-06-09

- feat: added event `gridReady`
- feat: enabled single-row selection
- feat: added api to mark a row as selectable or forbid it

## Version 0.3.2 - 2020-05-05

- feat: added api `resetRowHeights`

## Version 0.3.1 - 2020-05-05

- feat: added callbacks to compute row height, css classes, css style

## Version 0.3.0 - 2020-04-10

- feat: changed emitted event when selection changes

## Version 0.2.2 - 2020-04-09

- fix: changing columns after the table was loaded should not remove the action
  buttons or the checkboxes 

## Version 0.2.1 - 2020-04-02

- added in the template-renderer the row as template argument
- fix: fixed an NPE when column definitions are updated but the grid hasn't
  loaded yet 

## Version 0.2.0 - 2020-04-02

- when the grid emits a search event, it now shows the "loading" indicator
- it's now possible to override loading or "no rows found" indicators by using
  ```
  grootAgGridCustom.registerOverlay(MyCustomComponent)
  ```

## Version 0.1.0 - 2020-03-20

First release
