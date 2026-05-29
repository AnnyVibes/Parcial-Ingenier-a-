/// <reference types="vite/client" />
import 'react'

declare global {
  namespace JSX {
    type Element = React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
    type IntrinsicElements = React.JSX.IntrinsicElements
    interface ElementChildrenAttribute {
      children: object
    }
  }
}

export {}
