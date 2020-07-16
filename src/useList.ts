import { useMemo, useRef } from 'react'
import { useUpdate } from './useUpdate'
import { HookState, resolveState } from './utils'

export type ListState<T> = HookState<T[]>

export interface ListActions<T> {
  /**
   * get the current list
   */
  readonly get: () => T[]

  /**
   * get the current list length
   */
  readonly length: number

  /**
   * Set new list instead old one
   */
  readonly set: (newList: ListState<T>) => this

  /**
   * Add item(s) at the end of list
   */
  readonly push: (...items: T[]) => this

  /**
   * Remove item at the end of list
   */
  readonly pop: () => this

  /**
   * Remove item at the first of list
   */
  readonly shift: () => this

  /**
   * Insert new item(s) at the start of list
   */
  readonly unshift: (...items: T[]) => this

  /**
   * Revert the list
   */
  readonly reverse: () => this

  /**
   * Replace item at given position. If item at given position not exists it will be set.
   */
  readonly updateAt: (index: number, item: T) => this

  /**
   * Insert item at given position, all items to the right will be shifted.
   */
  readonly insertAt: (index: number, item: T) => this

  /**
   * Replace all items that matches predicate with given one.
   */
  readonly update: (predicate: (o: T, n: T) => boolean, newItem: T) => this

  /**
   * Replace first item matching predicate with given one.
   */
  readonly updateFirst: (predicate: (o: T, n: T) => boolean, newItem: T) => this

  /**
   * Like `updateFirst` bit in case of predicate miss - pushes item to the list
   */
  readonly upsert: (predicate: (o: T, n: T) => boolean, newItem: T) => this

  /**
   * Sort list with given sorting function
   */
  readonly sort: (compareFn?: (a: T, b: T) => number) => this

  /**
   * Slice list with given start or end index
   */
  readonly slice: (start?: number, end?: number) => this

  /**
   * Splice list with given arguments
   */
  readonly splice: (start: number, deleteCount?: number, ...items: T[]) => this

  /**
   * Same as native Array's method
   */
  readonly filter: <S extends T>(callbackFn: (value: T, index: number, array: T[]) => value is S, thisArg?: any) => this

  /**
   * Removes item at given position. All items to the right from removed will be shifted.
   */
  readonly removeAt: (index: number) => this

  /**
   * Use removeAt method instead
   */
  readonly remove: (index: number) => this

  /**
   * Make the list empty
   */
  readonly clear: () => this

  /**
   * Reset list to initial value
   */
  readonly reset: () => this
}

export function useList<T>(initialList: ListState<T> = []): [T[], ListActions<T>] {
  const list = useRef(resolveState(initialList))
  const update = useUpdate()

  const actions = useMemo<ListActions<T>>(() => {
    const a: ListActions<T> = {
      get: () => {
        return list.current
      },

      get length() {
        return list.current.length
      },

      set: newList => {
        list.current = resolveState(newList, list.current)
        update()
        return a
      },

      push: (...items) => {
        items.length && a.set(curr => curr.concat(items))
        return a
      },

      pop: () => {
        a.length && a.removeAt(list.current.length - 1)
        return a
      },

      shift: () => {
        a.length && a.removeAt(0)
        return a
      },

      unshift: (...items) => {
        items.length && a.splice(0, 0, ...items)
        return a
      },

      reverse: () => {
        a.length && a.set(curr => curr.slice().reverse())
        return a
      },

      updateAt: (index, item) => {
        return a.set(curr => {
          const arr = curr.slice()
          arr[index] = item
          return arr
        })
      },

      insertAt: (index, item) => {
        return a.set(curr => {
          const arr = curr.slice()
          index > arr.length ? (arr[index] = item) : arr.splice(index, 0, item)
          return arr
        })
      },

      update: (predicate, newItem) => {
        a.length && a.set(curr => curr.map(item => (predicate(item, newItem) ? newItem : item)))
        return a
      },

      updateFirst: (predicate, newItem) => {
        const index = list.current.findIndex(item => predicate(item, newItem))
        index >= 0 && a.updateAt(index, newItem)
        return a
      },

      upsert: (predicate, newItem) => {
        const index = list.current.findIndex(item => predicate(item, newItem))
        index >= 0 ? a.updateAt(index, newItem) : a.push(newItem)
        return a
      },

      sort: compareFn => {
        a.length && a.set(curr => curr.slice().sort(compareFn))
        return a
      },

      filter: (callbackFn, thisArg) => {
        a.length && a.set(curr => curr.slice().filter(callbackFn, thisArg))
        return a
      },

      slice: (start, end) => a.set(curr => curr.slice(start, end)),

      splice: (start, deleteCount, ...items) => {
        if (deleteCount === undefined) {
          return a.set(curr => curr.slice().splice(start))
        } else {
          return a.set(curr => curr.slice().splice(start, deleteCount, ...items))
        }
      },

      removeAt: (index: number) => {
        index < a.length && a.splice(index, 1)
        return a
      },

      clear: () => {
        a.length && a.set([])
        return a
      },

      reset: () => a.set(resolveState(initialList).slice()),

      remove: (index: number) => a.removeAt(index),
    }

    return a
  }, [])

  return [list.current, actions]
}
