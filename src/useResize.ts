import { RefObject, useEffect, DependencyList } from 'react'
import { ResizeEvent } from './ResizeObserverContext'
import useResizeObserver from './useResizeObserver'
import { getElement } from './utils'

export type ResizeCallback = (event: ResizeEvent) => void

export default function useResize<T extends Element>(
  refOrElement: RefObject<T> | T,
  callback: ResizeCallback,
  deps: DependencyList = [],
) {
  const observer = useResizeObserver()
  useEffect(() => {
    if (!refOrElement) return
    const target = getElement(refOrElement)
    if (target) {
      target.addEventListener('resize', callback as EventListener, false)
      observer.observe(target)
      return () => {
        observer.unobserve(target)
        target.removeEventListener('resize', callback as EventListener, false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refOrElement, observer, ...deps])
}
