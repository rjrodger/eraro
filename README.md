eraro
=====

### Create JavaScript Error objects with code strings, context details, and uncluttered stacktraces

For use in library modules to generate contextual errors. Your library
module can return an error code for programmatic inspection by calling
code, and error details as a context object for custom messages and
fault inspection.

Stack trace lines referring to _eraro_ itself, and your library, are
removed. This means that the first line of the stack trace refers to
the position in user code where your library was called.



```JavaScript

var error = require('eraro')()

throw error('code_string')

// provide a user message
throw error('code_string', 'Message text.')

// supply context details for error
throw error('code_string', 'Message text.', {foo:1, bar:2})

throw error('code_string', {foo:1, bar:2})

```

The Error object has the following additional properties:

  * _code_: code string
  * _details_: context details object




### Support

If you're using this module, feel free to contact me on twitter if you have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.1.1

Tested on: node 0.10.26

[![Build Status](https://travis-ci.org/rjrodger/eraro.png?branch=master)](https://travis-ci.org/rjrodger/eraro)



...more docs to follow...
