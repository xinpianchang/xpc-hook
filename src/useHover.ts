import React, { useState, RefObject } from 'react'
import { useEvent } from './useEvent'
import { useClickAway } from './useClickAway'

export function useHover<T extends HTMLElement>(
  refOrElement: T | RefObject<T> | null,
  supportTouch = false
): [ boolean, React.Dispatch<React.SetStateAction<boolean>> ] {
  const [hover, setHover] = useState(false)
  const enter = () => setHover(true)
  const leave = () => setHover(false)
  useEvent(refOrElement, 'mouseenter', enter)
  useEvent(refOrElement, 'mouseleave', leave)

  useClickAway(supportTouch ? refOrElement : null, leave)
  useEvent(supportTouch ? refOrElement : null, ['click', 'touchstart'], enter)

  return [ hover, setHover ]
}
