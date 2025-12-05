/* Copyright (c) 2014-2023 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */

// Create JavaScript Error objects with code strings, context details,
// and templated messages.
'use strict'

// #### System modules
const Util = require('util')

// Use Error.isError (Node 24+) when available, fall back to Util.types.isNativeError
const isNativeError =
  typeof Error.isError === 'function'
    ? Error.isError
    : Util.types.isNativeError

// #### Exports
module.exports = eraro

// #### Create an _eraro_ function
// Parameters:
//
//   * _options_ : (optional) Object; properties:
//      * _package_ : (optional) String; package name to mark Error objects
//      * _prefix_  : (optional) Boolean/String; If false, then no prefix is used; If not defined, the package name is used
//      * _module_  : (optional) Object; _module_ object to use as starting point for _require_ calls
//      * _msgmap_  : (optional) Object; map codes to message templates
//      * _inspect_ : (optional) Boolean; If true, _Util.inspect_ is called on values; default: true.
//
// Returns: Function
//
// The created function has parameters:
//
//   * _exception_ : (optional) Error; the original exception to be wrapped
//   * _code_ : (optional) String; code value
//   * _message_ : (optional) String; error message, will be processed as a template
//   * _details_ : (optional) Object; contextual details of the error, used to insert details into message
//
// and returns an Error object (to be thrown or used in a callback, as needed).
// The returned Error object has the following additional properties:
//
//   * _code_: String; the code string
//   * _package_: String; the package name
//   * _**package-name**_: Boolean (true); a convenience marker for the package
//   * _msg_: String; the generated message, may differ from original exception message (if any)
//   * _details_: Object; contextual details of error
//   * _callpoint_: String; first line of stacktrace that is external to eraro and calling module
function eraro(options) {
  options = options || {}

  const msgprefix =
    false === options.prefix
      ? ''
      : 'string' === typeof options.prefix
      ? options.prefix
      : 'string' === typeof options.package
      ? options.package + ': '
      : ''

  const pkg = options.package || 'unknown'
  const callmodule = options.module || module
  const msgmap = options.msgmap || {}
  const inspect = null == options.inspect ? true : !!options.inspect

  const markers = [module.filename]

  const filename = callmodule.filename
  if (filename) {
    markers.push(filename)
  }

  const errormaker = function (ex, code, msg, details) {
    if (isNativeError(ex)) {
      if (ex.eraro && !options.override) {
        return ex
      }
    } else {
      ex = null
      code = arguments[0]
      msg = arguments[1]
      details = arguments[2]
    }

    code =
      'string' === typeof code
        ? code
        : ex
        ? ex.code
          ? ex.code
          : ex.message
          ? ex.message
          : 'unknown'
        : 'unknown'

    details =
      'object' === typeof details ? details : 'object' === typeof msg ? msg : {}

    if (ex) {
      details.errmsg = ex.message
      details.errline = callpoint(ex, markers)
    }

    msg = 'string' === typeof msg ? msg : null
    msg = buildmessage(
      options,
      msg,
      msgmap,
      msgprefix,
      inspect,
      code,
      details,
      ex,
    )

    const err = new Error(msg)

    if (ex) {
      details.orig$ = null == details.orig$ ? ex : details.orig$
      details.message$ =
        null == details.message$ ? ex.message : details.message$

      // drag along properties from original exception
      for (const p in ex) {
        err[p] = ex[p]
      }
    }

    err.eraro = true

    err.orig = ex // orig
    err.code = code
    err[pkg] = true
    err.package = pkg
    err.msg = msg
    err.details = details

    err.stack = ex ? ex.stack : err.stack
    err.callpoint = details.errline || callpoint(err, markers)

    return err
  }

  errormaker.callpoint = callpoint

  errormaker.has = function (code) {
    return !!msgmap[code]
  }

  return errormaker
}

// #### Find the first external stack trace line.
// Parameters:
//
//   * _error_ : (optional) Error; provides the stack
//   * _markers_ : (optional) Array[String]; ignore lines containing these strings
//
// Returns: String; stack trace line, with indent removed
function callpoint(error, markers) {
  markers = Array.isArray(markers) ? markers : []

  const stack = error ? error.stack : null
  let out = ''

  if (stack) {
    const lines = stack.split('\n')
    let i = 0

    line_loop: for (i = 1; i < lines.length; i++) {
      const line = lines[i]

      let found = false
      for (let j = 0; j < markers.length; j++) {
        if ('string' === typeof markers[j]) {
          found = -1 != line.indexOf(markers[j])
          if (found) break
        }
      }

      if (!found) break line_loop
    }

    out = 'string' === typeof lines[i] ? lines[i].substring(4) : out
  }

  return out
}

// #### Build the message string from a template by inserting details
// Uses the underscore template function with default settings.
// The original message (_msg_) has priority over messages from the _msgmap_.
// If no message can be found, the _code_ is used as a message.
// If an insert property is not defined, it is replaced with _[name?]_ in the message.
// As a convenience, _util_ and ___ are made available in the templates.
//
// Parameters:
//
//   * _msg_ : (required) String; message template
//   * _msgmap_ : (required) Object; map codes to message templates
//   * _msgprefix_: (required) String; prefix for all messages, useful as indentification of error origin
//   * _code_: (required) String; error code
//   * _details_: (required) Object; error details providing context
//
// Returns: String; human readable error message
function buildmessage(
  options,
  msg,
  msgmap,
  msgprefix,
  _inspect,
  code,
  details,
  ex,
) {
  let message =
    msgprefix +
    ('string' === typeof msg
      ? msg
      : 'string' === typeof msgmap[code]
      ? msgmap[code]
      : ex
      ? originalmsg(options.override, ex)
      : code)

  // These are the inserts.
  let valmap = Object.assign({}, details, { code: code })

  message = message.replace(/<%=\s*(.*?)\s*%>/g, (m, p1) => {
    let val = valmap[p1]
    val = 'object' === typeof val && null != val ? stringify(val) : val

    return val
  })

  return message
}

function stringify(val) {
  try {
    return JSON.stringify(val)
      .substring(0, 111)
      .replace(/([^\\])"/g, '$1')
  } catch (e) {
    return '' + val
  }
}

function originalmsg(override, ex) {
  if (!ex) return

  if (override && ex.eraro && ex.orig) return ex.orig.message

  return ex.message
}
