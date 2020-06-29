import { RefObject, DependencyList, useRef, useState, useEffect, useCallback } from 'react'
import { useEvent } from './useEvent'
import { useRefObject } from './useRefObject'
import { Unsubscribe } from './utils'

export const ArrowDirection = {
  e: 'e',
  w: 'w',
  n: 'n',
  s: 's',
  ne: 'ne',
  se: 'se',
  nw: 'nw',
  sw: 'sw',
  none: 'none',
} as const
export type ArrowDirection = typeof ArrowDirection
export type ActionCallback = (direction: keyof ArrowDirection) => void

export const ArrowKeyCode = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
} as const
export type ArrowKeyCode = typeof ArrowKeyCode
const KeyCodeArray = Object.keys(ArrowKeyCode)
const CounterArrowMap = {
  ArrowUp: 'ArrowDown',
  ArrowDown: 'ArrowUp',
  ArrowLeft: 'ArrowRight',
  ArrowRight: 'ArrowLeft',
} as const

const FirstDelay = 500

export const KeyState = {
  Conflict: 'Conflict',
  Pressed: 'Pressed',
  Released: 'Released',
} as const
export type KeyState = typeof KeyState

function getDirection(horizontal: 'w' | 'e' | 'none', vertical: 's' | 'n' | 'none') {
  let v = vertical === 'none' ? '' : vertical
  let h = horizontal === 'none' ? '' : horizontal
  const direction = (h + v) || 'none'
  return direction as keyof ArrowDirection
}

function getDirectionByKeyStateMap(keyStateMap: Readonly<Record<keyof ArrowKeyCode, keyof KeyState>>) {
  let horizontal: 'w' | 'e' | 'none' = 'none'
  if (keyStateMap.ArrowLeft !== KeyState.Released || keyStateMap.ArrowRight !== KeyState.Released) {
    horizontal = keyStateMap.ArrowLeft === KeyState.Pressed ? 'w' : 'e'
  }
  let vertical: 's' | 'n' | 'none' = 'none'
  if (keyStateMap.ArrowUp !== KeyState.Released || keyStateMap.ArrowDown !== KeyState.Released) {
    vertical = keyStateMap.ArrowUp === KeyState.Pressed ? 'n' : 's'
  }
  return getDirection(horizontal, vertical)
}

function isArrowKeyCode(code: string): code is keyof ArrowKeyCode {
  return KeyCodeArray.includes(code)
}

export function useArrowKey<T extends HTMLElement | Document | Window>(
  ref: T | RefObject<T> | null,
  callback: ActionCallback,
  deps?: DependencyList,
): [ boolean, Unsubscribe ]
export function useArrowKey<T extends HTMLElement | Document | Window>(
  ref: T | RefObject<T> | null,
  callback: ActionCallback,
  interval: number,
  deps?: DependencyList,
): [ boolean, Unsubscribe ]
export function useArrowKey<T extends HTMLElement | Document | Window>(
  ref: T | RefObject<T> | null,
  callback: ActionCallback,
  intervalOrDeps?: number | DependencyList,
  deps: DependencyList = [],
): [ boolean, Unsubscribe ] {

  let interval = 50
  if (typeof intervalOrDeps === 'number') {
    interval = intervalOrDeps
  } else if (intervalOrDeps) {
    deps = intervalOrDeps
  }

  const timerRef = useRef(0)
  const [moving, setMoving] = useState(false)
  const directionRef = useRef<keyof ArrowDirection>(ArrowDirection.none)
  const movingRef = useRef(moving)
  const callbackRef = useRefObject(callback)
  const intervalRef = useRefObject(interval)

  const [ keyStateMap ] = useState<Record<keyof ArrowKeyCode, keyof KeyState>>(() => ({
    ArrowUp: KeyState.Released,
    ArrowDown: KeyState.Released,
    ArrowLeft: KeyState.Released,
    ArrowRight: KeyState.Released,
  }))

  useEvent(ref, 'keydown', evt => {
    const code = evt.code
    if (isArrowKeyCode(code)) {
      if (keyStateMap[code] !== KeyState.Pressed) {
        keyStateMap[code] = KeyState.Pressed

        // conflict process
        if (keyStateMap[CounterArrowMap[code]] === KeyState.Pressed) {
          keyStateMap[CounterArrowMap[code]] = KeyState.Conflict
        }

        // direction sync
        syncDirection()
      }
    }
  }, false, deps)

  useEvent(ref, 'keyup', evt => {
    const code = evt.code
    if (isArrowKeyCode(code)) {
      if (keyStateMap[code] !== KeyState.Released) {
        keyStateMap[code] = KeyState.Released

        // conflict process
        if (keyStateMap[CounterArrowMap[code]] === KeyState.Conflict) {
          keyStateMap[CounterArrowMap[code]] = KeyState.Pressed
        }

        // direction sync
        syncDirection()
      }
    }
  }, false, deps)

  // sync direction with the state and reference
  function syncDirection() {
    const direction = getDirectionByKeyStateMap(keyStateMap)
    if (direction !== directionRef.current) {
      directionRef.current = direction
      const isMoving = directionRef.current !== ArrowDirection.none
      setMoving(isMoving)
      restartMove()
      if (isMoving !== movingRef.current) {
        movingRef.current = isMoving
        if (!isMoving) {
          unsubscribe()
        }
      }
    }
  }

  function restartMove() {
    stopMove()
    startMove(FirstDelay)
  }

  function stopMove() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = 0
    }
  }

  function startMove(delay: number) {
    callbackRef.current(directionRef.current)
    timerRef.current = window.setTimeout(() => {
      if (movingRef.current) {
        startMove(intervalRef.current)
      }
    }, delay)
  }

  const unsubscribe: Unsubscribe = useCallback(() => {
    stopMove()
    directionRef.current = ArrowDirection.none
    setMoving(false)
    movingRef.current = false

    keyStateMap.ArrowDown = KeyState.Released
    keyStateMap.ArrowUp = KeyState.Released
    keyStateMap.ArrowLeft = KeyState.Released
    keyStateMap.ArrowRight = KeyState.Released
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (moving && ref) {
      return unsubscribe
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moving && ref])


  return [moving, unsubscribe]
}
