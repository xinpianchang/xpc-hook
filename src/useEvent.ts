import { useEffect, DependencyList, RefObject } from 'react'
import { EventListenerMap, SupportEventTarget, EventNameMap, createEvent } from './createEvent'

/**
 * eventtarget listener hook
 * @param domElementOrRef DOM element or its reference
 * @param eventName event name(s)
 * @param eventListener event listener
 * @param options event register options
 * @param deps dependency for the event listener
 */
export function useEvent<T extends SupportEventTarget, N extends EventNameMap<T>>(
  domElementOrRef: T | RefObject<T> | null,
  eventName: N | N[],
  eventListener: EventListenerMap<T, N>,
  options: boolean | AddEventListenerOptions = false,
  deps: DependencyList = [],
) {
  const eventNames = Array.isArray(eventName) ? eventName : [ eventName ]
  useEffect(
    () => createEvent<T, N>(domElementOrRef, eventNames, eventListener, options),
    [...eventNames, domElementOrRef, ...deps],
  )
}
