/* Copyright (c) 2014-2023 Richard Rodger, MIT License */

// Create JavaScript Error objects with code strings, context details,
// and templated messages.

import Util = require('util')

// Use Error.isError (Node 24+) when available, fall back to Util.types.isNativeError
const isNativeError: (value: unknown) => value is Error =
  typeof (Error as any).isError === 'function'
    ? (Error as any).isError
    : Util.types.isNativeError

interface EraroOptions {
  package?: string
  prefix?: boolean | string
  module?: NodeModule
  msgmap?: Record<string, string>
  inspect?: boolean
  override?: boolean
}

interface EraroError extends Error {
  eraro: boolean
  orig: Error | null
  code: string
  package: string
  msg: string
  details: Record<string, any>
  callpoint: string
  [key: string]: any
}

interface ErrorMaker {
  (
    ex: Error,
    code?: string,
    msg?: string,
    details?: Record<string, any>,
  ): EraroError
  (
    code?: string,
    msg?: string | Record<string, any>,
    details?: Record<string, any>,
  ): EraroError
  callpoint: (error?: Error | null, markers?: string[]) => string
  has: (code: string) => boolean
}

function eraro(options?: EraroOptions): ErrorMaker {
  options = options || {}

  const msgprefix =
    false === options.prefix
      ? ''
      : 'string' === typeof options.prefix
        ? options.prefix
        : 'string' === typeof options.package
          ? options.package + ': '
          : ''

  const pkg = options.package || 'unknown'
  const callmodule = options.module || module
  const msgmap = options.msgmap || {}
  const inspect = null == options.inspect ? true : !!options.inspect

  const markers: string[] = [module.filename]

  const filename = callmodule.filename
  if (filename) {
    markers.push(filename)
  }

  const errormaker: any = function (
    first?: any,
    second?: any,
    third?: any,
    fourth?: any,
  ): EraroError {
    let ex: Error | null
    let code: string | undefined
    let msg: string | Record<string, any> | undefined
    let details: Record<string, any> | undefined

    if (isNativeError(first)) {
      ex = first
      if ((ex as any).eraro && !options!.override) {
        return ex as EraroError
      }
      code = second
      msg = third
      details = fourth
    } else {
      ex = null
      code = first
      msg = second
      details = third
    }

    code =
      'string' === typeof code
        ? code
        : ex
          ? (ex as any).code
            ? (ex as any).code
            : ex.message
              ? ex.message
              : 'unknown'
          : 'unknown'

    details =
      'object' === typeof details
        ? details
        : 'object' === typeof msg
          ? (msg as Record<string, any>)
          : {}

    if (ex) {
      details.errmsg = ex.message
      details.errline = callpoint(ex, markers)
    }

    const msgStr: string | null = 'string' === typeof msg ? msg : null
    const builtMsg = buildmessage(
      options!,
      msgStr,
      msgmap,
      msgprefix,
      inspect,
      code!,
      details,
      ex,
    )

    const err: EraroError = new Error(builtMsg) as any

    if (ex) {
      details.orig$ = null == details.orig$ ? ex : details.orig$
      details.message$ =
        null == details.message$ ? ex.message : details.message$

      // drag along properties from original exception
      for (const p in ex) {
        ;(err as any)[p] = (ex as any)[p]
      }
    }

    err.eraro = true

    err.orig = ex // orig
    err.code = code!
    ;(err as any)[pkg] = true
    err.package = pkg
    err.msg = builtMsg
    err.details = details

    err.stack = ex ? ex.stack : err.stack
    err.callpoint = details.errline || callpoint(err, markers)

    return err
  }

  errormaker.callpoint = callpoint

  errormaker.has = function (code: string): boolean {
    return !!msgmap[code]
  }

  return errormaker as ErrorMaker
}

function callpoint(error?: Error | null, markers?: string[]): string {
  markers = Array.isArray(markers) ? markers : []

  const stack = error ? error.stack : null
  let out = ''

  if (stack) {
    const lines = stack.split('\n')
    let i = 0

    line_loop: for (i = 1; i < lines.length; i++) {
      const line = lines[i]

      let found = false
      for (let j = 0; j < markers.length; j++) {
        if ('string' === typeof markers[j]) {
          found = -1 != line.indexOf(markers[j])
          if (found) break
        }
      }

      if (!found) break line_loop
    }

    out = 'string' === typeof lines[i] ? lines[i].substring(4) : out
  }

  return out
}

function buildmessage(
  options: EraroOptions,
  msg: string | null,
  msgmap: Record<string, string>,
  msgprefix: string,
  _inspect: boolean,
  code: string,
  details: Record<string, any>,
  ex: Error | null,
): string {
  let message =
    msgprefix +
    ('string' === typeof msg
      ? msg
      : 'string' === typeof msgmap[code]
        ? msgmap[code]
        : ex
          ? originalmsg(options.override, ex)
          : code)

  // These are the inserts.
  const valmap: Record<string, any> = Object.assign({}, details, {
    code: code,
  })

  message = message.replace(/<%=\s*(.*?)\s*%>/g, (_m: string, p1: string) => {
    let val = valmap[p1]
    val = 'object' === typeof val && null != val ? stringify(val) : val
    return val
  })

  return message
}

function stringify(val: any): string {
  try {
    return JSON.stringify(val)
      .substring(0, 111)
      .replace(/([^\\])"/g, '$1')
  } catch (e) {
    return '' + val
  }
}

function originalmsg(
  override: boolean | undefined,
  ex: Error,
): string | undefined {
  if (!ex) return undefined

  if (override && (ex as any).eraro && (ex as any).orig)
    return (ex as any).orig.message

  return ex.message
}

export = eraro
