/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


// node eraro.test.js

var util   = require('util')
var assert = require('assert')


var eraro = require('..')({package:'foo'})


var e1 = eraro('c1','m1',{a:1})
//console.log(e1)

assert.equal('m1',e1.message)
assert.equal('foo',e1.package)
assert.equal(true,e1.foo)
assert.equal('c1',e1.code)
assert.equal(1,e1.details.a)

var e2 = eraro('c2',{a:2})
assert.equal("{ [Error: c2] foo: true, package: 'foo', code: 'c2', details: {} }",util.inspect(e2))


var e3 = eraro('c3')
assert.equal("{ [Error: c3] foo: true, package: 'foo', code: 'c3', details: {} }",util.inspect(e3))


var e4 = eraro()
assert.equal("{ [Error: unknown] foo: true, package: 'foo', code: 'unknown', details: {} }",util.inspect(e4))
