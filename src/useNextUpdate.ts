import { useCallback, useEffect, useRef } from 'react'
import { useUpdate } from './useUpdate'

export function useNextUpdate() {
  const ref = useRef(0)
  const forceUpdate = useUpdate()
  useEffect(
    () => () => {
      ref.current && clearTimeout(ref.current)
    },
    [],
  )
  return useCallback(() => {
    if (!ref.current) {
      ref.current = setTimeout(() => {
        ref.current = 0
        forceUpdate()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
