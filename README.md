#carma

carma is a lightweight (28,6 kb minified) ES6 Javascript-framework meant to make updating views, binding events and fetching data from server easy without oversized full frameworks.
It is suitable for sites with moderate real-time functionality needs, but for single page apps, please consider something more suitable (React, Angular etc.)

##Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting started](#getting-started)
4. [Initialization](#initialization)
5. [Working with the view](#working-with-the-view)
6. [Event listeners](#event-listeners)
7. [Fetching data from server](#fetching-data-from-server)
8. [Making the code nice and clean](#making-code-nice-and-clean)
9. [Carousel](#carousel)



##Introduction

The main component in carma is the View-class. It is a bit similar in principle to a React JS component since it is meant to be subclassed to make different views.

The actual views in carma are instances of the subclassed View, which are bootstrapped to a DOM container. The contents of the container can then be updated through the view using subcomponents called view items. Views can be either multi- or single-item views.
Views can set, append, remove and update view items into them. More view items can be fetched from the server with an easy to use server api interaction tool.

##Installation

```
    $ npm install carma
```

##Usage

```js

    import {View} from 'carma';

```

##Getting started

First thing we need to do is make a subclass from the View. The subclass needs to have at least one method, renderItem. RenderItem is used internally by the view every time a view item is added to the view to form the actual markup from the data.
It works essentially as a template for the view item:

```js

    class ExampleView extends View {

        renderItem({id, title, content}) {
            // This HTML string will become the actual DOM node of the view item
            return(
                `<div view-item="${id}">
                    <h1>${title}</h1>
                    <p>${content}</p>
                </div>`
            );
        }

    }

```

And we have a view ready. Note that each view item has to consist of a single container, and the container needs an attribute ``view-item``, which need to have a unique value.

##Initialization

To initialize the view, we need to initialize the class. View-class needs one parameter, a ``rootNodeId``, which is an existant id somewhere on the pages HTML-code.
The root node acts as a container where the view "roots" itself, and outputs all it's view items.

HTML

```html

    <div id="example-view-container"></div>

```

Script

```js

    let exampleView = new ExampleView('example-view-container');

```

Voila, the view is initialized. Note that the container doesn't have to be empty, it can have pre-rendered view items, which are initialized when the view is initialized. This includes the event listeners, which will be discussed later in this doc.

##Working with the view

To actually do something with the view, the View has multiple methods:

```js

    // setListView empties the view and sets new items consisting of the list
    // of items given as a parameter
    exampleView.setListView([{id: 1, title: 'title', content: 'content'}]);

    // appendToListView adds the given list of view items to the end of the view html.
    exampleView.appendToListView([{id: 1, title: 'title', content: 'content'}]);

    // setSingleItemView accepts only a single view item as a parameter and
    // resets the view rendering only it
    exampleView.setSingleItemView({id: 1, title: 'title', content: 'content'});

    // getViewItems returns an array-like list of the DOM-nodes of the view
    // items so you can edit them
    viewItemDOMNodes = exampleView.getViewItems();

    // getViewItem returns a single view item's DOM node (by id)
    viewItemDOMNOde = exampleView.getViewItem('1')

    // removeViewItem removes the view item corresponding the given id
    exampleView.removeViewItem('1');

    // removeAllViewItems does what the name implies.
    exampleView.removeAllViewItems();

```

##Event listeners

It's easy to set up event listeners to the view-items:

```js

    class ExampleView extends View {

        // 1) event handler
        doSomethingOnClick(target, viewItem) {
            /* do something here */
        }

        renderItem({id, title, content}) {
            // This HTML string will become the actual DOM node of the view item
            return(
                `<div view-item=${id}>
                    ${/* The event listener attribute */}
                    <h1 on-click="doSomethingOnClick">${title}</h1>
                    <p>${content}</p>
                </div>`
            );
        }

    }

```

As you can see, you need two things to set up an event listener:

1) The actual handler to be executed when the event triggers

2) An attribute in the view item html which a) tells what event to listen b) declares the name of the method used to handle the event.

The handler is simply a method our view-subclass. It has two parameters, target, which is the event target (h1-element in the above example)
and viewItem, which is the DOM node of the view item where the event was triggered.

The event listener attribute consists of 'on-' and the javascript event, e.g. 'on-click', 'on-keydown' etc.

The event listeners are initialized when the view is initialized if it had prerendered items, or when a view item is added and it has a valid event listener attribute which points to an existing event handler.

##Fetching data from the server

You can easily set up ajax functions by passing an extra parameter to the view when initializing it:

```js

    let apiOpts = [{name: 'getMoreItems', method: 'GET', url: '/api/items'}]
    let exampleView = new ExampleView('example-view-container', apiOpts);

```

The apiOpts is an array of configuration objects that are used in generating the server ajax call functions.
The ``name`` is the name of the function, medhot is the used HTTP-method (can be 'GET', 'POST', 'DELETE' or 'PUT')
and the url is the actual url the request is sent.

The generated 'GET'- and 'DELETE'-methods will accept a querystring as a parameter (e.g. '?item=1', not required)
The 'POST' method accepts the post-data sent in the request body as a parameter. 'PUT'-mehdot accepst querystring and request body data as parameter (in that order)

The funtions will be generated in the views api-property and they return a promise when called. Example with the above apiOpts would work like this:

```js

    exampleView.api.getMoreItems()
        .then(data => {
            this.appendToListView(data);
        })
        .catch(err => {
            console.error(err);
        });

```

You can have as many different ajax call functions as you need.

##Making the code nice and clean

You can take advantage of the fact that the view is created from a class. It is recommended to put as much code as you can into the view-subclass's mehtods, for example:

```js
class ExampleView extends View {

        getMoreItems() {
            this.api.getMoreItems()
            .then(data => {
                this.appendToListView(data);
            })
            .catch(err => {
                console.error(err);
            });
        }

        renderItem({id, title, content}) {
            // This HTML string will become the actual DOM node of the view item
            return(
                `<div view-item=${id}>
                    <h1>${title}</h1>
                    <p>${content}</p>
                </div>`
            );
        }

    }
```

##Carousel

Carma comes with a premade carousel subclass, which is pretty much plug and play. It renders arrows that can be used to change the items manually to the sides of the root node, and shows indicator circles at the bottom of the root node.
**Note: the arrows and the indicator circles need Font Awesome to work!**
The carousel changes the items autoamtically after a period of time. Only thing you need to worry about is again the renderItem-function, in which you define how a single carousel item looks like.

**Note: the carousel accepts the carousel items as a second parameter**

Example:

HTML

```html

    <div id="carousel-container"></div>

```


View
```js

    import Carousel from 'carma';

    class ExampleCarousel extends Carousel {

        renderItem({id, title, content}) {
            return(
                `<div view-item=${id}>
                    <h1>${title}</h1>
                    <p>${content}</p>
                </div>`
            );
        }

    }

```


Script

```js
    import ExampleCarousel from './views/example-carousel(or whatever)';

    let items = [{id: 1, title: 'title1', content: 'content1'},
                 {id: 2, title: 'title2', content: 'content2'}];

    let carousel = new ExampleCarousel('carousel-container', items);

```

And that's it, a working carousel.

##Calendar

Carma has a builtin calendar subclass also, but due to the complexity of calendars, it is not so plug and play as the carousel.
The calendar essentially takes event data for the currently visible month as a parameter, constructs an month matrix with weeks as rows and week days as columns
and inserts the events into the corresponding days and passes the matrix for the renderItem-function. It will be a bit more difficult to render a matrix.
