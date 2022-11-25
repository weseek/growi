export interface IGraphViewer {
  lightboxZIndex: number,
  toolbarZIndex: number,
  xml: string,
}

export interface IGraphViewerGlobal {
  processElements: () => void,
  createViewerForElement: (element: Element, callback?: (viewer: IGraphViewer) => void) => void,

  prototype: IGraphViewer,
}
