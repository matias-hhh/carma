import {expect} from 'chai';
import sinon from 'sinon';

import {View} from '../index.js';

describe('View-tests:', function() {

  const ROOT_NODE_ID = 'root-node';
  let rootNode;

  beforeEach(function() {
    rootNode = document.createElement('div');
    rootNode.id = ROOT_NODE_ID;
    document.body.appendChild(rootNode);
  });

  describe('Constructor', function() {

    it('should bootstrap to a DOM container with matching id', function() {

      let view = new View(ROOT_NODE_ID);
      expect(view.rootNode).to.equal(rootNode);

    });

    it('should apply eventlisteners to existing view-items', function() {

      let viewItem = document.createElement('div');
      viewItem.setAttribute('view-item', '1');
      viewItem.setAttribute('on-click', 'testOnClick');
      rootNode.appendChild(viewItem);

      let clickSpy = sinon.spy()

      class TestView extends View {}
      TestView.prototype.testOnClick = clickSpy;

      let view = new TestView(ROOT_NODE_ID);

      // Emit click-event
      var event = new Event('click');
      viewItem.dispatchEvent(event);

      // Now the click-event should have triggered the testOnClick aka clickSpy
      expect(clickSpy.calledOnce).to.be.true;

    });

    it('should create server api caller if an apiOpts-object in parameters',
        function() {

      let apiOpts = [
        {name: 'testCaller', method: 'GET', url: '/api/test'},
        {name: 'anotherCaller', method: 'GET', url: '/api/test'},
      ];

      let view = new View(ROOT_NODE_ID, apiOpts);

      expect(view.api.testCaller instanceof Function).to.be.true;
      expect(view.api.anotherCaller instanceof Function).to.be.true;

    });

  });

  describe('setListView', function() {

    it('should render new view items and append them to DOM replacing old ones ',
        function() {

      let oldViewItem = document.createElement('div');
      oldViewItem.innerHTML = 'test1';
      rootNode.appendChild(oldViewItem);

      class TestView extends View {
        renderItem({testProperty}) {
          return `<div>${testProperty}</div>`;
        }
      }

      let view = new TestView(ROOT_NODE_ID);

      let newViewItems = [
        {testProperty: 'test2'},
        {testProperty: 'test3'}
      ];

      view.setListView(newViewItems);

      expect(rootNode.childNodes[0].outerHTML).to.equal('<div>test2</div>');
      expect(rootNode.childNodes[1].outerHTML).to.equal('<div>test3</div>');

    });

  });

  describe('appendToListView', function() {

    it('should render new view items and append them to DOM after old ones ',
        function() {

      let oldViewItem = document.createElement('div');
      oldViewItem.innerHTML = 'test1';
      rootNode.appendChild(oldViewItem);

      class TestView extends View {
        renderItem({testProperty}) {
          return `<div>${testProperty}</div>`;
        }
      }

      let view = new TestView(ROOT_NODE_ID);

      let newViewItems = [
        {testProperty: 'test2'},
        {testProperty: 'test3'}
      ];

      view.appendToListView(newViewItems);

      expect(rootNode.childNodes[0].outerHTML).to.equal('<div>test1</div>');
      expect(rootNode.childNodes[1].outerHTML).to.equal('<div>test2</div>');
      expect(rootNode.childNodes[2].outerHTML).to.equal('<div>test3</div>');

    });

  });

  describe('setSingleItemView', function() {

    it('should render a new view item and append them to DOM replacing old ones ',
        function() {

      let oldViewItem = document.createElement('div');
      oldViewItem.innerHTML = 'test1';
      rootNode.appendChild(oldViewItem);

      class TestView extends View {
        renderItem({testProperty}) {
          return `<div>${testProperty}</div>`;
        }
      }

      let view = new TestView(ROOT_NODE_ID);

      let newViewItems = {testProperty: 'test2'};

      view.setSingleItemView(newViewItems);

      expect(rootNode.childNodes[0].outerHTML).to.equal('<div>test2</div>');

    });

    it('should throw TypeError when given an array of view items', function() {

      let view = new View(ROOT_NODE_ID);

      let newViewItems = [
        {testProperty: 'test2'},
        {testProperty: 'test3'}
      ];

      expect(view.setSingleItemView.bind(view, newViewItems)).to.throw(TypeError);

    });

  });

  describe('getViewItems', function() {

    it('should return all nodes with view-item-attribute', function() {

      for (let i = 0; i < 3; i++) {
        let viewItem = document.createElement('div');
        viewItem.setAttribute('view-item', i.toString());
        viewItem.innerHTML = 'test' + i;
        rootNode.appendChild(viewItem);
      }

      let view = new View(ROOT_NODE_ID);

      let viewItems = view.getViewItems();

      expect(rootNode.childNodes[0]).to.equal(viewItems[0]);
      expect(rootNode.childNodes[1]).to.equal(viewItems[1]);
      expect(rootNode.childNodes[2]).to.equal(viewItems[2]);

    });

  });

  describe('getViewItem', function() {

    it('should return the queried view item', function() {

      for (let i = 0; i < 3; i++) {
        let viewItem = document.createElement('div');
        viewItem.setAttribute('view-item', 'item ' + i);
        viewItem.innerHTML = 'test' + i;
        rootNode.appendChild(viewItem);
      }

      let view = new View(ROOT_NODE_ID);

      let viewItem = view.getViewItem('item 1');

      expect(rootNode.childNodes[1]).to.equal(viewItem);

    });

  });

  describe('removeAllViewItems', function() {

    it('should remove all nodes within the root node', function() {

      for (let i = 0; i < 3; i++) {
        let viewItem = document.createElement('div');
        viewItem.setAttribute('view-item', i.toString());
        viewItem.innerHTML = 'test' + i;
        rootNode.appendChild(viewItem);
      }

      let view = new View(ROOT_NODE_ID);

      view.removeAllViewItems();

      expect(rootNode.childNodes.length).to.equal(0);

    });

  });

  describe('removeViewItem', function() {

    it('should remove the queried view item from rootNode', function() {

      for (let i = 0; i < 3; i++) {
        let viewItem = document.createElement('div');
        viewItem.setAttribute('view-item', 'item ' + i);
        viewItem.innerHTML = 'test' + i;
        rootNode.appendChild(viewItem);
      }

      let view = new View(ROOT_NODE_ID);

      let viewItem = view.removeViewItem('item 1');

      expect(view.getViewItem('item 1')).to.be.null;
      expect(rootNode.childNodes.length).to.equal(2);

    });

  });

  afterEach(function() {
    document.body.removeChild(rootNode);
    rootNode = undefined;
  });

});
