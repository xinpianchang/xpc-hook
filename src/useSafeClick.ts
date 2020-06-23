import { RefObject, DependencyList, useRef, useState } from 'react'
import { useEvent } from './useEvent'

/**
 * listen to the click event only when click mousedown and mouseup
 * locations are close to each other, so we can treat it not as a
 * drag event, but only click
 * @param domElementOrRef
 * @param eventListener 
 * @param deps 
 */
export function useSafeClick<T extends HTMLElement | Document | Window>(
  domElementOrRef: T | RefObject<T> | null,
  eventListener: (this: T, evt: MouseEvent) => void,
  deps: DependencyList = [],
) {
  const callbackRef = useRef<(this: T, evt: MouseEvent) => void>(undefined!)
  callbackRef.current = eventListener

  const [ mouseDownPoint ] = useState({ x: 0, y: 0 })
  useEvent(domElementOrRef, ['mousedown', 'click'], evt => {
    if (evt.type === 'mousedown') {
      mouseDownPoint.x = evt.clientX
      mouseDownPoint.y = evt.clientY
    } else {
      const dx = evt.clientX - mouseDownPoint.x
      const dy = evt.clientY - mouseDownPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 4) {
        callbackRef.current.call(evt.currentTarget as T, evt)
      }
    }
  }, false, deps)
}
