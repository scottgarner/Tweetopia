/*global describe, it, beforeEach*/
'use strict';

var assert  = require('assert');
var Fantail = require('../index');

describe('Fantail', function() {
  it('should be a function', function() {
    assert.equal(typeof Fantail, 'function');
  });

  it('should be a contructor', function() {
    var t = new Fantail();
    assert.equal(typeof t, 'object');
  });
});

describe('An instance of Fantail', function() {
  var t = new Fantail();

  it('should have .push', function() {
    assert.equal(typeof t.push, 'function');
  });

  it('should have .addHandler', function() {
    assert.equal(typeof t.addHandler, 'function');
  });

  it('should have .addPicker', function() {
    assert.equal(typeof t.addPicker, 'function');
  });

  it('should have .start', function() {
    assert.equal(typeof t.start, 'function');
  });

  it('should have .started', function() {
    assert.equal(typeof t.started, 'boolean');
  });

  it('should have .pickers', function() {
    assert.equal(typeof t.pickers, 'object');
  });
});

describe('Pushing to the queue', function() {
  var t;

  beforeEach(function() {
    t = new Fantail({debug: true});
  });

  it('(queue should be empty at init)', function() {
    assert.equal(t.todo.length, 0);
  });

  it('should work with a single value', function() {
    t.push(1);
    assert.equal(t.todo.length, 1);
  });

  it('should work with multiple values', function() {
    t.push(0,1,2,3,4,5,6,7,8,9);
    assert.equal(t.todo.length, 10);
  });
});

describe('Typical operation', function() {
  var t = new Fantail({debug:true});
  var log = [];

  it('add items before anything', function() {
    t.push(1,2,3,4,5);
    assert.equal(t.todo.length, 5);
  });

  it('add a handler', function(done) {
    t.addHandler('log', function(item) {
      log.push(item);
    });
    done();
  });

  it('add more items', function() {
    t.push(6,7,8,9,0);
    assert.equal(t.todo.length, 10);
  });

  it('add a picker', function() {
    t.addPicker(function(item) {
      if (item % 2 === 0) {
        this.handle('log');
      }
    }, 50);
    assert.equal(t.pickers.length, 1);
  });

  it('start it up', function(done) {
    t.start();
    assert.equal(t.started, true);
    setTimeout(function() {
      assert.equal(log.length, 5);
      done();
    }, 50);
  });

  it('add items while running', function(done) {
    t.push(10,15,20,25,30);
    setTimeout(function() {
      assert.equal(log.length, 8);
      done();
    }, 150);
  });
});
