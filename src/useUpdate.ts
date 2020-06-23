import { useState, useCallback } from 'react'

const incr = (cnt: number) => cnt + 1

export function useUpdate() {
  const [ , update ] = useState(0)
  const cb = useCallback(() => update(incr), [])
  return cb
}
