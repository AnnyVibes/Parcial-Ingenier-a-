/// <reference types="vite/client" />
import 'react'

declare global {
  // React 19 ya no exporta JSX como global; lo re-exponemos para los componentes existentes.
  namespace JSX {
    type Element = React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
    type IntrinsicElements = React.JSX.IntrinsicElements
    interface ElementChildrenAttribute {
      children: object
    }
  }
}

export {}
