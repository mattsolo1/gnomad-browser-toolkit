import { ReactNode, ComponentType, Context } from 'react'

export interface Region {
  start: number
  stop: number
}

export interface RegionViewerProps {
  width: number
  leftPanelWidth?: number
  regions: Region[]
  rightPanelWidth?: number
  reverseRegions?: boolean
  gap?: number
  children?: ReactNode
}

export declare const RegionViewer: ComponentType<RegionViewerProps>

export interface RegionViewerContextType {
  centerPanelWidth: number
  isPositionDefined: (pos: number) => boolean
  leftPanelWidth: number
  regions: Region[]
  rightPanelWidth: number
  scalePosition: {
    (position: number): number
    invert: (x: number) => number
  }
}

export declare const RegionViewerContext: Context<RegionViewerContextType>

export interface TrackProps {
  children: (props: {
    centerPanelWidth: number
    isPositionDefined: (pos: number) => boolean
    leftPanelWidth: number
    regions: Region[]
    rightPanelWidth: number
    scalePosition: {
      (position: number): number
      invert: (x: number) => number
    }
    width: number
    [key: string]: any
  }) => ReactNode
  renderLeftPanel?: (props: { width: number;[key: string]: any }) => ReactNode
  renderRightPanel?: (props: { width: number;[key: string]: any }) => ReactNode
  renderTopPanel?: (props: { width: number;[key: string]: any }) => ReactNode
  [key: string]: any
}

export declare const Track: ComponentType<TrackProps>

export interface PositionAxisProps {
  scalePosition: {
    (position: number): number
    invert: (x: number) => number
  }
  width: number
}

export declare const PositionAxis: ComponentType<PositionAxisProps>

export declare const PositionAxisTrack: ComponentType<any>

export interface CursorProps {
  children?: ReactNode
  onClick: (pos: number) => void
  renderCursor?: (x: number) => ReactNode
}

export declare const Cursor: ComponentType<CursorProps>