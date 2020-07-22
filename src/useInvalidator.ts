import React from 'react'
import { useRefObject } from './useRefObject'
import { Invalidator } from './invalidator'

export interface OnRenderCallbackOptions<T> {
  target: T
  invalidate: () => void
}

export type OnRenderCallback<T> = (option: OnRenderCallbackOptions<T>) => void

class RenderInvalidator<T = void> extends Invalidator<T> {
  constructor(private renderCallbackRef: React.MutableRefObject<OnRenderCallback<T>>) {
    super()
  }

  public render(target: T) {
    const invalidate = () => this.invalidate(target)
    this.renderCallbackRef.current({target, invalidate})
  }
}

export function useInvalidator<T>(onRender: OnRenderCallback<T>) {
  const renderCallbackRef = useRefObject(onRender)
  const [ invalidator ] = React.useState(() => new RenderInvalidator(renderCallbackRef))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => invalidator.dispose(), [])
  return invalidator
}
