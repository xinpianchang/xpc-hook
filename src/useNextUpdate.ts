import { useCallback, useEffect, useRef } from 'react'
import nextTick from 'next-tick'
import { useUpdate } from './useUpdate'

/**
 * useNextUpdate calls `next-tick` utility to execute the update hook
 */
export function useNextUpdate() {
  const ref = useRef(false)
  const forceUpdate = useUpdate()
  useEffect(
    () => () => {
      ref.current = false
    },
    [],
  )
  return useCallback(() => {
    if (!ref.current) {
      ref.current = true
      nextTick(() => {
        if (ref.current) {
          ref.current = false
          forceUpdate()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
