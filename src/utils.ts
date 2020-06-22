import { RefObject } from 'react'

export type ElementOrRef<T extends EventTarget> = T | RefObject<T>

export function getElement(ref: null): null
export function getElement<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null
export function getElement<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null
export function getElement<E extends HTMLElement = HTMLElement>(selectors: string | null): E | null
export function getElement<T extends EventTarget>(refOrElement: ElementOrRef<T> | null): T | null
export function getElement<T extends EventTarget>(selectorsOrElementOrRef: ElementOrRef<T> | string | null) {
  if (!selectorsOrElementOrRef) {
    return null
  }
  if (typeof selectorsOrElementOrRef === 'string') {
    if (typeof document !== 'undefined') {
      return document.querySelector(selectorsOrElementOrRef)
    }
  } else if ('current' in selectorsOrElementOrRef) {
    return selectorsOrElementOrRef.current
  } else {
    return selectorsOrElementOrRef
  }
  return null
}

export function getWindow() {
  return typeof window === 'undefined' ? null : window
}

export function getDocument() {
  return typeof document === 'undefined' ? null : document
}
