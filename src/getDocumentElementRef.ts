import React from 'react'
import { getDocumentElement } from './utils'

export const documentElementRef: React.RefObject<HTMLElement> = {
  current: getDocumentElement()
}

export function getDocumentElementRef() {
  return documentElementRef
}
