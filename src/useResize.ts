import { RefObject, useEffect } from 'react'
import { ResizeEvent } from './ResizeObserverContext'
import { useResizeObserver } from './useResizeObserver'
import { getElement } from './utils'
import { useRefObject } from './useRefObject'

export type ResizeCallback<T extends Element = Element> = (this: T, event: ResizeEvent) => void
export type WindowResizeCallback = (this: Window, event: UIEvent) => void

export interface UseResize {
  <T extends Element>(
    refOrElement: RefObject<T> | T | null,
    callback: ResizeCallback<T>,
  ): void
  (
    WindowRef: Window | null,
    callback: WindowResizeCallback,
  ): void
}

export const useResize: UseResize = function useResize<T extends Element>(
  refOrElement: RefObject<T> | T | Window | null,
  callback: ResizeCallback | WindowResizeCallback,
) {
  const observer = useResizeObserver()
  const callbackRef = useRefObject(callback)

  useEffect(() => {
    const target = getElement(refOrElement)
    if (target) {
      const listener = (evt: Event) => {
        // @ts-ignore
        callbackRef.current.call(target, evt)
      }
      target.addEventListener('resize', listener as EventListener, false)
      if (target instanceof Element) {
        observer.observe(target)
      }
      return () => {
        if (target instanceof Element) {
          observer.unobserve(target)
        }
        target.removeEventListener('resize', listener as EventListener, false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refOrElement, observer])
}
