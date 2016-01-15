/* Copyright (c) 2014 Richard Rodger, MIT License */
'use strict';

var util = require('util')
var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var Eraro = require('..')
var eraro = Eraro({
    package: 'foo',
    msgmap: {
        c401: 'C401 Message'
    }
})

function describeError(err) {
    return {
        message: err.message,
        code: err.code,
        package: err.package,
        msg: err.msg,
        details: err.details
    }
}

describe('eraro', function () {

    it('basic error', function (done) {
        var e1 = eraro('c1', 'm1 a:<%=a%>', {a: 1})

        expect(e1.message).to.equal('foo: m1 a:1')
        expect(e1.package).to.equal('foo')
        expect(e1.foo).to.be.true()
        expect(e1.code).to.equal('c1')
        expect(e1.details.a).to.equal(1)

        done()
    })


    describe('several error definitions', function (done) {

        it('with prefix and context', function (done) {
            var erraror = eraro('c2', {a: 2})
            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: c2', code: 'c2',
                package: 'foo', msg: 'foo: c2', details: {a: 2}
            })
            done()
        })

        it('with prefix', function (done) {
            var erraror = eraro('c3')
            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: c3', code: 'c3',
                package: 'foo', msg: 'foo: c3', details: {}
            })
            done()
        })

        it('with no arg', function (done) {
            var erraror = eraro()
            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: unknown', code: 'unknown',
                package: 'foo', msg: 'foo: unknown', details: {}
            })
            done()
        })

        it('with an other erraro', function (done) {
            var erraror = eraro(eraro('c41'))
            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: c41', code: 'c41', package: 'foo',
                msg: 'foo: c41', details: {}
            })
            done()
        })
    })


    describe('wrap an error in details', function () {

        it('simple error', function (done) {
            var err = new Error('x0')
            var erraror = eraro(err)

            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: x0',
                code: 'x0',
                package: 'foo',
                msg: 'foo: x0',
                details: {'orig$': err, 'message$': 'x0'}
            }) //  "[Error: x0]"
            done()
        })

        it('non defined prefix', function (done) {
            var err = new Error('x1')
            var erraror = eraro(err, 'c4')

            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: x1',
                code: 'c4',
                package: 'foo',
                msg: 'foo: x1',
                details: {'orig$': err, 'message$': 'x1'}
            }) // "[Error: x1]"
            expect(erraror.orig).to.deep.equal(err)
            done()
        })

        it('defined prefix', function (done) {
            var err = new Error('x11')
            var erraror = eraro(err, 'c401')

            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: C401 Message',
                code: 'c401',
                package: 'foo',
                msg: 'foo: C401 Message',
                details: {'orig$': err, 'message$': 'x11'}
            })
            expect(erraror.orig).to.equal(err)

            done()
        })

        it('defined prefix', function (done) {
            var err = new Error('x2')
            var erraror = eraro(err, 'c5', {a: 3})

            expect(describeError(erraror)).to.deep.equal({
                message: 'foo: x2',
                code: 'c5',
                package: 'foo',
                msg: 'foo: x2',
                details: {a: 3, 'orig$': err, 'message$': 'x2'}
            }) // [Error: x2]

            done()
        })
    })

    it('handle templates', function (done) {

        expect(eraro('b0', '<%=foo(1)%>').message).to
            .contain("foo: <%=foo(1)%> VALUES:{ code: \'b0\' } TEMPLATE ERROR: TypeError:")
            .and.contain("is not a function")

        var templatedError = eraro('i0', '<%=a%>', {a: {b: 99}})
        expect(templatedError.message).to.equal('foo: { b: 99 }')

        done()
    })


    it('handle different erraros', function (done) {
        var fooEraro = Eraro({package: 'barfoo', prefix: 'FOO-'})
        expect(fooEraro('code0').message).to.equal('FOO-code0')

        var barEraro = Eraro({package: 'bar', prefix: false})
        expect(barEraro('code1').message).to.equal('code1')

        done()
    })
})
