import { useState, useEffect } from 'react'

const state = { serverHandoffComplete: false }

/**
 * 判断此次渲染是否在 server 渲染完成后，即 hydration 前还是 hydration 之后
 * @returns true 表示已经完成 hydration 渲染
 */
export function useServerHandoffComplete() {
  let [serverHandoffComplete, setServerHandoffComplete] = useState(state.serverHandoffComplete)

  useEffect(() => {
    if (serverHandoffComplete === true) return

    setServerHandoffComplete(true)
  }, [serverHandoffComplete])

  useEffect(() => {
    if (state.serverHandoffComplete === false) state.serverHandoffComplete = true
  }, [])

  return serverHandoffComplete
}
