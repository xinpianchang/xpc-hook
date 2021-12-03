import { getDocumentRef } from './getDocumentRef'
import { useEvent } from './useEvent'
import { useRefObject } from './useRefObject'
import { TargetRef } from './utils'

type GetChars<S> = GetCharsHelper<S, never>
type GetCharsHelper<S, Acc> = S extends `${infer Char}${infer Rest}` ? GetCharsHelper<Rest, Char | Acc> : Acc

type KeyChar = GetChars<'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'>
type KeyPuncWithoutShift = GetChars<'`-=[]\\;\',./'>
type KeyPuncWithShift = GetChars<'~_+{}|:"<>?)(*&^%$#@!'>
type Key = KeyChar | KeyPuncWithoutShift | KeyPuncWithShift
type WinMacCtrlKey = 'CmdOrCtrl' | 'Command' | 'Control'
type AcceleratorCombine<A extends string, B extends string> = `${A}+${B}`
type AcceleratorModifierWithoutShift = WinMacCtrlKey | 'Alt' | AcceleratorCombine<WinMacCtrlKey, 'Alt'>
type AcceleratorModifierWithShift = 'Shift' | AcceleratorCombine<WinMacCtrlKey | 'Alt', 'Shift'> | AcceleratorCombine<WinMacCtrlKey, AcceleratorCombine<'Alt', 'Shift'>>
type Accelerator = KeyChar | KeyPuncWithoutShift | `${AcceleratorModifierWithoutShift}+${KeyChar | KeyPuncWithoutShift}` | `${AcceleratorModifierWithShift}+${KeyChar | KeyPuncWithShift}`

export interface ShortcutKeyboardEvent extends KeyboardEvent {
  readonly accelerators: readonly Accelerator[]
  readonly index: number
}

export type ShortcutKeyCallback = (evt: ShortcutKeyboardEvent) => void

interface AcceleratorResult {
  isCmdOrCtrl: boolean
  isCmd: boolean
  isAlt: boolean
  isCtrl: boolean
  isShift: boolean
  key: Key | 'Unknown'
}

function analyze(accelerator: Accelerator): AcceleratorResult {
  let isCmdOrCtrl = false, isCmd = false, isAlt = false, isCtrl = false, isShift = false
  let key: Key | 'Unknown' = 'Unknown'
  accelerator.split(/\+(?=.)/).forEach(k => {
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
        key = k as Key
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

  const isMac = !!navigator.userAgent.match('Mac')
  const isOnlyMeta = e.metaKey && !e.ctrlKey
  const isOnlyCtrl = !e.metaKey && e.ctrlKey

  const matchCmdOrCtrl = isCmdOrCtrl
    ? (isMac ? isOnlyMeta : isOnlyCtrl)
    : isCtrl === e.ctrlKey && isCmd === e.metaKey

  return matchCmdOrCtrl && e.altKey === isAlt && e.shiftKey === isShift
}

export function useShortcutKeys(
  accelerators: readonly Accelerator[] | null,
  callback: ShortcutKeyCallback,
  refOrElement: TargetRef<HTMLElement | Document> = getDocumentRef(),
) {
  const acceleratorsRef = useRefObject(accelerators)
  const callbackRef = useRefObject(callback)
  useEvent(refOrElement, 'keydown', evt => {
    if (!acceleratorsRef.current) return
    const accelerators = acceleratorsRef.current
    const callback = callbackRef.current
    const index = accelerators.findIndex(acc => test(evt, analyze(acc)))

    if (index >= 0) {
      callback(Object.assign(evt, { accelerators, index }))
    }
  })
}

export function useShortcutKey(
  accelerator: Accelerator | null,
  callback: ShortcutKeyCallback,
  refOrElement: TargetRef<HTMLElement | Document> = getDocumentRef(),
): void {
  useShortcutKeys(accelerator ? [accelerator] : null, callback, refOrElement)
}
