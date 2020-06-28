import React, { createContext, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export interface ResizeEvent extends Event {
  contentRect: DOMRectReadOnly
}

export interface ResizeObserverProviderProps {
  observer?: ResizeObserver
}

type Target = Element & { __resize_event__: boolean }

function isDispatchingResizeEvent(target: Target) {
  return target.__resize_event__ === true
}

function createResizeObserver() {
  return new ResizeObserver(entries => {
    entries.forEach(entry => {
      if (entry.target) {
        const target = entry.target as Target
        if (!isDispatchingResizeEvent(target)) {
          target.__resize_event__ = true
          const event = new Event('resize') as ResizeEvent
          event.contentRect = entry.contentRect as DOMRectReadOnly
          entry.target.dispatchEvent(event)
          delete target.__resize_event__
        }
      }
    })
  })
}

const ResizeObserverContext = createContext<ResizeObserver>(createResizeObserver())
const ResizeObserverProvider: React.FC<ResizeObserverProviderProps> = ({ observer = createResizeObserver(), children }) => {
  useEffect(() => () => observer.disconnect(), [ observer ])
  return <ResizeObserverContext.Provider value={observer}>
    {children}
  </ResizeObserverContext.Provider>
}

export { ResizeObserverContext, ResizeObserverProvider }
