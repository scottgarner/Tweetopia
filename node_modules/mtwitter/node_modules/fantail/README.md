♫ ♭♩ Fantail
============

[![Build Status](https://travis-ci.org/passcod/fantail.png)](//travis-ci.org/passcod/fantail)
[![NPM version](https://badge.fury.io/js/fantail.png)](//npmjs.org/package/fantail)
[![Dependency Status](https://gemnasium.com/passcod/fantail.png)](//gemnasium.com/passcod/fantail)

```javascript
var Fantail = require('fantail');
```


## Instantiation

```javascript
var sch = new Fantail;
```

### Options

Options are set at instantiation and can't be modified afterwards.

```javascript
var sch = new Fantail({
  debug: false,     // Expose queues and handlers.
  throttle: 200,    // Run handlers (at most once) every 200 milliseconds
  immediate: false  // .start() immediately.
});
```


## .push(arg: any [, arg2: any [, …]])

You can push to the queue whenever you wish.

```javascript
sch.push(foo);
```

You can push multiple values at the same time.

```javascript
sch.push(bar, baz);
```


## .addHandler(name: string, func: function)

Handlers process items. They are named.

```javacript
sch.addHandler('something', function(item) {
  // do something
});
```


## .addPicker(iter: function, time: int, limit: int)

Pickers filter the queue. They are run every `time` milliseconds, and can
be limited to `limit` items per run (`limit` is optional); the default is to go
through everything. They are passed the item and nothing else, and have access
to two methods on the `this` object:

- `this.stop()` stops the current picker run after the present iteration.

- `this.handle(name: string)` schedules the handler `name` to be
  executed with the item as parameter. As soon as `this.handle()`
  is called, the item is removed from the queue. Subsequent calls
  to `this.handle()` *within the same function* will schedule
  additional handlers for the same item.

```javascript
var pickerId = sch.addPicker(function(item) {
  if (item % 2 === 0) {
    this.handle('something');
  }
  
  if (item === 42) {
    this.stop();
  }
});
```

It returns the `pickerId`, which can be used to modify the picker at runtime.
This is mostly useful to adjust the `interval` or `limit`. A limit of 0 will
disable the picker.


## .start()

Start processing the queue. Useful if you need to do some preparation before
firing things off but still want to be able to push things onto the queue.


## .pickers

Access the array of pickers. This is useful to modify a picker, see above.


## .started

You may want to know whether you've called start() yet. Or not.

## Debug mode

Using `debug: true` in the instantiation config exposes both internal queues
(`todo` and `doing`) and the `handlers` object. These are not useful for most
cases, but if you need them they're just a flag away, no need to tweak shit.


Community
=========

- All authors and contributors are listed in the `package.json`.
- Pull requests need to adhere to the [style guide].
- API is tested. Run `npm test` to ensure it works.
- Code is linted. Run `npm run-script lint` to ensure you're good.
- No license. This is released in the public domain.

[style guide]: //github.com/passcod/node-style-guide