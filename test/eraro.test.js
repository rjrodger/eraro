/* Copyright (c) 2014-2020 Richard Rodger and other contributors, MIT License */
'use strict'

var Lab = require('@hapi/lab')
var Code = require('@hapi/code')

var lab = (exports.lab = Lab.script())
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

describe('eraro', function() {
  it('basic error', () => {
    var e1 = eraro('c1', 'm1 a:<%=a%>', { a: 1 })

    expect(e1.message).to.equal('foo: m1 a:1')
    expect(e1.package).to.equal('foo')
    expect(e1.foo).to.be.true()
    expect(e1.code).to.equal('c1')
    expect(e1.details.a).to.equal(1)
  })

  it('has', () => {
    expect(eraro.has('c401')).true()
    expect(eraro.has('not-a-code')).false()
  })

  describe('several error definitions', () => {
    it('with prefix and context', () => {
      var erraror = eraro('c2', { a: 2 })
      expect(describeError(erraror)).to.equal({
        message: 'foo: c2',
        code: 'c2',
        package: 'foo',
        msg: 'foo: c2',
        details: { a: 2 }
      })
    })

    it('with prefix', () => {
      var erraror = eraro('c3')
      expect(describeError(erraror)).to.equal({
        message: 'foo: c3',
        code: 'c3',
        package: 'foo',
        msg: 'foo: c3',
        details: {}
      })
    })

    it('with no arg', () => {
      var erraror = eraro()
      expect(describeError(erraror)).to.equal({
        message: 'foo: unknown',
        code: 'unknown',
        package: 'foo',
        msg: 'foo: unknown',
        details: {}
      })
    })

    it('with an other erraro', () => {
      var erraror = eraro(eraro('c41'))
      expect(describeError(erraror)).to.equal({
        message: 'foo: c41',
        code: 'c41',
        package: 'foo',
        msg: 'foo: c41',
        details: {}
      })
    })
  })

  describe('wrap an error in details', function() {
    it('simple error', () => {
      var err = new Error('x0')
      var erraror = eraro(err)
      var errdesc = describeError(erraror)

      expect(errdesc.details.errline).include('eraro.test.js')
      delete errdesc.details.errline

      expect(errdesc).to.equal({
        message: 'foo: x0',
        code: 'x0',
        package: 'foo',
        msg: 'foo: x0',
        details: { errmsg: 'x0', orig$: err, message$: 'x0' }
      }) //  "[Error: x0]"
    })

    it('non defined prefix', () => {
      var err = new Error('x1')
      var erraror = eraro(err, 'c4')
      var errdesc = describeError(erraror)

      expect(errdesc.details.errline).include('eraro.test.js')
      delete errdesc.details.errline

      expect(errdesc).to.equal({
        message: 'foo: x1',
        code: 'c4',
        package: 'foo',
        msg: 'foo: x1',
        details: { errmsg: 'x1', orig$: err, message$: 'x1' }
      }) // "[Error: x1]"
      expect(erraror.orig).to.equal(err)
    })

    it('defined prefix', () => {
      var err = new Error('x11')
      var erraror = eraro(err, 'c401')
      var errdesc = describeError(erraror)

      expect(errdesc.details.errline).exists()
      delete errdesc.details.errline

      expect(errdesc).to.equal({
        message: 'foo: C401 Message',
        code: 'c401',
        package: 'foo',
        msg: 'foo: C401 Message',
        details: { errmsg: 'x11', orig$: err, message$: 'x11' }
      })
      expect(erraror.orig).to.equal(err)
    })

    it('defined prefix', () => {
      var err = new Error('x2')
      var erraror = eraro(err, 'c5', { a: 3 })
      var errdesc = describeError(erraror)

      expect(errdesc.details.errline).exists()
      delete errdesc.details.errline

      expect(errdesc).to.equal({
        message: 'foo: x2',
        code: 'c5',
        package: 'foo',
        msg: 'foo: x2',
        details: { errmsg: 'x2', a: 3, orig$: err, message$: 'x2' }
      }) // [Error: x2]
    })
  })

  
  it('handle templates', () => {
    let te0 = eraro('te0', 'A <%=a%> <%=c%><%= d %> B',
                    { a: { b: 99,e:[true,false] }, c:'CCC', d:1 })
    expect(te0.message).to.equal('foo: A {b:99,e:[true,false]} CCC1 B')

    let te1 = eraro('te1', '<%=code%><%=NotAVal%>')
    expect(te1.message).to.equal('foo: te1undefined')
  })

  
  it('handle different erraros', () => {
    var fooEraro = Eraro({ package: 'barfoo', prefix: 'FOO-' })
    expect(fooEraro('code0').message).to.equal('FOO-code0')

    var barEraro = Eraro({ package: 'bar', prefix: false })
    expect(barEraro('code1').message).to.equal('code1')
  })
})
