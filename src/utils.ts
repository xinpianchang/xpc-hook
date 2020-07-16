export type ElementOrRef<T extends EventTarget> = T | { readonly current: T | null }

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
  } else if ('dispatchEvent' in selectorsOrElementOrRef) {
    return selectorsOrElementOrRef
  } else {
    return selectorsOrElementOrRef.current
  }
  return null
}

export function getWindow() {
  return typeof window === 'undefined' ? null : window
}

export function getDocument() {
  return typeof document === 'undefined' ? null : document
}

export type Unsubscribe = () => void

export type StateSetter<T> = (prev: T) => T
export type InitSetter<T> = () => T
export type HookState<T> = T | InitSetter<T> | StateSetter<T>

export function resolveState<T>(state: InitSetter<T>): T
export function resolveState<T, E extends T>(state: StateSetter<T>, current: E): T
export function resolveState<T, E extends T>(state: HookState<T>, current?: E): T
export function resolveState<T, E extends T>(state: HookState<T>, current?: E): T {
  if (typeof state === 'function') {
    return (state as Function)(current)
  }
  return state
}
