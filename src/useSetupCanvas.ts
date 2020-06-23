import { RefObject, useCallback, useState } from 'react'
import { getElement } from './utils'
import { useResize } from './useResize'
import { useDevicePixelRatio } from './useDevicePixelRatio'

export function useSetupCanvas<
  T extends HTMLCanvasElement = HTMLCanvasElement,
>(
  canvasRef: T | RefObject<T>,
  callback?: (rect: DOMRectReadOnly) => void,
) {
  const [ size, setSize ] = useState({ width: 0, height: 0 }) 
  const [ dpr ] = useDevicePixelRatio()

  useResize(canvasRef, evt => {
    setSize({
      width: Math.round(evt.contentRect.width * dpr),
      height: Math.round(evt.contentRect.height * dpr),
    })
    callback && callback(evt.contentRect)
  }, [ dpr ])

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
