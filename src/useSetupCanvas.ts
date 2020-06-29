import { RefObject, useCallback, useState } from 'react'
import { getElement } from './utils'
import { useResize } from './useResize'
import { useDevicePixelRatio } from './useDevicePixelRatio'

export type Setup = () => void

/**
 * return a setup callback for canvas
 * @returns setup callback
 * 
 * invoke this callback before you are ready to draw canvas.
 * this callback value will change upon canvas resized or changed, or devicePixelRatio changed
 */
export function useSetupCanvas<
  T extends HTMLCanvasElement = HTMLCanvasElement,
>(
  canvasRef: T | RefObject<T>,
  callback?: (rect: DOMRectReadOnly) => void,
): Setup {
  const [ size, setSize ] = useState({ width: 0, height: 0 }) 
  const [ dpr ] = useDevicePixelRatio()

  useResize(canvasRef, evt => {
    setSize({
      width: Math.round(evt.contentRect.width * dpr),
      height: Math.round(evt.contentRect.height * dpr),
    })
    callback && callback(evt.contentRect)
  })

  return useCallback(() => {
    const { width, height } = size
    const canvas = getElement(canvasRef)
    if (canvas && (canvas.width !== width || canvas.height !== height)) {
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = width
        canvas.height = height
        context.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }
  }, [canvasRef, size, dpr])
}
