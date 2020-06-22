import React, { createContext, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export interface ResizeEvent extends Event {
  contentRect: DOMRectReadOnly
}

export interface ResizeObserverProviderProps {
  observer?: ResizeObserver
}

function createResizeObserver() {
  return new ResizeObserver(entries => {
    entries.forEach(entry => {
      if (entry.target) {
        const event = new Event('resize') as ResizeEvent
        event.contentRect = entry.contentRect as DOMRectReadOnly
        entry.target.dispatchEvent(event)
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