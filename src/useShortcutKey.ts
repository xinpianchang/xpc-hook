import { useEvent } from './useEvent'
import { useRefObject } from './useRefObject'

interface AcceleratorResult {
  isCmdOrCtrl: boolean
  isCmd: boolean
  isAlt: boolean
  isCtrl: boolean
  isShift: boolean
  key: string
}

interface ShortcutKeyboardEvent extends KeyboardEvent {
  accelerators: string[]
  index: number
}

type ShortcutKeyCallback = (evt: ShortcutKeyboardEvent) => void

function analyze(accelerator: string): AcceleratorResult {
  let isCmdOrCtrl = false, isCmd = false, isAlt = false, isCtrl = false, isShift = false
  let key = 'Unknown'
  accelerator.split('+').forEach(k => {
    switch (k) {
      case 'CmdOrCtrl':
        isCmdOrCtrl = true
        break
      case 'Command':
        isCmd = true
        break
      case 'Control':
        isCtrl = true
        break
      case 'Alt':
        isAlt = true
        break
      case 'Shift':
        isShift = true
        break
      default:
        key = k
        break
    }
  })
  return { isCmdOrCtrl, isCmd, isAlt, isCtrl, isShift, key }
}

function test(e: KeyboardEvent, acceleratorResult: AcceleratorResult) {
  let {isCmdOrCtrl, isCmd, isAlt, isCtrl, isShift, key} = acceleratorResult
  const pressedKey = e.key.toUpperCase() === key.toUpperCase()

  if (!pressedKey) {
    return false
  }

  const isMac = !!navigator.platform.match('Mac')
  const isOnlyMeta = e.metaKey && !e.ctrlKey
  const isOnlyCtrl = !e.metaKey && e.ctrlKey

  const matchCmdOrCtrl = isCmdOrCtrl
    ? (isMac ? isOnlyMeta : isOnlyCtrl)
    : isCtrl === e.ctrlKey && isCmd === e.metaKey

  return matchCmdOrCtrl && e.altKey === isAlt && e.shiftKey === isShift
}

export function useShortcutKeys(
  accelerators: readonly string[],
  callback: ShortcutKeyCallback,
) {
  const acceleratorsRef = useRefObject(accelerators)
  const callbackRef = useRefObject(callback)
  useEvent(document, 'keydown', evt => {
    const accelerators = acceleratorsRef.current
    const callback = callbackRef.current
    const index = accelerators.findIndex(acc => test(evt, analyze(acc)))

    if (index >= 0) {
      callback(Object.assign(evt, { accelerators: accelerators as string[], index }))
    }
  })
}

export function useShortcutKey(
  accelerator: string,
  callback: ShortcutKeyCallback,
): void {
  useShortcutKeys([accelerator], callback)
}


