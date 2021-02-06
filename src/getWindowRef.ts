import React from 'react'
import { getWindow } from './utils'

export const windowRef: React.RefObject<Window> = {
  current: getWindow()
}

export function getWindowRef() {
  return windowRef
}
