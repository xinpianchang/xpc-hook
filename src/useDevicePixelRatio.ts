import { useState, useEffect, Dispatch, SetStateAction } from 'react'

export function getDevicePixelRatio() {
  return window?.devicePixelRatio ?? 1
}

export function useDevicePixelRatio(ssr = false): [ number, Dispatch<SetStateAction<number>> ] {
  const [ dpr, setDpr ] = useState(ssr ? 1 : getDevicePixelRatio)

  useEffect(() => {
    const mqString = `(resolution: ${dpr}dppx)`
    const query = window.matchMedia(mqString)
    const handleDPRChange = () => setDpr(getDevicePixelRatio())
    handleDPRChange()
    query.addListener(handleDPRChange)
    return () => query.removeListener(handleDPRChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ dpr ])

  return [ dpr, setDpr ]
}
