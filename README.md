eraro
=====

### Create JavaScript Error objects with code strings, context details, and uncluttered stacktraces

For use in library modules to generate contextual errors.


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


The stacktrace is cleaned by removing references to the calling module. Thus the first line of the stack trace refers to the location in user code where the error was triggered.


...more docs to follow...
