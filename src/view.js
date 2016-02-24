import resource from './resource';

export default class View {

  constructor(rootNodeId, apiOpts=undefined) {
    this.rootNode = document.getElementById(rootNodeId);
    this.eventAttributes = ['on-mousedown', 'on-mouseenter', 'on-mouseleave', 'on-change', 'on-keyup', 'on-click', 'on-keydown'];
    this.currentViewItemId = 0;

    // Apply event listeners to pre-rendered items
    let preRenderedItems = this.getViewItems();
    if (preRenderedItems) {
      for (let i = 0; i < preRenderedItems.length; i++) {
        this.currentViewItemId++;
        this.applyEventListeners(preRenderedItems[i]);
      }
    }

    // Prepare interface for server api interaction
    if (apiOpts) {
      this.createApiFunctions(apiOpts);
    }
  }

  /* Main view handling methods */

  // Set a view made from a list of view items (replaces current view items)
  setListView(modelInstances) {
    this.removeAllViewItems();
    let viewItems = this.renderViewItemList(modelInstances);
    this.appendViewItemsToDOM(viewItems);
  }

  // Append a list of items to an existing view
  appendToListView(modelInstances) {
    let viewItems = this.renderViewItemList(modelInstances);
    this.appendViewItemsToDOM(viewItems);
  }

  // Set a view consisting of a single view item
  setSingleItemView(modelInstances) {
    this.removeAllViewItems();
    let viewItem = this.renderViewItem(modelInstances);
    this.appendViewItemsToDOM(viewItem);
  }

  // Return a array-like list of all the DOM-nodes of the view items
  getViewItems() {
    return this.rootNode.querySelectorAll('[view-item]');
  }

  // Get a single view item DOM node
  getViewItem(viewItemId) {
      return this.rootNode.querySelector(`[view-item=${viewItemId}]`);
  }

  removeAllViewItems() {
    while (this.rootNode.hasChildNodes()) {
      this.rootNode.removeChild(this.rootNode.lastChild);
    }
  }

  removeViewItem(viewItemId) {
    let viewItem = this.rootNode.querySelector(`[view-item=${viewItemId}]`);
    this.rootNode.removeChild(viewItem);
  }

  /* AJAX functionality */

  createApiFunctions(apiOpts) {
    this.api = {};
    apiOpts.forEach(({name, method, url}) => {

      switch (method) {

        case 'GET':
        case 'DELETE':
          this.api[name] = function(query) {

            if (!query) {
              query = '';
            }

            return resource(method, url + query);
          };
          break;

        case 'POST':
          this.api[name] = function(data) {
            return resource(method, url, data);
          };
          break;

        case 'PUT':
          this.api[name] = function(query, data) {
            return resource(method, url + query, data);
          };
          break;
      }

    });
  }

  /* Internal methods */

  // Search for event attributes in the nodes of a given viewItem and add
  // a corresponding event listener to that node
  applyEventListeners(viewItem) {

    this.eventAttributes.forEach(eventAttribute => {

      let nodes = viewItem.querySelectorAll(`[${eventAttribute}]`);

      // Check if the viewItem node itself has an eventlistener attribute
      if (viewItem.getAttribute(eventAttribute)) {
        let eventName = eventAttribute.substr(3);
        let eventListenerName = viewItem.getAttribute(eventAttribute);
        let eventListener = event => {
          this[eventListenerName](event, viewItem);
        };
        viewItem.addEventListener(eventName, eventListener);
      }

      for (let i = 0; i < nodes.length; i++) {
        let eventName = eventAttribute.substr(3);
        let eventListenerName = nodes[i].getAttribute(eventAttribute);
        nodes[i].addEventListener(eventName, event => {
          this[eventListenerName](event, viewItem);
        });
      }

    });

  }

  // Create nodes from model instances. The newly created nodes are stored
  // in this.createdItems. Accepts both instance arrays and single ones
  renderViewItemList(modelInstances) {

    let viewItems = [];

    modelInstances.forEach(instance => {
      viewItems.push(this.renderViewItem(instance));
    });

    return viewItems;
  }

  // Helper function for creating a single viewItem
  renderViewItem(modelInstance) {

    // Create a temporary container for the node.
    let node = document.createElement('div');

    // renderItem turns the model instance to html. It is not defined
    // in the View class, hence it must be defined separately in every child
    // class
    node.innerHTML = this.renderItem(modelInstance);

    if (node.childNodes.length > 1) {
      console.error('ERROR: template must have only one containing node');
    }

    // Ditch the containing node so that the node is exactly like
    // it is in the template
    node = node.firstChild;

    return node;
  }

  // Appends created items to dom (below the existing ones). Accepts single
  // node or an array of nodes.
  appendViewItemsToDOM(nodes) {

    if (nodes instanceof Array) {
      nodes.forEach((node) => {
        this.rootNode.appendChild(node);
        this.applyEventListeners(node);
      });

    } else {
      this.rootNode.appendChild(nodes);
      this.applyEventListeners(nodes);
    }
  }

}
