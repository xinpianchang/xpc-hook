import React from 'react'
import { useRefObject } from './useRefObject'
import { CanvasInvalidator } from './canvasInvalidator'

export type DrawCallback = (
  ctx: CanvasRenderingContext2D,
  invalidate: () => void,
) => void

class DrawInvalidator extends CanvasInvalidator {
  constructor(private drawCallbackRef: React.MutableRefObject<DrawCallback>) {
    super()
  }

  protected onDraw(ctx: CanvasRenderingContext2D, invalidate: () => void) {
    this.drawCallbackRef.current(ctx, invalidate)
  }
}

export function useCanvasInvalidator(onDraw: DrawCallback) {
  const drawCallbackRef = useRefObject(onDraw)
  const [ invalidator ] = React.useState(() => new DrawInvalidator(drawCallbackRef))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => invalidator.dispose(), [])
  return invalidator
}
