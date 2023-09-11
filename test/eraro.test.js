/* Copyright (c) 2014-2023 Richard Rodger and other contributors, MIT License */
'use strict'

const Eraro = require('..')
const eraro = Eraro({
  package: 'foo',
  msgmap: {
    c401: 'C401 Message',
  },
})

function describeError(err) {
  return {
    message: err.message,
    code: err.code,
    package: err.package,
    msg: err.msg,
    details: err.details,
  }
}

describe('eraro', function () {
  test('basic error', () => {
    const e1 = eraro('c1', 'm1 a:<%=a%>', { a: 1 })

    expect(e1.message).toEqual('foo: m1 a:1')
    expect(e1.package).toEqual('foo')
    expect(e1.foo).toEqual(true)
    expect(e1.code).toEqual('c1')
    expect(e1.details.a).toEqual(1)
  })

  test('has', () => {
    expect(eraro.has('c401')).toEqual(true)
    expect(eraro.has('not-a-code')).toEqual(false)
  })

  describe('several error definitions', () => {
    test('with prefix and context', () => {
      const erraror = eraro('c2', { a: 2 })
      expect(describeError(erraror)).toEqual({
        message: 'foo: c2',
        code: 'c2',
        package: 'foo',
        msg: 'foo: c2',
        details: { a: 2 },
      })
    })

    test('with prefix', () => {
      const erraror = eraro('c3')
      expect(describeError(erraror)).toEqual({
        message: 'foo: c3',
        code: 'c3',
        package: 'foo',
        msg: 'foo: c3',
        details: {},
      })
    })

    test('with no arg', () => {
      const erraror = eraro()
      expect(describeError(erraror)).toEqual({
        message: 'foo: unknown',
        code: 'unknown',
        package: 'foo',
        msg: 'foo: unknown',
        details: {},
      })
    })

    test('with an other erraro', () => {
      const erraror = eraro(eraro('c41'))
      expect(describeError(erraror)).toEqual({
        message: 'foo: c41',
        code: 'c41',
        package: 'foo',
        msg: 'foo: c41',
        details: {},
      })
    })
  })

  describe('wrap an error in details', function () {
    test('simple error', () => {
      const err = new Error('x0')
      const erraror = eraro(err)
      const errdesc = describeError(erraror)

      expect(errdesc.details.errline).toContain('eraro.test.js')
      delete errdesc.details.errline

      expect(errdesc).toEqual({
        message: 'foo: x0',
        code: 'x0',
        package: 'foo',
        msg: 'foo: x0',
        details: { errmsg: 'x0', orig$: err, message$: 'x0' },
      }) //  "[Error: x0]"
    })

    test('non defined prefix', () => {
      const err = new Error('x1')
      const erraror = eraro(err, 'c4')
      const errdesc = describeError(erraror)

      expect(errdesc.details.errline).toContain('eraro.test.js')
      delete errdesc.details.errline

      expect(errdesc).toEqual({
        message: 'foo: x1',
        code: 'c4',
        package: 'foo',
        msg: 'foo: x1',
        details: { errmsg: 'x1', orig$: err, message$: 'x1' },
      }) // "[Error: x1]"
      expect(erraror.orig).toEqual(err)
    })

    test('defined prefix', () => {
      const err = new Error('x11')
      const erraror = eraro(err, 'c401')
      const errdesc = describeError(erraror)

      expect(errdesc.details.errline).toBeDefined()
      delete errdesc.details.errline

      expect(errdesc).toEqual({
        message: 'foo: C401 Message',
        code: 'c401',
        package: 'foo',
        msg: 'foo: C401 Message',
        details: { errmsg: 'x11', orig$: err, message$: 'x11' },
      })
      expect(erraror.orig).toEqual(err)
    })

    test('defined prefix', () => {
      const err = new Error('x2')
      const erraror = eraro(err, 'c5', { a: 3 })
      const errdesc = describeError(erraror)

      expect(errdesc.details.errline).toBeDefined()
      delete errdesc.details.errline

      expect(errdesc).toEqual({
        message: 'foo: x2',
        code: 'c5',
        package: 'foo',
        msg: 'foo: x2',
        details: { errmsg: 'x2', a: 3, orig$: err, message$: 'x2' },
      }) // [Error: x2]
    })
  })

  test('handle templates', () => {
    let te0 = eraro('te0', 'A <%=a%> <%=c%><%= d %> B', {
      a: { b: 99, e: [true, false] },
      c: 'CCC',
      d: 1,
    })
    expect(te0.message).toEqual('foo: A {b:99,e:[true,false]} CCC1 B')

    let te1 = eraro('te1', '<%=code%><%=NotAVal%>')
    expect(te1.message).toEqual('foo: te1undefined')
  })

  test('handle different erraros', () => {
    const fooEraro = Eraro({ package: 'barfoo', prefix: 'FOO-' })
    expect(fooEraro('code0').message).toEqual('FOO-code0')

    const barEraro = Eraro({ package: 'bar', prefix: false })
    expect(barEraro('code1').message).toEqual('code1')
  })
})
