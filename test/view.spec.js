import {expect} from 'chai';
import sinon from 'sinon';
import {View} from '../index.js';


describe('Constructor', function() {

    let rootNode;

    beforeEach(function() {
      rootNode = document.createElement('div');
      rootNode.id = 'root-node';
      document.body.appendChild(rootNode);
    });

    it('should bootstrap to a container with matching id', function() {

      let view = new View('root-node');
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

      let view = new TestView('root-node');

      // Emit click-event
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, false);
      viewItem.dispatchEvent(event);

      // Now the click-event should have triggered the testOnClick aka clickSpy
      expect(clickSpy.calledOnce).to.be.true;

    });

    it('should create server api caller if an apiOpts-object in parameters', function() {

      let apiOpts = [
        {name: 'testCaller', method: 'GET', url: '/api/test'},
        {name: 'anotherCaller', method: 'GET', url: '/api/test'},
      ];

      let view = new View('root-node', apiOpts);

      expect(view.api.testCaller instanceof Function).to.be.true;
      expect(view.api.anotherCaller instanceof Function).to.be.true;

    });

    afterEach(function() {
      document.body.removeChild(rootNode);
      rootNode = undefined;
    });

});