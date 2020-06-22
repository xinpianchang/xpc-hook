import { DependencyList } from 'react'
import useThrottleCallback from './useThrottleCallback'

/**
 * throttle a callback invoking
 * @param callback the callback to invoke, should be without parameters
 * @param ms throttling delay
 * @param deps dependency list
 */
export default function useThrottle<R>(
  callback: () => R,
  ms: number,
  deps?: DependencyList,
) {
  return useThrottleCallback(callback, ms, deps)()
}
