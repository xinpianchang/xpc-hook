import { useEffect, DependencyList, useMemo } from 'react'
import EventEmitter, { Emitter, Handler, WildcardHandler } from './emitter'
import EventTarget from './eventtarget'

export function once<T extends (...args: any[]) => any>(this: any, fn: T): T {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const _this = this
  let didCall = false
  let result: any

  return function(...args: any[]) {
    if (didCall) {
      return result
    }

    didCall = true
    result = fn.apply(_this, args)

    return result
  } as T
}
/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false

const __is_disposable_tracked__ = '__is_disposable_tracked__'

function markTracked<T extends IDisposable>(x: T): void {
  if (!TRACK_DISPOSABLES) {
    return
  }

  if (x && x !== Disposable.None) {
    try {
      (x as any)[__is_disposable_tracked__] = true
    } catch {
      // noop
    }
  }
}

function trackDisposable<T extends IDisposable>(x: T): T {
  if (!TRACK_DISPOSABLES) {
    return x
  }

  const stack = new Error('Potentially leaked disposable').stack!
  setTimeout(() => {
    if (!(x as any)[__is_disposable_tracked__]) {
      console.log(stack)
    }
  }, 3000)
  return x
}

export interface IDisposable {
  dispose(): void
}

export function isDisposable<E extends object>(thing: E): thing is E & IDisposable {
  return typeof (thing as any as IDisposable).dispose === 'function'
    && (thing as any as IDisposable).dispose.length === 0
}

export function dispose<T extends IDisposable>(disposable: T): T
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined
export function dispose<T extends IDisposable>(disposables: Array<T | undefined>): Array<T>
export function dispose<T extends IDisposable>(disposables: ReadonlyArray<T | undefined>): ReadonlyArray<T>
export function dispose<T extends IDisposable>(disposables: T | T[] | undefined): T | T[] | undefined {
  if (Array.isArray(disposables)) {
    disposables.forEach(d => {
      if (d) {
        markTracked(d)
        d.dispose()
      }
    })
    return []
  } else if (disposables) {
    markTracked(disposables)
    disposables.dispose()
    return disposables
  } else {
    return undefined
  }
}

export function useDisposable<T extends IDisposable>(
  create: () => T,
  deps: DependencyList = [],
) {
  const t = useMemo(() => {
    const disposable = create()
    markTracked(disposable)
    return disposable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  } , deps)
  useEffect(() => () => t.dispose(), [ t ])
  return t
}

export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
  disposables.forEach(markTracked)
  return trackDisposable({dispose: () => dispose(disposables)})
}

export function toDisposable(fn: () => void): IDisposable {
  const self = trackDisposable({
    dispose: () => {
      markTracked(self)
      fn()
    }
  })
  return self
}

export class DisposableStore implements IDisposable {
  private _toDispose = new Set<IDisposable>()
  private _isDisposed = false

  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return
    }

    markTracked(this)
    this._isDisposed = true
    this.clear()
  }

  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  public clear(): void {
    this._toDispose.forEach(item => item.dispose())
    this._toDispose.clear()
  }

  public add<T extends IDisposable>(t: T): T {
    if (!t) {
      return t
    }
    if ((t as any as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }

    markTracked(t)
    if (this._isDisposed) {
      console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack)
    } else {
      this._toDispose.add(t)
    }

    return t
  }
}

export abstract class Disposable implements IDisposable {

  static readonly None = Object.freeze<IDisposable>({
    dispose() {
    }
  })

  private readonly _store = new DisposableStore()

  constructor() {
    trackDisposable(this)
  }

  public dispose(): void {
    markTracked(this)
    this._store.dispose()
  }

  protected _register<T extends IDisposable>(t: T): T {
    if ((t as any as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(t)
  }
}

export interface DisposableEmitter<EventMap extends Record<string, any> = Record<string, any>> extends Emitter<EventMap> {
  readonly events: Events<EventMap>
}

export type DisposableEvent<E = any, U = any> = E extends undefined
  ? <T = U>(listener: (this: T) => any, thisArgs?: T) => IDisposable
  : undefined extends E
    ? <T = U>(listener: (this: T, evt?: E) => any, thisArgs?: T) => IDisposable
    : <T = U>(listener: (this: T, evt: E) => any, thisArgs?: T) => IDisposable

export type Events<EventMap extends Record<string, any>, U = any> = {
  readonly [key in keyof EventMap]: DisposableEvent<EventMap[key], U>
}

export class DisposableEventEmitter<
  EventMap extends Record<string, any> = Record<string, any>
> extends EventEmitter<EventMap> implements DisposableEmitter<EventMap>, IDisposable {

  static readonly None = Disposable.None

  private _events: any
  private readonly _store = new DisposableStore()
  constructor(store?: Parameters<typeof mitt>[0]) {
    super(store)
    trackDisposable(this)
  }

  get events(): Events<EventMap, this> {
    if (this._events) {
      return this._events
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this
    this._events = new Proxy({} as any, {
      get(target, key) {
        if (target[key]) {
          return target[key]
        }
        const type = key as keyof EventMap
        const de = (listener: Function, thisArg: any = _this) => {
          const l = listener.bind(thisArg)
          _this.on(type, l)
          return toDisposable(() => _this.off(type, l))
        }
        target[key] = de
        return de
      }
    })
    return this._events
  }

  protected _registerEvent<E extends keyof EventMap>(type: E, handler: Handler<EventMap, E>): IDisposable
  protected _registerEvent(type: '*', handler: WildcardHandler<EventMap>): IDisposable
  protected _registerEvent(type: string, handler: mitt.Handler | mitt.WildcardHandler) {
    const h = this.events[type] as Function
    return this._store.add(h(handler))
  }

  protected _register<T extends IDisposable>(t: T): T {
    if ((t as any) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(t)
  }

  public dispose() {
    markTracked(this)
    this._store.dispose()
  }
}

export class DisposableEventTarget extends EventTarget implements IDisposable {
  static readonly None = Disposable.None

  private readonly _store = new DisposableStore()

  constructor() {
    super()
    trackDisposable(this)
  }

  public getEvent(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(type, listener, options)
    return toDisposable(() => this.removeEventListener(type, listener, options))
  }

  protected _registerEvent(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    return this._register(this.getEvent(type, listener, options))
  }

  protected _register<T extends IDisposable>(t: T): T {
    if ((t as any) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(t)
  }

  public dispose() {
    markTracked(this)
    this._store.dispose()
  }
}

/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable> implements IDisposable {
  private _value?: T
  private _isDisposed = false

  constructor() {
    trackDisposable(this)
  }

  get value(): T | undefined {
    return this._isDisposed ? undefined : this._value
  }

  set value(value: T | undefined) {
    if (this._isDisposed || value === this._value) {
      return
    }

    if (this._value) {
      this._value.dispose()
    }
    if (value) {
      markTracked(value)
    }
    this._value = value
  }

  clear() {
    this.value = undefined
  }

  dispose(): void {
    this._isDisposed = true
    markTracked(this)
    if (this._value) {
      this._value.dispose()
    }
    this._value = undefined
  }
}

/**
 * Wrapper class that stores a disposable that is not currently "owned" by anyone.
 *
 * Example use cases:
 *
 * - Express that a function/method will take ownership of a disposable parameter.
 * - Express that a function returns a disposable that the caller must explicitly take ownership of.
 */
export class UnownedDisposable<T extends IDisposable> extends Disposable {
  private _hasBeenAcquired = false;
  private _value?: T;

  public constructor(value: T) {
    super()
    this._value = value
  }

  public acquire(): T {
    if (this._hasBeenAcquired) {
      throw new Error('This disposable has already been acquired')
    }
    this._hasBeenAcquired = true
    const value = this._value!
    this._value = undefined
    return value
  }

  public dispose() {
    super.dispose()
    if (!this._hasBeenAcquired) {
      this._hasBeenAcquired = true
      this._value!.dispose()
      this._value = undefined
    }
  }
}

export interface IReference<T> extends IDisposable {
  readonly object: T
}

export abstract class ReferenceCollection<T> {

  private readonly references: Map<string, { readonly object: T; counter: number; }> = new Map();

  acquire(key: string): IReference<T> {
    let reference = this.references.get(key)

    if (!reference) {
      reference = {counter: 0, object: this.createReferencedObject(key)}
      this.references.set(key, reference)
    }

    const {object} = reference
    const dispose = once(() => {
      if (--reference!.counter === 0) {
        this.destroyReferencedObject(key, reference!.object)
        this.references.delete(key)
      }
    })

    reference.counter++

    return {object, dispose}
  }

  protected abstract createReferencedObject(key: string): T;

  protected abstract destroyReferencedObject(key: string, object: T): void;
}

export class ImmortalReference<T> implements IReference<T> {
  constructor(public object: T) {
  }

  dispose(): void { /* noop */
  }
}
