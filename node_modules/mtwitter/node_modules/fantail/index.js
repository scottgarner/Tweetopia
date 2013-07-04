// ## ♫ ♭♩ Fantail
// Chirp chirp. Simple schedule-managed queue.
//
// - Github: https://github.com/passcod/fantail
// - npm: https://npmjs.org/package/fantail
// - Travis-CI: https://travis-ci.org/passcod/fantail
// - This document: https://passcod.name/fantail

'use strict';

var _ = require('underscore');

module.exports = function(config) {
  // ### Defaults
  config = _.defaults(config || {}, {
    // Expose queues and handlers.
    debug: false,
    // Run handlers (at most once) every 200 milliseconds.
    throttle: 200,
    // .start() immediately.
    immediate: false
  });

  var todo      = [];
  var doing     = [];
  var handlers  = {};
  var pickers   = [];

  // ### .push(arg: any [, arg2: any [, …]])
  // [Public](//github.com/passcod/fantail#pusharg-any--arg2-any--)
  //
  // Any kind of item can be pushed at any moment
  // to the queue, and multiple items are fine too.
  var push = function() {
    _.each(arguments, function(item) {
      todo.push(item);
    });
  };

  // ### runPicker(picker: object)
  // *Private*
  //
  // Run a picker, and schedules the next run.
  var runPicker = function(picker) {
    if (picker.limit !== 0) {
      // A limit of 0 essentially disables the picker.
      var i = 0;
      todo.some(function(item, index) {
        var breaking = i === picker.limit;
        var used = false;
        picker.func.call({
          stop: function() {
            breaking = true;
          },
          handle: function(name) {
            used = true;
            doing.push({
              subject: item,
              handler: handlers[name]
            });
          }
        }, item);

        if (used) {
          // This leaves the queues in a pretty ugly shape,
          // consider consolidating them every so often.
          delete todo[index];
        }

        i += 1;
        return breaking;
      });
    }

    // Scheduling is done using `setTimeout` not `setInterval`
    // so the interval can be changed at runtime.
    setTimeout(function() {
      runPicker(picker);
    }, picker.interval);
    throttledHandlerRun();
  };

  // ### handlerRun()
  // *Private*
  //
  // Run all the handlers we've got queued so far.
  var handlerRun = function() {
    doing.forEach(function(item, index) {
      delete doing[index];
      item.handler(item.subject);
    });
  };

  // ### throttledHandlerRun()
  // *Private*
  //
  // We don't want handlerRun to be executed too often,
  // so we throttle it according to the config (def 200ms).
  var throttledHandlerRun = _.throttle(handlerRun, config.throttle);

  // ### .addPicker(iterator: function, interval: int, limit: int optional)
  // [Public
  // ](//github.com/passcod/fantail#addpickeriter-function-time-int-limit-int)
  //
  // Add a picker to the list. If we're started, run it immediately,
  // otherwise that'll be done later. Return the index it's inserted at.
  var addPicker = function(func, interval, limit) {
    var i = pickers.push({
      func: func,
      interval: interval,
      limit: limit
    });

    if (this.started) {
      runPicker(pickers[i]);
    }

    return i;
  };

  // ### .addHandler(name: string, func: function)
  // [Public](//github.com/passcod/fantail#addhandlername-string-func-function)
  //
  // Pretty much does as marked on the tin.
  var addHandler = function(name, func) {
    handlers[name] = func;
  };

  // ### .start()
  // [Public](//github.com/passcod/fantail#start)
  //
  // Start processing the queue:
  // - Flip the on switch
  // - Schedule pickers to run
  // - Do an initial handler run
  // - Schedule subsquent handler runs
  var start = function() {
    this.started = true;
    pickers.forEach(runPicker);
    setInterval(throttledHandlerRun, config.throttle);
    throttledHandlerRun();
  };


  // *Public* and *private* means fuck all in Javascript.
  // Throughout this document, they are taken to mean,
  // respectively: "is exposed by default" and "isn't".
  this.push       = push;
  this.addPicker  = addPicker;
  this.addHandler = addHandler;
  this.start      = start;
  this.started    = false;
  this.pickers    = pickers;

  // Expose a few internals. Used mainly for testing.
  if (config.debug) {
    this.todo     = todo;
    this.doing    = doing;
    this.handlers = handlers;
  }

  // Now that everything is swell…
  if (config.immediate) {
    start();
  }
};
