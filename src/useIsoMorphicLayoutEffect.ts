import { useLayoutEffect, useEffect } from 'react'

export const useIsoMorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
