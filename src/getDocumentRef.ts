import React from 'react'
import { getDocument } from './utils'

export const documentRef: React.RefObject<Document> = {
  current: getDocument()
}

export function getDocumentRef() {
  return documentRef
}
