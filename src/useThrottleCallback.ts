import { DependencyList, useRef, useEffect } from 'react'

// private symbol
const NO_RESULT = Symbol('no result')
type SYM = typeof NO_RESULT

interface InvokeDescriptor<A extends any[], R, T = any> {
  func: (this: T, ...args: A) => R
  caller: T
  args: A
}

/**
 * return a wrapped callback function with the same signature as the `func`\
 * which will be invoked with a throttled interval
 * @param func the callback to throttle
 * @param ms throttling delay
 * @param deps dependency list
 */
export default function useThrottleCallback<A extends any[], R, F extends (...args: A) => R>(
  func: F,
  ms: number,
  deps: DependencyList = [],
) {
  const invokeRef = useRef<InvokeDescriptor<A, R> | null>(null)
  const resultRef = useRef<R | SYM>(NO_RESULT)
  const timeoutRef = useRef(0)

  // only `ms` will change the callback manipulation
  // so there is no need to memoize this callback below
  const resetResult = () => {
    // clear the last result of callback
    resultRef.current = NO_RESULT
    if (invokeRef.current !== null) {
      // invoke the delayed descriptor that can manipulate the invoking state
      // where there is one stored in the invoke reference
      const { func, caller, args } = invokeRef.current
      invokeRef.current = null
      // invoke now
      resultRef.current = func.apply(caller, args)
      timeoutRef.current = window.setTimeout(resetResult, ms)
    }
  }

  useEffect(() => {
    resetResult()
    return () => {
      clearTimeout(timeoutRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ ms, ...deps ])

  return function callback(this: any, ...args: A) {
    const caller = this
    switch (resultRef.current) {
      case NO_RESULT:
        resultRef.current = func.apply(caller, args)
        timeoutRef.current = window.setTimeout(resetResult, ms)
        break
      default:
        invokeRef.current = {
          func,
          caller,
          args,
        }
    }
    return resultRef.current
  } as F
}
