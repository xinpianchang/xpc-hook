export interface ListenerTarget {
  target: EventTarget
  listener: EventListenerOrEventListenerObject | null
  options?: boolean | AddEventListenerOptions
}

function define(target: any, name: string | symbol, value: any) {
  Object.defineProperty(
    target,
    name,
    {
      enumerable: true,
      configurable: true,
      writable: true,
      value: value
    }
  )
}

function dispatch(this: Event, info: ListenerTarget) {
  let options = info.options
  if (typeof options === 'object' && options.once) {
    info.target.removeEventListener(this.type, info.listener)
  }
  if (typeof info.listener === 'function') {
    info.listener.call(info.target, this)
  } else if (info.listener) {
    info.listener.handleEvent(this)
  }
}

function isOptionsTheSame(opt1?: boolean | AddEventListenerOptions, opt2?: boolean | AddEventListenerOptions) {
  if (opt1 === opt2) return true
  const capture1 = typeof opt1 === 'boolean' ? opt1 : typeof opt1 === 'object' ? !!opt1.capture : false
  const capture2 = typeof opt2 === 'boolean' ? opt2 : typeof opt2 === 'object' ? !!opt2.capture : false
  return capture1 === capture2
}

const SYM_LISTENER = Symbol('event-target-listeners')

export default class EventTarget implements EventTarget {
  private [SYM_LISTENER]: Record<string, Array<ListenerTarget>> = Object.create(null)

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    let secret = this[SYM_LISTENER]
    let listeners = secret[type] || (secret[type] = [])
    if (listeners.find(l => l.listener === listener && isOptionsTheSame(l.options, options))) {
      return
    }
    listeners.push({ target: this, listener, options })
  }

  dispatchEvent(event: Event) {
    let secret = this[SYM_LISTENER]
    let listeners = secret[event.type]
    if (listeners && listeners.length) {
      define(event, 'target', this)
      define(event, 'currentTarget', this)
      listeners.forEach(dispatch, event)
      delete (event as any).currentTarget
      delete (event as any).target
      return true
    }
    return false
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    let secret = this[SYM_LISTENER]
    let listeners = secret[type] || (secret[type] = [])
    let index = listeners.findIndex(l => l.listener === listener && isOptionsTheSame(l.options, options))
    if (index >= 0) {
      listeners.splice(index, 1)
    }
  }
}