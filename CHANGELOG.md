# Groot-ag-grid releases

## Version 5.3.0 - 2022-07-01

- feat: use default date format from BsDatepickerConfig

## Version 5.2.1 - 2022-02-04

- fix: fixed warning in applications about deep import paths in libraries

## Version 5.2.0 - 2022-01-27

- feat: added component `groot-ag-grid-table-action`
- fix: fixed an exception if order of properties is incorrect

## Version 5.1.6 - 2021-12-14

- fix: fixed version of Groot in `peerDependencies` of published `package.json`

## Version 5.1.5 - 2021-11-15

- fix: in header, when loading we should hide "found: xxx"

## Version 5.1.4 - 2021-09-03

- fix: `showQuickSearch` should work in header

## Version 5.1.3 - 2021-09-01

- Explicitly annotated many nullable `@Input` properties as `| null`

## Version 5.1.2 - 2021-08-25

- Made the library opensource and published it on GitHub.com and npmjs.org

## Version 5.1.1 - 2021-07-06

- Integrated changes of 5.0.2, 5.0.3 and 5.0.4 in the 5.1.x branch.

## Version 5.0.4 - 2021-08-25

- Replaced the quick search in the header with the new groot component `groot-quick-search`
- Now requires Groot 3.2.2 or above

## Version 5.0.3 - 2021-08-20

- Added variable `isGridReady` that indicates whether the grid has emitted the `gridReady` event

## Version 5.0.2 - 2021-08-12

- Emit new event on middle-click on a grid's cell

## Version 5.1.0 - 2021-07-06

- Integrated ag-grid enterprise (optionally) and added a minimal support for tree tables

## Version 5.0.1 - 2021-06-01

- Increased slightly minimum height to improve "no rows" positioning

## Version 5.0.0 - 2021-04-30

- BREAKING CHANGE: Groot 3 and Ag-Grid 25.2 are now required
- fix: made everything work Ag-Grid 25.2

## Version 4.0.2 - 2021-03-05

- fix: column order should be used when changing column definition. See ISPGROOT-103

## Version 4.0.1 - 2021-02-26

- improved input type of `gridData` for `groot-ag-grid-table-header`
- added `showClearSelection` to `groot-ag-grid-table-header` for hiding the "clear selection" button

## Version 4.0.0 - 2021-02-11

- BREAKING CHANGE: You need to change the scss import to `groot-ag-grid` (without the `.component`)
- Groot 2.1.0 is now required
- For having the headers with a "darwin" (gray rather than blue) look and feel, load the skin's scss file before the
  main one. The import sequence should be:
  ```
  @import "~@listgroup/groot-ag-grid/src/style/skin/darwin";
  @import "~@listgroup/groot-ag-grid/src/style/groot-ag-grid";
  ```
- Added table header and modal for selecting columns, available only in "darwin" skin

## Version 3.0.0 - 2021-01-28

- Updated to Angular 11
- Groot 2.0.1 is now required
- AgGrid 25.0.1 is now required

## Version 2.0.5 - 2021-01-15

- Added option `suppressRowTransform`. It has to be set to `true` when you need row-span feature of ag-grid. Look
  at [AG Grid webpage](https://www.ag-grid.com/documentation/javascript/row-spanning/) for more info.
- Added option `disableSorting`, to disable sorting for all the columns in the table. It sets the `defaultCol`
  sorting property to `false`.
- Fixed a SONAR warning: the `<i>` tag, when used, must be set with attribute `aria-hidden="true"`.

## Version 2.0.3 - 2021-01-13

- Fixed an erroneous import path that caused a warning in client applications

## Version 2.0.2 - 2021-01-07

- Fixed an issue resulting in missing translations for column groups header names

## Version 2.0.1 - 2021-01-07

- Added support for translations of children columns in column groups

## Version 2.0.0 - 2021-01-05

- Added support for grouped columns

## Version 1.0.2 - 2020-10-27

- Fixed some issues with Angular 10's Ivy compiler and aot build of final applications

## Version 1.0.1 - 2020-10-22

- Added missing files in `public-api`

## Version 1.0.0 - 2020-10-21

- breaking: Angular 10 and ag-grid 24 are now required (see UPDATING.md)

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
