/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


// node eraro.test.js

var util   = require('util')
var assert = require('assert')


var eraro = require('..')({package:'foo'})


var e1 = eraro('c1','m1',{a:1})

assert.equal('foo: m1',e1.message)
assert.equal('foo',e1.package)
assert.equal(true,e1.foo)
assert.equal('c1',e1.code)
assert.equal(1,e1.details.a)

var e2 = eraro('c2',{a:2})
assert.equal("{ [Error: foo: c2] foo: true, package: 'foo', code: 'c2', details: { a: 2 } }",util.inspect(e2))


var e3 = eraro('c3')
assert.equal("{ [Error: foo: c3] foo: true, package: 'foo', code: 'c3', details: {} }",util.inspect(e3))


var e4 = eraro()
assert.equal("{ [Error: foo: unknown] foo: true, package: 'foo', code: 'unknown', details: {} }",util.inspect(e4))


var x0 = new Error('x0')
var e5 = eraro(x0)
assert.equal("{ [Error: x0] foo: true, package: 'foo', code: 'unknown', details: {} }",util.inspect(e5))


var x1 = new Error('x1')
var e6 = eraro(x1,'c4')
assert.equal("{ [Error: x1] foo: true, package: 'foo', code: 'c4', details: {} }",util.inspect(e6))


var x2 = new Error('x2')
var e7 = eraro(x2,'c5',{a:3})
assert.equal("{ [Error: x2] foo: true, package: 'foo', code: 'c5', details: { a: 3 } }",util.inspect(e7))
