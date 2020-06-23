import { useRef } from 'react'

export function useRefObject<T>(t: T) {
  const ref = useRef<T>(t)
  ref.current = t
  return ref
}
