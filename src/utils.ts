/** @deprecated use `TargetRef<T>` or `TargetRef` instead */
export type ElementOrRef<T extends EventTarget> = NonNullable<TargetRef<T>>

/**
 * Implies the a reference type of a event target or event target it self
 */
export type TargetRef<T extends EventTarget = EventTarget> = T | null | { readonly current: T | null }

/**
 * Infer the event target type from a `TargetRef` or a selector string,
 * specifically the selector string will be targeted to `Element`
 */
export type InferTargetRef<T> = T extends string ? Element : T extends object & { current: infer R | null } ? R : NonNullable<T>

export function getElement(ref: null): null
/**
 * Get the html element from a html selector
 * @param selectors html tag selector
 */
export function getElement<K extends keyof HTMLElementTagNameMap>(selectors: K | null): HTMLElementTagNameMap[K] | null
/**
 * Get the svg element from a svg selector
 * @param selectors svg tag selector
 */
export function getElement<K extends keyof SVGElementTagNameMap>(selectors: K | null): SVGElementTagNameMap[K] | null
/**
 * Get the underneath event target object from a target ref or a selector string
 * @param ref a target ref or a selector string
 */
export function getElement<T extends TargetRef | string>(refOrElement: T): InferTargetRef<T> | null
export function getElement<T extends EventTarget>(selectorsOrElementOrRef: TargetRef<T> | string) {
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

/**
 * Get the root html ref
 * @returns html element ref
 */
export function getDocumentElement() {
  return typeof document === 'undefined' ? null : document.documentElement
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
