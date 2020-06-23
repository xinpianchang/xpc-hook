import { useContext } from 'react'
import { ResizeObserverContext } from './ResizeObserverContext'

export function useResizeObserver() {
  return useContext(ResizeObserverContext)
}
