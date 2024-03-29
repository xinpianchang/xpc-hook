import { useRef, useEffect, useState, useCallback } from 'react'
import { useRefObject } from './useRefObject'
import { useEvent } from './useEvent'
import { getElement, InferTargetRef, TargetRef } from './utils'

export type UnsubscribeWithReason = (canceled?: boolean) => void
type UnsubscribeFn = (canceled: boolean) => void

export type DragCallback<T extends HTMLElement> = (this: T, event: MouseEvent) => void | boolean
export type DragEndCallback<T extends HTMLElement> = (this: T, canceled: boolean) => void

type CallbackRef = (evt: MouseEvent) => void | boolean
const noop = () => {}

export function useDrag<T extends TargetRef<HTMLElement>>(
  ref: T,
  dragCallback: DragCallback<InferTargetRef<T>>,
  dragEndCallback: DragEndCallback<InferTargetRef<T>> = noop,
): [ boolean, UnsubscribeWithReason ] {
  // dragging state with unsubscribe callback definition
  const unsubscribeRef = useRef<UnsubscribeFn | null>(null)
  const dragCallbackRef = useRef<CallbackRef | null>(null)
  const dragEndCallbackRef = useRef<UnsubscribeFn | null>(null)
  const [ dragging, _setDragging ] = useState(false)
  const draggingRef = useRefObject(dragging)
  const unsubscribe: UnsubscribeWithReason = useCallback((canceled = true) => {
    unsubscribeRef.current && unsubscribeRef.current(canceled)
    _setDragging(false)
  }, [])

  // when unmount, unsubscribe
  useEffect(() => unsubscribe, [])

  // every time we bind new callback to the callback reference
  useEffect(() => {
    const el = getElement(ref)
    if (el) {
      dragCallbackRef.current = dragCallback.bind(el)
      dragEndCallbackRef.current = dragEndCallback.bind(el)
      return () => {
        dragCallbackRef.current = null
        dragEndCallbackRef.current = null
      }
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

  return [ dragging, unsubscribe ]
}
