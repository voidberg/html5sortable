![html5sortable1](https://user-images.githubusercontent.com/42062381/90550349-1f023500-e190-11ea-9db0-f6d5ba5412a7.png)





<h1> HTML5Sortable </h1>

[![Build Status](https://github.com/lukasoppermann/html5sortable/workflows/Build%20and%20test/badge.svg)](https://github.com/lukasoppermann/html5sortable/actions) [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md) [![Coverage Status](https://img.shields.io/coveralls/lukasoppermann/html5sortable/master.svg?style=flat-square)](https://coveralls.io/github/lukasoppermann/html5sortable) [![Known Vulnerabilities](https://snyk.io/test/github/lukasoppermann/html5sortable/badge.svg?style=flat-square)](https://snyk.io/test/github/lukasoppermann/html5sortable)  [![NPM](https://img.shields.io/npm/v/html5sortable.svg?style=flat-square)](https://www.npmjs.com/package/html5sortable) [![npm](https://img.shields.io/npm/dt/html5sortable.svg?style=flat-square)](https://www.npmjs.com/package/html5sortable) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md) [![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square)](CODE_OF_CONDUCT.md)

> **Lightweight vanillajs micro-library for creating sortable lists and grids using native HTML5 drag and drop API.**



# Table of Contents
  * [Community maintained](#community-maintained)
  * [Looking for Co-Maintainer](#looking-for-co-maintainer)
  * [Features](#features)
  * [Framework adapters](#framework-adapters)
  * [Installation](#installation)
  * [Examples](#examples)
  * [Docs](#docs)
    * [Usage](#usage)
    * [Styling](#styling)
    * [Nesting](#nesting)
    * [Events](#events)
    * [Options](#options)
    * [Methods](#methods)
    * [Sorting table rows](#sorting-table-rows)
  * [Contributing](#contributing)
  * [Polyfills](#polyfills-facing-towards-the-future-instead-of-the-past)
  * [Touch Support](#touch-support)
  * [Known Issues](#known-issues)
      

## Community maintained

A fair **warning:** this repository is currently not being actively developed. It works pretty fine, but if you find any issues you will need to fix them yourself. I try to keep the dependencies up to date and will happily help you fix issues and merge PRs for bugfixes or new features. 

## Looking for Co-Maintainer
[![Looking for Co-Maintainer](https://img.shields.io/badge/looking%20for-co%E2%80%93maintainer-red.svg?style=flat-square)](https://twitter.com/lukasoppermann)

If you are interested in actively helping with maintaining & improving this project please send me a message via twitter [@lukasoppermann](https://twitter.com/lukasoppermann) or email oppermann.lukas@gmail.com with a short text of what you would like to do on the project. This may be something small like sorting issues and helping with questions and small bugs (if you have little time or are not that experienced) or something big like tackling big features.

## Features
* Only 2KB (minified and gzipped).
* Built using native HTML5 drag and drop API. No dependencies.
* Supports both list and grid style layouts.
* Supported Browsers: Current versions of all major browsers (Chrome, Firefox, Safari, Opera, Edge), [IE11+ (Polyfill required)](#polyfills-facing-towards-the-future-instead-of-the-past)
* Available as ES6 Module, AMD, CommonJS and iffe with `sortable` global

**Demo:** Check out the **[examples](http://lukasoppermann.github.io/html5sortable/index.html)**

## Framework adapters
If you would like to add an adapter to the list, please [create an issue](https://github.com/lukasoppermann/html5sortable/issues) with the link to your adapter.
- **Polymer:** https://github.com/trofrigo/polymer-html5sortable

## Installation
We recommend installing the package via npm.

```
npm install html5sortable --save
```

Once you install the package using `npm` or [downloading the latest release](https://github.com/lukasoppermann/html5sortable/releases/latest) (don't use the master branch), load file you need **from the `dist/` directory**, e.g. `dist/html.sortable.min.js` for the minified iife version.

- **iffe** (loading file via script tag): `dist/html5sortable.js` or `dist/html5sortable.min.js`
- **ES6 Module**: `dist/html5sortable.es.js`
- **CommonJS Module**: `dist/html5sortable.cjs.js`
- **AMD Module**: `dist/html5sortable.amd.js`

Still using **bower**? `bower install https://github.com/lukasoppermann/html5sortable.git`

## Examples
You can find the **[examples online](https://lukasoppermann.github.io/html5sortable/index.html)** or test locally. **Warning:** the online demo is just to show off the features and is most likely not up to date. Please study this readme file for the current way of implementing and using `html5sortable`.

## Docs


### Usage

Use `sortable` method to create a sortable list:

``` javascript
sortable('.sortable');
```

### Styling

Use `.sortable-placeholder` CSS selectors to change the styles of the placeholder. You may change the class by setting the `placeholderClass` option in the config object.

``` javascript
sortable('.sortable', {
  placeholderClass: 'my-placeholder fade'
});
```

### Nesting
You can nest sortables inside each other. However, take care to add a wrapper around the items, a sortable-item can **not** at the same time be a `sortable`.

```html
<div class="list"><!-- Sortable -->
  <div class="item"> Item 1
    <div class="sublist"><!-- Nested Sortable; Wrapping container needed -->
      <div class="subitem">Subitem 1</div>
      <div class="subitem">Subitem 2</div>
    </div>
  </div>
  <div class="item"> Item 2 </div>
</div>
```

## Events
NOTE: Events can be listened on any element from the group (when using `connectWith`), since the same event will be dispatched on all of them.

### sortstart

Use `sortstart` event if you want to do something when sorting starts:

``` javascript
sortable('.sortable')[0].addEventListener('sortstart', function(e) {
    /*

    This event is triggered when the user starts sorting and the DOM position has not yet changed.

    e.detail.item - {HTMLElement} dragged element

    Origin Container Data
    e.detail.origin.index - {Integer} Index of the element within Sortable Items Only
    e.detail.origin.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
    e.detail.origin.container - {HTMLElement} Sortable Container that element was moved out of (or copied from)
    */
});
```

### sortstop

Use the `sortstop` event if you want to do something when sorting stops:

``` javascript
sortable('.sortable')[0].addEventListener('sortstop', function(e) {
    /*

    This event is triggered when the user stops sorting and the DOM position has not yet changed.

    e.detail.item - {HTMLElement} dragged element

    Origin Container Data
    e.detail.origin.index - {Integer} Index of the element within Sortable Items Only
    e.detail.origin.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
    e.detail.origin.container - {HTMLElement} Sortable Container that element was moved out of (or copied from)
    */
});
```

### sortupdate

Use `sortupdate` event if you want to do something when the order changes (e.g. storing the new order):

``` javascript
sortable('.sortable')[0].addEventListener('sortupdate', function(e) {

    console.log(e.detail);

    /*
    This event is triggered when the user stopped sorting and the DOM position has changed.

    e.detail.item - {HTMLElement} dragged element

    Origin Container Data
    e.detail.origin.index - {Integer} Index of the element within Sortable Items Only
    e.detail.origin.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
    e.detail.origin.container - {HTMLElement} Sortable Container that element was moved out of (or copied from)
    e.detail.origin.itemsBeforeUpdate - {Array} Sortable Items before the move
    e.detail.origin.items - {Array} Sortable Items after the move

    Destination Container Data
    e.detail.destination.index - {Integer} Index of the element within Sortable Items Only
    e.detail.destination.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
    e.detail.destination.container - {HTMLElement} Sortable Container that element is moved into (or copied into)
    e.detail.destination.itemsBeforeUpdate - {Array} Sortable Items before the move
    e.detail.destination.items - {Array} Sortable Items after the move
    */
});
```

### sortenter 

Fired when a dragitem enters a sortable container. 

### sortleave

Fired when a dragitem leaves a sortable container. 


## Options

### items
Use the `items` option to specify which items inside the element should be sortable:

``` javascript
sortable('.sortable', {
    items: ':not(.disabled)'
});
```
### handle
Use the `handle` option to restrict drag start to the specified element:

``` javascript
sortable('.sortable', {
    handle: 'h2'
});
```
### forcePlaceholderSize
Setting the `forcePlaceholderSize` option to true, forces the placeholder to have a height:

``` javascript
sortable('.sortable', {
    forcePlaceholderSize: true
});
```

### connectWith ![deprecated](https://img.shields.io/badge/feature-deprecated-yellow.svg?longCache=true&style=flat-square)
**Use [`acceptFrom`](#acceptFrom) instead.** The `connectWith` option allows you to create a connected lists:

``` javascript
sortable('.js-sortable, .js-second-sortable', {
    connectWith: 'connected' // unique string, which is not used for other connectWith sortables
});
```

### acceptFrom
Use the `acceptFrom` option to restrict which sortable's items will be accepted by this sortable. `acceptFrom` accepts a comma separated list of selectors or `false` to disabling accepting items. This is an alternative to the now **deprecated** [connectWith](#connectwith) and should not be used together.

``` javascript
sortable('.sortable', {
  acceptFrom: '.sortable, .anotherSortable' // Defaults to null
});
```

***Note:*** Using `acceptFrom` also effects the sortable itself. This means, items will not be sortable within the list itself, if you do not include it in the `acceptFrom` option. 

In the example the current list `.sortable` allows items within it to be sorted and accepts elements from `.anotherSortable`.

If you want to be able to move items between to sortables, the `acceptFrom` option must be present on both of them.

Can also accept a callback function with `destinationSortable` and `draggedElement` as paramaters, This function should return `true` or `false`:

``` javascript
sortable('.sortable', {
  acceptFrom: function(destinationSortable, draggedElement){
    if(draggedElement.classList.contains('canDrop')){
      return true;
    } else {
      return false; 
    }
  }
});

### placeholder
Use the `placeholder` option to specify the markup of the placeholder:

``` javascript
sortable('.sortable', {
  items: 'tr' ,
  placeholder: '<tr><td colspan="7">&nbsp;</td></tr>'
});
```

### hoverClass
Use the `hoverClass` option to apply css classes to the hovered element rather than relying on `:hover`. This can eliminate some potential drag and drop issues where another element thinks it is being hovered over. Disabled when disabling or destroying sortable element.

``` javascript
sortable('.sortable', {
  hoverClass: 'is-hovered is-hovered-class' // Defaults to false
});
```

### dropTargetContainerClass
Use `dropTargetContainerClass` option to apply a css Class to the container. The class is added when dragged item enters the container and removed when it leaves it (or is dropped).

``` javascript
sortable('.sortable', {
  dropTargetContainerClass: 'is-drop-target' // Defaults to false
});
```

### maxItems
Use the `maxItems` option to restrict the number of items that can be added to a sortable from a [connected](#connectwith) sortable. `maxItems` should always be combined with the `items` option. Make sure `items` does not match placeholder and other options, so that they are not counted.

``` javascript
sortable('.sortable', {
  maxItems: 3 // Defaults to 0 (no limit)
});
```
### copy
Use the `copy` option to duplicate the element on drag. The original element will remain in the same position.

``` javascript
sortable('.sortable', {
  copy: true // Defaults to false
});
```

### orientation
Use the `orientation` option to specify the orientation of your list and fix incorrect hover behaviour. Defaults to `'vertical'`.

``` javascript
sortable('.sortable', {
  orientation: 'horizontal' // Defaults to 'vertical'
});
```

### itemSerializer
You can provide a `function` that will be applied to every item in the `items` array ([see serialize](#serialize)). The function receives two arguments: `serializedItem: object`, `sortableContainer: Element`. This function can be used to change the output for the items. Defaults to `undefined`.

``` javascript
sortable('.sortable', {
  itemSerializer: (serializedItem, sortableContainer) => {
    return {
      position:  serializedItem.index + 1,
      html: serializedItem.html
    }
  }
});
```

### containerSerializer
You can provide a `function` that will be applied to the `container` object ([see serialize](#serialize)). The function receives one argument: `serializedContainer: object`. This function can be used to change the output for the container. Defaults to `undefined`.

``` javascript
sortable('.sortable', {
  containerSerializer: (serializedContainer) => {
    return {
      length: container.itemCount
    }
  }
});
```

### customDragImage
You can provide a function as a `customDragImage` property on the options object which will be used to create the item and position of the drag image (the half transparent item you see when dragging an element).

The function gets three parameters, the dragged element, an offset object with the offset values for the offset of the item and the `dragstart` event. The function **MUST** return an object with an `element` property with an html element as well as a `posX` and `posY` property with has the x and y offset for the dragImage.

``` javascript
sortable('.sortable', {
  customDragImage: (draggedElement, elementOffset, event) => {
    return {
      element: draggedElement,
      posX: event.pageX - elementOffset.left,
      posY: event.pageY - elementOffset.top
    }
  }
});

// elementOffset object that is received in the customDragImage function
{
  left: rect.left + window.scrollX,
  right: rect.right + window.scrollX,
  top: rect.top + window.scrollY,
  bottom: rect.bottom + window.scrollY
}
```

## Methods

### destroy
To remove the sortable functionality completely:

``` javascript
sortable('.sortable', 'destroy');
```

### disable
To disable the sortable temporarily:

``` javascript
sortable('.sortable', 'disable');
```

### enable
To enable a disabled sortable:

``` javascript
sortable('.sortable', 'enable');
```

### serialize
You can easily serialize a sortable using the `serialize` command. If you provided an [`itemSerializer`](#itemSerializer) or [`containerSerializer`](#containerSerializer) function in the options object, they will be applied to the `container` object and the `items` objects before they are returned.

``` javascript
sortable('.sortable', 'serialize');

// You will receive an object in the following format
[{
  container: {
    node: sortableContainer,
    itemCount: items.length
  }
  items: [{
    parent: sortableContainer,
    node: item,
    html: item.outerHTML,
    index: index(item, items)
  }, …]
}, …]
```

### reload
When you add a new item to a sortable, it will not automatically be a draggable item, so you will need to reinit the sortable. Your previously added options will be preserved.

``` javascript
sortable('.sortable');
```

## Sorting table rows

 * Initialize plugin on `tbody` element (browsers automatically add `tbody` if you don't)
 * Keep in mind that different browsers may display different drag images of the row during the drag action. Webkit browsers seem to hide entire contents of `td` cell if there are any inline elements inside the `td`. This may or may not be fixed by setting the `td` to be `position: relative;`
 * If you add a custom `placeholder` you must use a `tr` e.g. `placeholder: "<tr><td colspan="3">The row will appear here</td></tr>"`, otherwise you will only be able to drop items when hovering the first column.

## Contributing
This version is maintained by [Lukas Oppermann](https://github.com/lukasoppermann) and [many other contributors](../../contributors). Thanks for your help! :+1:

Contributions are always welcome. Please check out the [contribution guidelines](CONTRIBUTING.md) to make it fast & easy for us to merge your PR.

**Issues:** If you create a [bug report](https://github.com/lukasoppermann/html5sortable/issues/new/choose), please make sure to include a [test case](https://codepen.io/pen/?template=GRoQRxo) showing the issue. The easiest way is to copy the [codepen template](https://codepen.io/pen/?template=GRoQRxo).

## Polyfills: Facing towards the future instead of the past
This project is focusing on modern, evergreen browsers to deliver a fast and small package. While many projects try build features so that it runs in the oldest browser (looking at you IE9), we try to create a fast and pleasant development experience using the language capabilities that the current version of Javascript offers.

### Benefits
#### Small and fast package for modern browsers
While a backwards facing approach penalises modern browsers by making them download huge files, we prefer to ship a small package and have outdated browser bear the penalty of the polyfill. An additional benefit is that you might polyfill those features in any case so you don't have any additional load.

#### Contribution friendly code base
We try to encourage people to help shape the future of this package and contribute in small or big ways. By removing hard to understand hacks we make it easier for people new to the code base or even Javascript to contribute.

#### Helps browser optimisation
Browser try to performance optimise language features as much as possible. Working around the language to make code work in outdated browser may actually work against this.

### Polyfill
We recommend using the [Financial Times Polyfill Service](https://github.com/Financial-Times/polyfill-service) which will polyfill only the necessary features for browsers that need a polyfill. It is basically a no-config, easy solution.
```
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

### Touch Support
Touch support can be achieved by using the [DragDropTouch](https://github.com/Bernardo-Castilho/dragdroptouch) polyfill.
The DragDropTouch polyfill must be included before html5sortable is initialized.

## Known Issues
### Firefox
- **Dragstart not working on buttons**  
Dragstart event does not fire on `button` elements. This effectively disables drag and drop for button elements. See https://caniuse.com/#feat=dragndrop in the known issues section.
- **Drag & Drop is not working on iOS**  
But works in conjunction with [DragDropTouch](https://github.com/Bernardo-Castilho/dragdroptouch) [#522](https://github.com/lukasoppermann/html5sortable/issues/522).
