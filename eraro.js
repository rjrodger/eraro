/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";




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

  var packaje = options.package || 'unknown'
  var markers = options.markers || []

  var filename = module.filename
  if( filename ) markers.push(filename)

  var parentfilename = module.parent ? module.parent.filename : null
  if( parentfilename ) markers.push(parentfilename)


  return function ( code, msg, details ) {
    code    = 'string' === typeof(code)    ? code    : 'unknown'
    msg     = 'string' === typeof(msg)     ? msg     : code
    details = 'object' === typeof(details) ? details : {}

    var e = new Error(msg)

    e[packaje] = true
    e.package  = packaje

    e.code    = code
    e.details = details || {}

    // clean the stack
    e.stack = cleanstack( e, markers )

    return e;
  }
}

