declare module 'react-sparklines' {
  import { ComponentType, CSSProperties } from 'react'

  interface SparklinesProps {
    data: number[]
    limit?: number
    width?: number
    height?: number
    margin?: number
    min?: number
    max?: number
    style?: CSSProperties
    children?: React.ReactNode
  }

  interface SparklinesLineProps {
    color?: string
    style?: CSSProperties
  }

  interface SparklinesCurveProps {
    color?: string
    style?: CSSProperties
  }

  interface SparklinesBarsProps {
    color?: string
    style?: CSSProperties
  }

  interface SparklinesReferenceLinesProps {
    type?: 'max' | 'min' | 'mean' | 'avg' | 'median' | 'custom'
    value?: number
    color?: string
    style?: CSSProperties
  }

  export const Sparklines: ComponentType<SparklinesProps>
  export const SparklinesLine: ComponentType<SparklinesLineProps>
  export const SparklinesCurve: ComponentType<SparklinesCurveProps>
  export const SparklinesBars: ComponentType<SparklinesBarsProps>
  export const SparklinesReferenceLine: ComponentType<SparklinesReferenceLinesProps>
}
