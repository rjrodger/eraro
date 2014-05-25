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


var e2 = eraro('c2',{a:2}); delete e2.callpoint;
assert.equal("{ [Error: foo: c2] code: 'c2', foo: true, package: 'foo', msg: 'foo: c2', details: { a: 2 } }", 
             util.inspect(e2).replace(/\s+/g,' '))


var e3 = eraro('c3'); delete e3.callpoint;
assert.equal("{ [Error: foo: c3] code: 'c3', foo: true, package: 'foo', msg: 'foo: c3', details: {} }",
             util.inspect(e3).replace(/\s+/g,' '))


var e4 = eraro(); delete e4.callpoint;
assert.equal("{ [Error: foo: unknown] code: 'unknown', foo: true, package: 'foo', msg: 'foo: unknown', details: {} }",
             util.inspect(e4).replace(/\s+/g,' '))


var x0 = new Error('x0')
var e5 = eraro(x0); delete e5.callpoint;
assert.equal("{ [Error: x0] code: 'unknown', foo: true, package: 'foo', msg: 'foo: unknown', details: {} }",
             util.inspect(e5).replace(/\s+/g,' '))


var x1 = new Error('x1')
var e6 = eraro(x1,'c4'); delete e6.callpoint;
assert.equal("{ [Error: x1] code: 'c4', foo: true, package: 'foo', msg: 'foo: c4', details: {} }",
             util.inspect(e6).replace(/\s+/g,' '))


var x2 = new Error('x2')
var e7 = eraro(x2,'c5',{a:3}); delete e7.callpoint;
assert.equal("{ [Error: x2] code: 'c5', foo: true, package: 'foo', msg: 'foo: c5', details: { a: 3 } }",
             util.inspect(e7).replace(/\s+/g,' '))


var b0 = eraro('b0','<%=foo(1)%>')
assert.equal("foo: <%=foo(1)%> VALUES:{ code: \'b0\' } TEMPLATE ERROR: TypeError: string is not a function",b0.message)


var d0 = eraro('d0','<%=a.b%>', {a:{b:99}})
assert.equal("foo: 99",d0.message)
assert.ok(d0.callpoint.indexOf("eraro/test/eraro.test.js:"))
