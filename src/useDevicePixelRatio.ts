import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { useServerHandoffComplete } from './useServerHandoffComplete'

export function getDevicePixelRatio() {
  return typeof devicePixelRatio === 'number' ? devicePixelRatio : 1
}

export function useDevicePixelRatio(): [ number, Dispatch<SetStateAction<number>> ] {
  const [ dpr, setDpr ] = useState(useServerHandoffComplete() ? getDevicePixelRatio : 1)

  useEffect(() => {
    const mqString = `(resolution: ${dpr}dppx)`
    const query = matchMedia(mqString)
    const handleDPRChange = () => setDpr(getDevicePixelRatio())
    handleDPRChange()
    query.addEventListener('change', handleDPRChange, false)
    return () => query.removeEventListener('change', handleDPRChange, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ dpr ])

  return [ dpr, setDpr ]
}
