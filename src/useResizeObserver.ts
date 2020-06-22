import { useContext } from 'react'
import { ResizeObserverContext } from './ResizeObserverContext'

export default function useResizeObserver() {
  return useContext(ResizeObserverContext)
}
