import useEvent from './useEvent'
import { RefObject, DependencyList, useRef } from 'react'
import { getElement, getDocument } from './utils'

type EventNameMap = keyof DocumentEventMap

type EventListenerMap<T extends HTMLElement, K extends EventNameMap>
  = (this: T, event: DocumentEventMap[K]) => any

export default function useClickAway<T extends HTMLElement, N extends EventNameMap>(
  domElementOrRef: T | RefObject<T> | null,
  eventName: N | N[],
  eventListener: EventListenerMap<T, N>,
  deps?: DependencyList,
): void
export default function useClickAway<T extends HTMLElement>(
  domElementOrRef: T | RefObject<T> | null,
  eventListener: EventListenerMap<T, 'click' | 'touchstart'>,
  deps?: DependencyList,
): void
export default function useClickAway<T extends HTMLElement, N extends EventNameMap>(
  domElementOrRef: T | RefObject<T> | null,
  eventNameOrListener: N | N[] | EventListenerMap<T, 'click' | 'touchstart'>,
  eventListenerOrDeps?: EventListenerMap<T, N> | DependencyList,
  deps: DependencyList = [],
) {
  const eventListenerRef = useRef<EventListenerMap<T, N>>(undefined!)
  let eventName: N | N[]
  if (eventNameOrListener instanceof Function) {
    eventName = ['mousedown', 'touchstart'] as N[]
    eventListenerRef.current = eventNameOrListener as EventListenerMap<T, N>
    deps = (eventListenerOrDeps as DependencyList | undefined) || []
  } else {
    eventName = eventNameOrListener
    eventListenerRef.current = eventListenerOrDeps as EventListenerMap<T, N>
  }

  useEvent(domElementOrRef ? getDocument() : null, eventName, evt => {
    const element = getElement(domElementOrRef)
    if (element && evt.target && !element.contains(evt.target as Node)) {
      return eventListenerRef.current.call(element, evt)
    }
  }, false, deps)
}
