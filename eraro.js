/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var util = require('util')



// Remove unwanted lines containing markers
function cleanstack( error, markers ) {
  var stack = error ? error.stack : null
  var out   = ''

  if( stack ) {
    var lines = stack.split('\n')
    var done = false

    line_loop:
    for( var i = 1; i < lines.length; i++ ) {
      var line = lines[i]

      var found = false
      for( var j = 0; j < markers.length; j++ ) {
        found = ( -1 != line.indexOf( markers[j] ) )
        if( found ) break;
      }

      if( !found ) break line_loop;;
    }

    out = ([lines[0]].concat(lines.slice(i))).join('\n')
  }

  return out
}



// make an error function
module.exports = function( options ) {
  options = options || {}

  var msgprefix = options.package ? options.package+': ' : ''
  var packaje   = options.package || 'unknown'
  var markers   = options.markers || []

  var filename = module.filename
  if( filename ) markers.push(filename)

  var parentfilename = module.parent ? module.parent.filename : null
  if( parentfilename ) markers.push(parentfilename)


  return function( ex, code, msg, details ) {
    var internalex = false

    if( !util.isError(ex) ) {
      internalex = true
      ex         = null
      code       = arguments[0]
      msg        = arguments[1]
      details    = arguments[2]
    }

    code    = 'string' === typeof(code)    ? code    : 'unknown'

    details = 
      ('object' === typeof(details)) ? 
      details : 
      ('object' === typeof(msg) && 'string' !== typeof(msg) ? msg : {});

    msg     = msgprefix + ('string' === typeof(msg) ? msg : code)

    if( !ex ) {
      ex = new Error(msg)
    }

    ex[packaje] = true
    ex.package  = packaje

    ex.code    = code
    ex.details = details || {}

    // clean the stack
    if( internalex ) {
      ex.stack = cleanstack( ex, markers )
    }

    return ex;
  }
}

