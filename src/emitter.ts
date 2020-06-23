import mitt, { Emitter as BaseEmitter } from 'mitt'
import { useState, useMemo, useEffect, DependencyList, Dispatch, SetStateAction } from 'react'

/**
 * the event map magic logic, with undefined event type
 * the signaure will exclude the event argument
 */
type GetUndefined<T, E> = E extends keyof T
  ? T[E] extends undefined
    ? Record<E, any> : object
  : object

/**
 * the event map magic logic, with optional event type
 * the signaure will make the event argument optional
 */
type GetOptional<T, E> = E extends keyof T
  ? undefined extends T[E]
    ? Record<E, any> : object
  : object

type GetEvent<E, P> = P extends keyof E
  ? E[P]
  : never

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
type DefaultEM = Record<string, any>

export type When<EventMap extends DefaultEM, E extends keyof EventMap> = EventMap[E] extends undefined
  ? () => boolean
  : undefined extends EventMap[E]
    ? (event?: EventMap[E]) => boolean
    : (event: EventMap[E]) => boolean

export type WildcardWhen<EventMap extends DefaultEM> = <E extends keyof EventMap>(
  type: E, event: EventMap[E]) => boolean

export type Handler<EventMap extends DefaultEM, E extends keyof EventMap> = EventMap[E] extends undefined
  ? () => void
  : undefined extends EventMap[E]
    ? (event?: EventMap[E]) => void
    : (event: EventMap[E]) => void

export type WildcardHandler<EventMap extends DefaultEM> = <E extends keyof EventMap>(
  type: E, event?: EventMap[E]) => void

export type ResolverFn<T, EventMap extends DefaultEM, E extends keyof EventMap> = undefined extends EventMap[E]
  ? (setState: SetState<T>, event?: EventMap[E]) => void
  : (setState: SetState<T>, event: EventMap[E]) => void

export type WildcardResolverFn<T, EventMap extends DefaultEM> = <E extends keyof EventMap>(
  setState: SetState<T>, type: E, event?: EventMap[E]) => void

export interface UpdateHooker<EventMap extends Record<string, any>> {
  useUpdateWhen<E extends keyof EventMap>(type: E, dependsOn?: When<EventMap, E>): void
  useUpdateWhen(type: '*', dependsOn?: WildcardWhen<EventMap>): void
}

export interface ListenerHooker<EventMap extends Record<string, any>> {
  useListener<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>, deps?: DependencyList): void
  useListener(type: '*', handler: WildcardHandler<EventMap>, deps?: DependencyList): void
}

export interface AsyncStateHooker<EventMap extends Record<string, any>> {
  useStateWhen<T, E extends keyof EventMap>(type: E, resolveFn: ResolverFn<T, EventMap, E>, initState: T | (() => T), deps?: DependencyList): [ T, Dispatch<SetStateAction<T>> ]
  useStateWhen<T>(type: '*', resolveFn: WildcardResolverFn<T, EventMap>, initState: T | (() => T), deps?: DependencyList): [ T, Dispatch<SetStateAction<T>> ]
}

export interface MemoHooker<EventMap extends Record<string, any>> {
  useMemoWhen<T, E extends keyof EventMap>(type: E, resolveFn: () => T, deps?: DependencyList): T
  useMemoWhen<T>(type: '*', resolveFn: () => T, deps?: DependencyList): T
}

export interface Emitter<EventMap extends DefaultEM = Record<string, any>> {
  on<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>): void
  on(type: '*', handler: WildcardHandler<EventMap>): void

  off<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>): void
  off(type: '*', handler: WildcardHandler<EventMap>): void

  emit<E extends keyof GetUndefined<EventMap, E>>(type: E): void
  emit<E extends keyof GetOptional<EventMap, E>>(type: E, event?: GetEvent<EventMap, E>): void
  emit<E extends keyof EventMap, F extends EventMap[E]>(type: E, event: F): void
}

const DEFAULT_WHEN = () => true

export default class EventEmitter<
  EventMap extends Record<string, any> = Record<string, any>
> implements Emitter<EventMap>,
    UpdateHooker<EventMap>,
    ListenerHooker<EventMap>,
    AsyncStateHooker<EventMap> {

  protected emitter: BaseEmitter
  constructor(store?: Parameters<typeof mitt>[0]) {
    this.emitter = mitt(store)
  }

  on<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>): void
  on(type: '*', handler: WildcardHandler<EventMap>): void
  on(type: string, handler: mitt.Handler | mitt.WildcardHandler) {
    this.emitter.on(type, handler)
  }

  off<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>): void
  off(type: '*', handler: WildcardHandler<EventMap>): void
  off(type: string, handler: mitt.Handler | mitt.WildcardHandler) {
    this.emitter.off(type, handler)
  }

  emit<E extends keyof GetUndefined<EventMap, E>>(type: E): void
  emit<E extends keyof GetOptional<EventMap, E>>(type: E, event?: GetEvent<EventMap, E>): void
  emit<E extends keyof EventMap, F extends EventMap[E]>(type: E, event: F): void
  emit(type: string, event?: any) {
    this.emitter.emit(type, event)
  }

  useUpdateWhen<E extends keyof EventMap>(type: E, dependsOn?: When<EventMap, E>, deps?: DependencyList): void
  useUpdateWhen(type: '*', dependsOn?: WildcardWhen<EventMap>, deps?: DependencyList): void
  useUpdateWhen(type: string, dependsOn: (...args: any[]) => boolean = DEFAULT_WHEN, deps: DependencyList = []) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [, update] = useState(0)
    let listener: mitt.Handler | mitt.WildcardHandler
    if (type === '*') {
      listener = (type?: string, event?: any) => {
        dependsOn(type, event) && update(cnt => cnt + 1)
      }
    } else {
      listener = (event?: any) => {
        dependsOn(event) && update(cnt => cnt + 1)
      }
    }
    this.useListener(type, listener as any, deps)
  }

  useListener<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>, deps?: DependencyList): void
  useListener(type: '*', handler: WildcardHandler<EventMap>, deps?: DependencyList): void
  useListener(type: string, handler: any, deps: DependencyList = []) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const h = handler
      this.on(type, h)
      return () => this.off(type, h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ type, ...deps ])
  }

  useStateWhen<T, E extends keyof EventMap>(type: E, resolveFn: ResolverFn<T, EventMap, E>, initState: T | (() => T), deps?: DependencyList): [ T, Dispatch<SetStateAction<T>> ]
  useStateWhen<T>(type: '*', resolveFn: WildcardResolverFn<T, EventMap>, initState: T | (() => T), deps?: DependencyList): [ T, Dispatch<SetStateAction<T>> ]
  useStateWhen<T>(type: string, resolveFn: Function, initState: T | (() => T), deps: DependencyList = []) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [ state, setState ] = useState<T>(initState)
    const listener = resolveFn.bind(null, setState)
    this.useListener(type, listener, deps)
    return [ state, setState ] as [ T, Dispatch<SetStateAction<T>> ]
  }


  useMemoWhen<T, E extends keyof EventMap>(type: E, resolveFn: () => T, deps?: DependencyList): T
  useMemoWhen<T>(type: '*', resolveFn: () => T, deps?: DependencyList): T
  useMemoWhen<T>(type: string, resolveFn: () => T, deps: DependencyList = []) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [ state, setState ] = useState<T>(resolveFn)
    const listener = () => setState(resolveFn())
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(listener, deps)
    this.useListener(type, listener as any, deps)
    return state
  }
}

export { EventEmitter }

// test type script

// const a = new EventEmitter<{a?: number, b:number, c:undefined, d: any}>()
// const b = new EventEmitter()

// a.on('a', e => { console.log(e) }) // number | undefined
// a.on('a', () => {})
// a.emit('a')
// a.emit('a', 4)
// a.useStateWhen('a', set => set({ a: 3 }), { a: 2 })

// b.on('23', (e) => {})
// b.emit('2ff')
// b.emit('dfdsf', 'dfdf')
// b.useStateWhen('d', (set) => set(4), 3)

// type M = keyof any

// a.on('b', e => { console.log(e) }) // number
// a.on('b', () => {})
// a.emit('b', 3)
// a.emit('b') // throw error, must give the second arg

// a.on('c', () => {})
// a.on('c', e => {}) // throw error there is no e
// a.emit('c')
// a.emit('c', 2) // throw error, there is no second arg

// a.on('d', e => {})
// a.on('d', () => {})
// a.emit('d', 3)
// a.emit('d')