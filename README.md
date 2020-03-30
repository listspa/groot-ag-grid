# `groot-ag-grid`

This library offers a simpler-to-use wrapper around the angular version of `ag-grid`,
with some integrations with Groot.

# Installation

Assuming you have already installed Groot, run

```
npm i @listgroup/groot-ag-grid ag-grid-angular ag-grid-community
``` 

## Module

Simply import the Angular module `GrootAgGridModule` where you need to use
the components.

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

In the module where you declare your cell components, you need to modify the imports section:

```
imports: [
    // Various libraries
    GrootAgGridModule,
    AgGridModule.withComponents([
        GarfieldTableRendererNumbersComponent,
        // Other components to be registered
    ]),
```

In your css file, add an include to the library css, _after_ including Groot:

```
@import "~@listgroup/groot-ag-grid/style/groot-ag-grid.component";
```

# Grid component API

TODO 
