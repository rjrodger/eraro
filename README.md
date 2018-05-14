eraro
=====

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]

#### Create JavaScript Error objects with code strings, context details, and templated messages.

For use in library modules to generate contextual errors with useful
meta data. Your library module can throw or pass (to a callback) an
_Error_ object that has additional properties, such as a _code_, that
can be used for programmatic inspection by client code that uses your
library.

If you're using this module, feel free to contact me on twitter if you have any questions! :) [@rjrodger](http://twitter.com/rjrodger)


# Quick example

```JavaScript

var error = require('eraro')({package:'mylib'})

// throw an Error object that has a code
throw error('code_string')

// provide a user message
throw error('code_string', 'Message text.')

// supply context details for error
throw error('code_string', 'Message text.', {foo:1, bar:2})

// extend an existing Error object
var ex = new Error('Another message.')
throw error(ex,'code_string',{zed:3})
```

In all these cases, the Error object will have a `code`` property with
value `"code_string"`.


# Install

```bash
npm install eraro
```

There's an [npm module page for eraro](https://www.npmjs.org/package/eraro).


# Usage

Use this module when you are writing a library that will be used by
application code. It allows your library to generate informative error messages.

The module itself is a generator function (taking options) that
returns the error-creating function that you will actually use. Thus
the most common way to use _eraro_ is to require and call immediately:

```JavaScript
var error = require('eraro')({package:'mylib'})
```

The `error` function can then be used in your library code. The
`error` function generates `Error` objects, which can be thrown or used in callbacks:

```JavaScript
throw error('code1')

function doStuff (input, callback) {
  if (bad(input)) return callback(error('code2'));
}
```

The `package` option is normally the name of your library. That is, the value
of the `name` property in `package.json`. The generated Error object will
have two properties to define the package: `package`, a string that is
the name of the package, and also a boolean, the name of the package itself.
This lets you check for the type of error easily:

```JavaScript
var error = require('eraro')({package:'mylib'})

var err0 = error('code0')
"mylib" === err0.package // true
err0.mylib // true
```


## Error details

You can supply additional contextual details for debugging or other
purposes. These are placed inside the _details_ property of the
generated Error:

```JavaScript
var error = require('eraro')({package:'mylib'})

var err0 = error('code0', {foo: 'FOO', bar: 'BAR'})
"FOO" === err0.details.foo
"BAR" === err0.details.bar
```


## Error codes and message templates

To provide consistent error messages to your users, you can define a set of message templates, keyed by code:

```JavaScript
var error = require('eraro')({package: 'mylib', msgmap: {
  code0: "The first error, foo is <%=foo%>.",
  code1: "The second error, bar is <%=bar%>.",
}})
```

When you specify a code, and details, these are inserted into the message (if any) associated with that code:

```JavaScript
var err0 = error('code0',{foo: 'FOO', bar: 'BAR'})
"mylib: The first error, foo is FOO." === err0.message
```

The message templates are [underscorejs templates](http://underscorejs.org/#template)
with the default settings.

If you specify a message directly, this is also interpreted as a template:

```JavaScript
var err0 = error('code2',
                 'My custom message, details: <%=util.inspect(zed)%>',
                 {zed: {a: 1, b: 2}})
"mylib: My custom message, details: { a: 1, b: 2 }" === err0.message
```


# The returned Error object

The returned Error object has the following additional properties:

   * `code`: String; the code string
   * `package`: String; the package name
   * **`package-name`**: Boolean (true); a convenience marker for the package
   * `msg`: String; the generated message, may differ from original exception message (if any)
   * `details`: Object; contextual details of error
   * `callpoint`: String; first line of stacktrace that is external to eraro and calling module

You can pass in an existing Error object. The additional properties
will be added to it, but the original message will be used as the
message template, overriding any matching code message.


# Options

When creating an `error` function, you can use the following options:

   * `package` : (_optional_) String; package name to mark Error objects
   * `prefix`  : (_optional_) Boolean/String; If false, then no prefix is used; If not defined, the package name is used
   * `module`  : (_optional_) Object; `module` object to use as starting point for `require` calls
   * `msgmap`  : (_optional_) Object; map codes to message templates
   * `inspect` : (_optional_) Boolean; If true, `util.inspect` is called on values; default: true.


# In the Wild

For real-world usage examples, see:

  * _[use-plugin](http://github.com/rjrodger/use-plugin)_: a utility for providing a plugin interface for extensions to your module
  * _[seneca](http://github.com/rjrodger/seneca)_: a micro-services framework for Node.js


[npm-badge]: https://badge.fury.io/js/eraro.svg
[npm-url]: https://badge.fury.io/js/eraro
[travis-badge]: https://api.travis-ci.org/rjrodger/eraro.svg
[travis-url]: https://travis-ci.org/rjrodger/eraro
[coveralls-badge]:https://coveralls.io/repos/rjrodger/eraro/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/rjrodger/eraro?branch=master
[david-badge]: https://david-dm.org/rjrodger/eraro.svg
[david-url]: https://david-dm.org/rjrodger/eraro
