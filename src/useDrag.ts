import { RefObject, useRef, useEffect, useState, useCallback } from 'react'
import { useRefObject } from './useRefObject'
import { useEvent } from './useEvent'
import { getElement } from './utils'

type Unsubscribe = (canceled?: false) => void
type UnsubscribeFn = (canceled: boolean) => void

export type DragCallback<T extends HTMLElement> = (this: T, event: MouseEvent) => void | boolean
export type DragEndCallback<T extends HTMLElement> = (this: T, canceled: boolean) => void

type CallbackRef = (evt: MouseEvent) => void | boolean
const noop = () => {}

export function useDrag<T extends HTMLElement>(
  ref: T | RefObject<T> | null,
  dragCallback: DragCallback<T>,
  dragEndCallback: DragEndCallback<T> = noop,
): [ boolean, Unsubscribe ] {
  // dragging state with unsubscribe callback definition
  const unsubscribeRef = useRef<UnsubscribeFn | null>(null)
  const dragCallbackRef = useRef<CallbackRef | null>(null)
  const dragEndCallbackRef = useRef<UnsubscribeFn | null>(null)
  const [ dragging, _setDragging ] = useState(false)
  const draggingRef = useRefObject(dragging)
  const unsubscribe: Unsubscribe = useCallback(canceled => {
    unsubscribeRef.current && unsubscribeRef.current(canceled ?? true)
    _setDragging(false)
  }, [])

  useEffect(() => {
    const el = getElement(ref) as T
    if (el) {
      dragCallbackRef.current = dragCallback.bind(el)
      dragEndCallbackRef.current = dragEndCallback.bind(el)
    } else {
      dragCallbackRef.current = null
      dragEndCallbackRef.current = null
    }
  })

  useEvent(ref, 'mousedown', (event: MouseEvent) => {
    // only primary button should be used
    if (event.button !== 0 || event.defaultPrevented) return

    // reset dragging state
    unsubscribe()

    const onMouseUp = (evt: MouseEvent) => {
      if (evt.button !== 0) return
      if (draggingRef.current) {
        dragCallbackRef.current && dragCallbackRef.current(evt)
        draggingRef.current = false
        unsubscribe(false)
      } else {
        unsubscribe()
      }
    }

    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.code !== 'Escape') return
      evt.preventDefault()
      unsubscribe()
    }

    const onWindowBlur = () => unsubscribe()

    const onMouseMove = (evt: MouseEvent) => {
      if (evt.defaultPrevented) {
        return unsubscribe()
      }

      // get false returned value from callback will lead drag event delayed
      const callback = dragCallbackRef.current || noop
      if (callback(evt) !== false) {
        if (!draggingRef.current) {
          // replace mouseup callback when dragging
          _setDragging(true)
        }
      } else if (draggingRef.current) {
        // draggingRef.current = false
        unsubscribe()
      }
    }

    const callback = dragCallbackRef.current || noop
    if (callback(event) !== false) {
      window.addEventListener('mousemove', onMouseMove, true)
      window.addEventListener('mouseup', onMouseUp, true)
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('blur', onWindowBlur)
      // register unsubscribe method
      unsubscribeRef.current = (canceled: boolean) => {
        window.removeEventListener('mousemove', onMouseMove, true)
        window.removeEventListener('mouseup', onMouseUp, true)
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('blur', onWindowBlur)
        unsubscribeRef.current = null
        const dragEnd = dragEndCallbackRef.current
        dragEnd && dragEnd(canceled)
      }
    }
  })

  // on unmount, just unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => unsubscribe, [])

  return [ dragging, unsubscribe ]
}
