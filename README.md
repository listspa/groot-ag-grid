# `groot-ag-grid`

This library offers a simpler-to-use wrapper around the angular version of `ag-grid`,
with some integrations with Groot.

# Installation

Assuming you have already installed Groot, run

```
npm i @listgroup/groot-ag-grid ag-grid-angular ag-grid-community
``` 

## Module management

Given how the Ag Grid library works, you cannot simply import a module, but you need to add the
library's components to one of your modules. You will need at a minimum to do something like:

```
imports: [
    ...,
    AgGridModule.withComponents([
      ...GROOT_AG_GRID_COMPONENTS,
      // your custom components that need to be used inside the grid
    ]),
],
declarations: [
    // your module components
    // your custom components that need to be used inside the grid
    ...GROOT_AG_GRID_COMPONENTS,
]
```

## Custom components

To register one component that has to be used inside the library, for instance a specific cell renderer,
you need to do two things: first you should create a function that will call our service to register
them:

```
export function registerCustomGridComponents(grootAgGridCustomizationService: GrootAgGridCustomizationService) {
  return () => {
    grootAgGridCustomizationService.registerFrameworkComponent(GrootAgGridRenderer.numbers, GarfieldTableRendererNumbersComponent);
  };
}
```

Then you have to add to the `providers` section of your angular module:

```
    {provide: APP_INITIALIZER, useFactory: registerCustomGridComponents, multi: true, deps: [GrootAgGridCustomizationService]}
```

Note that the function needs to have a name, to be `export`-ed and needs to return a function, given how Angular works.

# Grid component API

TODO 
