import { useEffect, DependencyList } from 'react'

/**
 * useInterval hook, callback will be invoked repeatedly after started and
 * once upon time when stopped
 * @param callback a function to invoke repeatedly
 * @param interval the time interval, when null, that will stop the interval
 * @param deps dependency list
 * @deprecated DO NOT USE THIS HOOK, use `useRaf` instead for smooth animation
 * or other conditional hook
 */
export const useInterval = <T extends () => any>(
  callback: T,
  interval: number | null,
  deps: DependencyList = [],
) => {
  // set up the interval
  useEffect(() => {
    const id = interval === null ? 0 : setInterval(callback, interval)
    if (id) {
      return () => {
        clearInterval(id)
        callback()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps])
}
