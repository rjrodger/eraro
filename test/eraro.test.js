/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


// node eraro.test.js

var util   = require('util')
var assert = require('assert')


var eraro = require('..')({package:'foo'})


var e1 = eraro('c1','m1 a:<%=a%>',{a:1})

assert.equal('foo: m1 a:1',e1.message)
assert.equal('foo',e1.package)
assert.equal(true,e1.foo)
assert.equal('c1',e1.code)
assert.equal(1,e1.details.a)


function descerr(err) {
  var out = {message:err.message, code:err.code, package:err.package, msg:err.msg, details:err.details}
  return util.inspect(out).replace(/\s+/g,' ')
}


var e2 = eraro('c2',{a:2});
assert.equal("{ message: 'foo: c2', code: 'c2', package: 'foo', msg: 'foo: c2', details: { a: 2 } }", 
             descerr(e2))


var e3 = eraro('c3');
assert.equal("{ message: 'foo: c3', code: 'c3', package: 'foo', msg: 'foo: c3', details: {} }",
             descerr(e3))


var e4 = eraro();
assert.equal("{ message: 'foo: unknown', code: 'unknown', package: 'foo', msg: 'foo: unknown', details: {} }",
             descerr(e4))


var e41 = eraro(eraro('c4'));
assert.equal("{ message: 'foo: c4', code: 'c4', package: 'foo', msg: 'foo: c4', details: {} }",
             descerr(e41))


var x0 = new Error('x0')
var e5 = eraro(x0);
assert.equal("{ message: 'foo: x0', code: 'x0', package: 'foo', msg: 'foo: x0', details: {} }",
             descerr(e5))


var x1 = new Error('x1')
var e6 = eraro(x1,'c4');
assert.equal("{ message: 'foo: c4', code: 'c4', package: 'foo', msg: 'foo: c4', details: {} }",
             descerr(e6))
assert.equal(e6.orig,'Error: x1')


var x2 = new Error('x2')
var e7 = eraro(x2,'c5',{a:3});
assert.equal("{ message: 'foo: c5', code: 'c5', package: 'foo', msg: 'foo: c5', details: { a: 3 } }",
             descerr(e7))



var b0 = eraro('b0','<%=foo(1)%>')
assert.equal("foo: <%=foo(1)%> VALUES:{ code: \'b0\' } TEMPLATE ERROR: TypeError: string is not a function",b0.message)


var bar0 = require('..')({package:'bar',prefix:'BAR-'})
assert.equal('BAR-code0',bar0('code0').message)


var bar1 = require('..')({package:'bar',prefix:false})
assert.equal('code1',bar1('code1').message)


var e8 = eraro('i0','<%=a%>', {a:{b:99}})
assert.equal('foo: { b: 99 }',e8.message)



