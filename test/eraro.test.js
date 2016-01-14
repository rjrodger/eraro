/* Copyright (c) 2014 Richard Rodger, MIT License */
'use strict';

var util   = require('util')
var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var Eraro = require('..')
var eraro = Eraro({
    package:'foo',
    msgmap:{
        c401: 'C401 Message'
    }
})

function describeError(err) {
    var out = { message: err.message, code: err.code,
                package: err.package, msg: err.msg, details: err.details}
    return out;
}

describe('eraro', function(){

    it('basic error', function(done){
        var e1 = eraro('c1','m1 a:<%=a%>',{a:1})

        expect(e1.message).to.equal('foo: m1 a:1')
        expect(e1.package).to.equal('foo')
        expect(e1.foo).to.be.true()
        expect(e1.code).to.equal('c1')
        expect(e1.details.a).to.equal(1)

        done()
    })



    it('several error devinitions', function(done){
        var e2 = eraro('c2',{a:2}),
            e3 = eraro('c3'),
            e4 = eraro(),
            e41 = eraro(eraro('c41'))

        expect(describeError(e2)).to.deep.equal({ message: 'foo: c2', code: 'c2',
                                                  package: 'foo', msg: 'foo: c2', details: { a: 2 } })
        expect(describeError(e3)).to.deep.equal({ message: 'foo: c3', code: 'c3',
                                                  package: 'foo', msg: 'foo: c3', details: {} })
        expect(describeError(e4)).to.deep.equal({ message: 'foo: unknown', code: 'unknown',
                                                  package: 'foo', msg: 'foo: unknown', details: {} })
        expect(describeError(e41)).to.deep.equal({ message: 'foo: c41', code: 'c41', package: 'foo',
                                                   msg: 'foo: c41', details: {} })
        done()
    })


    it('wrap an error in details', function(done){

        var x0 = new Error('x0'),
            x1 = new Error('x1'),
            x11 = new Error('x11'),
            x2 = new Error('x2')

        var e5 = eraro(x0),
            e6 = eraro(x1,'c4'),
            e61 = eraro(x11, 'c401'),
            e7 = eraro(x2, 'c5', {a: 3})

        expect(describeError(e5)).to.deep.equal({ message: 'foo: x0', code: 'x0', package: 'foo', msg: 'foo: x0', details: { 'orig$': x0, 'message$': 'x0' } }) //  "[Error: x0]"

        expect(describeError(e6)).to.deep.equal({ message: 'foo: x1', code: 'c4', package: 'foo', msg: 'foo: x1', details: { 'orig$': x1, 'message$': 'x1' } }) // "[Error: x1]"

        expect(e6.orig).to.deep.equal(x1)

        expect(describeError(e61)).to.deep.equal({ message: 'foo: C401 Message', code: 'c401', package: 'foo', msg: 'foo: C401 Message', details: { 'orig$': x11, 'message$': 'x11' } })

        expect(e61.orig).to.equal(x11)

        expect(describeError(e7)).to.deep.equal({ message: 'foo: x2', code: 'c5', package: 'foo', msg: 'foo: x2', details: { a: 3, 'orig$': x2, 'message$': 'x2' } }) // [Error: x2]

        done()
    })

    it('handle templates', function(done){

        expect(eraro('b0','<%=foo(1)%>').message).to
            .contain("foo: <%=foo(1)%> VALUES:{ code: \'b0\' } TEMPLATE ERROR: TypeError:")
            .and.contain("is not a function")

        var templatedError = eraro('i0','<%=a%>', {a: {b: 99 }})
        expect(templatedError.message).to.equal('foo: { b: 99 }')

        done()
    })


    it('handle different erraros', function(done){
        var fooEraro = Eraro({ package:'barfoo', prefix:'FOO-' })
        expect(fooEraro('code0').message).to.equal('FOO-code0')

       var barEraro = Eraro({ package:'bar', prefix:false })
       expect(barEraro('code1').message).to.equal('code1')

       done()
    })
})
