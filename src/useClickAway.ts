import { useEvent } from './useEvent'
import { useRef } from 'react'
import { getElement, TargetRef, InferTargetRef } from './utils'
import { getDocumentRef } from './getDocumentRef'

type EventNameMap = 'click' | 'touchstart' | 'mousedown' | 'mouseup' | 'touchend' | 'touchcancel' | 'touchmove' | 'mousemove'
type EventListenerMap<T extends TargetRef, N extends EventNameMap> = (this: InferTargetRef<T>, event: DocumentEventMap[N]) => any

export function useClickAway<T extends TargetRef<HTMLElement>, N extends EventNameMap>(
  domElementOrRef: T,
  eventName: N | N[],
  eventListener: EventListenerMap<T, N>,
): void
export function useClickAway<T extends TargetRef<HTMLElement>>(
  domElementOrRef: T,
  eventListener: EventListenerMap<T, 'mousedown' | 'touchstart'>,
): void
export function useClickAway<T extends TargetRef<HTMLElement>, N extends EventNameMap>(
  domElementOrRef: T,
  eventNameOrListener: N | N[] | EventListenerMap<T, N>,
  eventListener: EventListenerMap<T, N> = () => {},
) {
  const eventListenerRef = useRef<EventListenerMap<T, N>>(undefined!)
  let eventName: N | N[]
  let needPreventDefaultOnTouchEnd = false
  if (eventNameOrListener instanceof Function) {
    eventName = ['mousedown', 'touchstart'] as N[]
    eventListenerRef.current = eventNameOrListener
    needPreventDefaultOnTouchEnd = true
  } else {
    eventName = eventNameOrListener
    eventListenerRef.current = eventListener
  }

  useEvent(domElementOrRef ? getDocumentRef() : null, eventName, evt => {
    const element = getElement(domElementOrRef)
    if (element && evt.target && !element.contains(evt.target as Node)) {
      if (needPreventDefaultOnTouchEnd && evt.type === 'touchstart') {
        // default touch event should be prevented on touchend, in case to avoid mousedown to be trigger the second times
        const touchEndCallback = (evt: TouchEvent) => {
          evt.preventDefault()
          document.removeEventListener('touchcancel', touchCancelCallback)
        }
        const touchCancelCallback = () => {
          document.removeEventListener('touchend', touchEndCallback)
        }
        document.addEventListener('touchend', touchEndCallback, { once: true })
        document.addEventListener('touchcancel', touchCancelCallback, { once: true})
      }

      return eventListenerRef.current.call(element, evt)
    }
  })
}
