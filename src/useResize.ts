import { RefObject, useEffect } from 'react'
import { ResizeEvent } from './ResizeObserverContext'
import { useResizeObserver } from './useResizeObserver'
import { getElement, InferTargetRef, TargetRef } from './utils'
import { useRefObject } from './useRefObject'

export type ResizeCallback<T extends Element = Element> = (this: T, event: ResizeEvent) => void
export type WindowResizeCallback = (this: Window, event: UIEvent) => void

export interface UseResize {
  <T extends TargetRef<Element>>(
    refOrElement: T,
    callback: ResizeCallback<InferTargetRef<T>>,
    options?: boolean | AddEventListenerOptions,
  ): void
  (
    WindowRef: Window | RefObject<Window> | null,
    callback: WindowResizeCallback,
    options?: boolean | AddEventListenerOptions,
  ): void
}

export const useResize: UseResize = function useResize<T extends Element>(
  refOrElement: RefObject<T> | T | Window | null,
  callback: ResizeCallback | WindowResizeCallback,
  options: boolean | AddEventListenerOptions = false,
) {
  const observer = useResizeObserver()
  const callbackRef = useRefObject(callback)

  useEffect(() => {
    const target = getElement(refOrElement)
    if (target) {
      const listener = (evt: Event) => {
        // @ts-ignore
        return callbackRef.current.call(target, evt)
      }
      const opt = options
      target.addEventListener('resize', listener as EventListener, opt)
      if (target instanceof Element) {
        observer.observe(target)
      }
      return () => {
        if (target instanceof Element) {
          observer.unobserve(target)
        }
        target.removeEventListener('resize', listener as EventListener, opt)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refOrElement, observer])
}
