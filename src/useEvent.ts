import { useEffect, DependencyList, RefObject } from 'react'
import { EventListenerMap, SupportEventTarget, EventNameMap, createEvent } from './createEvent'

/**
 * eventtarget listener hook
 * @param target DOM element or its reference
 * @param type event name(s)
 * @param listener event listener
 * @param options event register options
 * @param deps dependency for the event listener
 *
 * users can augment this interface to accept other eventmap, like below
 * ```jsx
 *   interface UseEvent extends UseEventHelper<NewTarget, NewEventMap> {
 *   }
 * ```
 * this will bind useEvent a `NewEventMap` to `NewTarget`
 */
export interface UseEvent {
  <T extends SupportEventTarget, N extends EventNameMap<T> & string>(
    target: T | RefObject<T> | null,
    type: N | readonly N[],
    listener: EventListenerMap<T, N>,
    options?: boolean | AddEventListenerOptions,
    deps?: DependencyList,
  ): void
}

export const useEvent: UseEvent = function useEvent(
  domElementOrRef,
  eventName,
  eventListener,
  options = false,
  deps = [],
) {
  const eventNames = Array.isArray(eventName) ? eventName : [ eventName ]
  useEffect(
    // @ts-ignore
    () => createEvent(domElementOrRef, eventNames, eventListener, options),
    [domElementOrRef, ...eventNames, ...deps],
  )
}

export type UseEventHelper<
  Targets extends EventTarget,
  EventMap extends Record<string, Event>,
> = <T extends Targets, N extends keyof EventMap>(
  target: T | RefObject<T> | null,
  type: N | N[],
  listener: (this: T, event: EventMap[N]) => any,
  options?: boolean | AddEventListenerOptions,
  deps?: DependencyList,
) => void
