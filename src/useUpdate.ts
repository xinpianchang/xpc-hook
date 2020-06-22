import { useState, useCallback } from 'react'

const incr = (cnt: number) => cnt + 1

export default function useUpdate() {
  const [ , update ] = useState(0)
  const cb = useCallback(() => update(incr), [])
  return cb
}
